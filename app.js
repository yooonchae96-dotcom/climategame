// ============================================================
// 기후 불평등 게임 - 화면 로직 (학생 태블릿 + 교사 전자칠판)
// ============================================================
(async function () {
  const CFG = window.CONFIG || {};
  const $ = id => document.getElementById(id);
  const E = window.ENGINE;
  const ROUNDS = 10;
  const PHASE_LABEL = { lobby: "대기실", choosing: "선택 중", reveal: "결과 공개", final: "최종 결과" };
  const DIS_EMOJI = ["🌡️", "🌧️", "🌀", "⛺", "🏜️", "🔥", "🌊", "🦟", "❄️", "🧳", "🌪️", "🚰", "👷", "🧊", "🪓", "🍞", "🏫", "📄", "🌾", "🏛️"];

  const { db, mode, label: modeLabel } = await connectStore();
  // 소리 버튼 + 모든 버튼 클릭음
  const soundBtn = $("btn-sound");
  const paintSound = () => { soundBtn.textContent = SOUND.enabled ? "🔊" : "🔇"; soundBtn.classList.toggle("off", !SOUND.enabled); };
  paintSound();
  soundBtn.classList.add("hidden");
  soundBtn.onclick = () => { SOUND.toggle(); paintSound(); if (SOUND.enabled) SOUND.sfx("click"); };
  document.addEventListener("click", e => { const b = e.target.closest("button"); if (b && b !== soundBtn && !b.classList.contains("option")) SOUND.sfx("click"); }, true);
  $("store-mode").textContent = modeLabel;

  // ---------------- 공통 도우미 ----------------
  const charOf = id => CHARACTERS.find(c => c.id === id);
  const scenarioOf = id => SCENARIOS.find(s => s.id === id);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  const sign = v => (v > 0 ? "+" : "") + v;
  const imgSrc = p => (window.IMAGES && window.IMAGES[p]) || p; // 아티팩트에서는 내장 이미지 사용
  function show(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active")); $(id).classList.add("active");
    if (id !== "screen-board") SOUND.bgm(null);
  }
  function showStep(root, id) { root.querySelectorAll(".step").forEach(s => s.classList.remove("active")); $(id).classList.add("active"); }
  function setAccent(color) { document.documentElement.style.setProperty("--accent", color); }
  function avatar(ch, size) {
    return `<div class="avatar" style="background:${ch.color}${size ? `;width:${size}px;height:${size}px` : ""}"><img src="${imgSrc(`images/char_${String(ch.id).padStart(2, "0")}.png`)}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'${ch.name[0]}'}))"></div>`;
  }
  function statsHTML(st, mini) {
    const row = (cls, l, v, max) => `<div class="stat stat-${cls}"><span>${l}</span><div class="stat-bar"><div class="stat-fill" style="width:${Math.min(100, v / max * 100)}%"></div></div><span class="stat-num">${v}</span></div>`;
    return row("money", mini ? "재산" : "💰 재산", st.money, Math.max(st.start, 1)) + row("body", mini ? "몸" : "❤️ 몸", st.body, 100) + row("mind", mini ? "마음" : "💙 마음", st.mind, 100);
  }
  function disasterImg(sc) { return `<img src="${imgSrc(sc.image)}" alt="" onerror="this.replaceWith(document.createTextNode('${DIS_EMOJI[sc.id - 1] || "🌍"}'))">`; }
  const sessionRef = code => db.doc("sessions/" + code);
  const playersRef = code => db.collection("sessions/" + code + "/players");
  const reflectionsRef = () => db.collection("reflections");
  // 특정 라운드 직전의 상태: 그 전 라운드 결과에 저장된 state, 없으면 시작 상태
  function stateBefore(session, pid, chId, round) {
    for (let r = round - 1; r >= 0; r--) { const res = session.results && session.results["r" + r] && session.results["r" + r][pid]; if (res) return Object.assign({}, res.state); }
    return E.newState(charOf(chId));
  }
  function latestState(session, pid, chId) { return stateBefore(session, pid, chId, ROUNDS); }
  const choiceLabel = i => ["가", "나", "다"][i] || "";

  // ================================================================
  //  학생
  // ================================================================
  let S = { code: null, pid: null, player: null, session: null, unsubS: null, unsubP: null, lastPhaseKey: null, chosen: null };
  try { S.pid = sessionStorage.getItem("cg-pid"); } catch (e) {}
  if (!S.pid) { S.pid = "p" + Math.random().toString(36).slice(2, 10); try { sessionStorage.setItem("cg-pid", S.pid); } catch (e) {} }

  $("btn-role-student").onclick = () => { show("screen-join"); $("input-code").focus(); };
  $("btn-join-back").onclick = () => show("screen-start");
  $("btn-join").onclick = joinSession;
  $("input-nickname").addEventListener("keydown", e => { if (e.key === "Enter") joinSession(); });

  async function joinSession() {
    const code = $("input-code").value.trim();
    const nick = $("input-nickname").value.trim();
    if (!/^\d{4}$/.test(code)) { $("join-error").textContent = "수업 코드는 숫자 4자리입니다."; return; }
    if (nick.length < 2 || nick.length > 10) { $("join-error").textContent = "닉네임은 2~10글자로 적어 주세요."; return; }
    $("join-error").textContent = "확인 중...";
    const snap = await sessionRef(code).get();
    if (!snap.exists) { $("join-error").textContent = "그 코드의 수업이 없습니다. 선생님 화면의 코드를 다시 확인하세요."; return; }
    const session = snap.data();
    const pdoc = playersRef(code).doc(S.pid);
    const mine = await pdoc.get();
    if (!mine.exists) {
      // 캐릭터 배정: 가장 적게 쓰인 캐릭터 중 무작위
      const all = await playersRef(code).get();
      const used = {}; all.docs.forEach(d => { const c = d.data().charId; used[c] = (used[c] || 0) + 1; });
      const min = Math.min(...CHARACTERS.map(c => used[c.id] || 0));
      const pool = CHARACTERS.filter(c => (used[c.id] || 0) === min);
      const ch = pool[Math.floor(Math.random() * pool.length)];
      await pdoc.set({ nickname: nick, charId: ch.id, isBot: false, joinedAt: new Date().toISOString(), choices: {} });
    } else if (mine.data().nickname !== nick) {
      await pdoc.update({ nickname: nick });
    }
    S.code = code;
    try { sessionStorage.setItem("cg-code", code); } catch (e) {}
    startStudent();
  }

  function startStudent() {
    SOUND.mute(true); soundBtn.classList.add("hidden");
    show("screen-student");
    if (S.unsubS) S.unsubS();
    if (S.unsubP) S.unsubP();
    S.unsubP = playersRef(S.code).doc(S.pid).onSnapshot(s => { if (s.exists) { S.player = s.data(); renderStudent(); } });
    S.unsubS = sessionRef(S.code).onSnapshot(s => { if (s.exists) { S.session = s.data(); renderStudent(); } });
  }

  function renderStudent() {
    const p = S.player, ss = S.session;
    if (!p || !ss) return;
    const ch = charOf(p.charId);
    setAccent(ch.color);
    const st = latestState(ss, S.pid, p.charId);
    $("s-mini").innerHTML = avatar(ch) + `<span>${ch.name}</span><span class="hint">· ${esc(p.nickname)}</span>`;
    $("s-round").textContent = ss.phase === "lobby" ? "대기 중" : ss.phase === "final" ? "최종 결과" : `${ss.round + 1} / ${ROUNDS} · ${PHASE_LABEL[ss.phase]}`;
    $("status-stats").innerHTML = statsHTML(st);
    $("status-history").innerHTML = historyHTML(ss, S.pid) || `<p class="hint">아직 겪은 재난이 없습니다.</p>`;

    const key = ss.phase + ":" + ss.round;
    const root = $("screen-student");
    const changed = S.lastPhaseKey !== key;
    if (ss.phase === "lobby") {
      renderCharCard(ch, st);
      showStep(root, "s-step-wait");
    } else if (ss.phase === "choosing") {
      if (changed) { S.chosen = p.choices && p.choices["r" + ss.round]; renderChoose(ss, ch, st); }
      else { const c = p.choices && p.choices["r" + ss.round]; if (c !== undefined && c !== S.chosen) { S.chosen = c; markChosen(); } }
      showStep(root, "s-step-choose");
    } else if (ss.phase === "reveal") {
      renderReveal(ss, ch, changed);
      showStep(root, "s-step-reveal");
    } else if (ss.phase === "final") {
      if (changed) renderFinal(ss, ch);
      if (!$("s-step-done").classList.contains("active")) showStep(root, "s-step-final");
    }
    S.lastPhaseKey = key;
  }

  function renderCharCard(ch, st) {
    $("char-portrait").style.background = ch.color;
    $("char-portrait").innerHTML = `<img src="${imgSrc(`images/char_${String(ch.id).padStart(2, "0")}.png`)}" alt="${ch.name}">`;
    $("char-portrait").querySelector("img").onerror = function () { this.replaceWith(Object.assign(document.createElement("div"), { className: "portrait-fallback", textContent: ch.name[0] })); };
    $("char-name").textContent = ch.name;
    $("char-age").textContent = `${ch.age}세 · ${ch.sex}`;
    $("char-place").textContent = ch.place;
    $("char-traits").innerHTML = ch.traits.map(t => `<li>${t}</li>`).join("");
    $("char-strength").textContent = ch.strength;
    $("char-stats").innerHTML = statsHTML(st);
    $("wait-note").classList.add("pulse");
  }

  function renderChoose(ss, ch, st) {
    const sc = scenarioOf(ss.scenarioIds[ss.round]);
    const c = Object.assign({}, ch, { money: st.money, body: st.body, mind: st.mind });
    $("s-disaster").innerHTML = `<div class="d-img">${disasterImg(sc)}</div><div><div class="d-where">${sc.where}</div><h3>${sc.title}</h3><p>${sc.story}</p></div>`;
    $("situation-text").textContent = sc.situation(c);
    const status = E.optionStatus(ch, st, sc);
    $("options").innerHTML = status.map(o => `<button class="option ${o.lock ? "locked" : ""}" data-i="${o.index}" ${o.lock ? "disabled" : ""}><span class="opt-no">${choiceLabel(o.index)}</span><span>${o.text}</span>${o.lock ? `<span class="lock-reason">🔒 ${o.lock}</span>` : ""}</button>`).join("");
    $("options").querySelectorAll(".option:not(.locked)").forEach(b => b.onclick = () => submitChoice(+b.dataset.i));
    markChosen();
  }
  function markChosen() {
    const done = S.chosen !== undefined && S.chosen !== null;
    $("options").querySelectorAll(".option").forEach(b => { b.classList.toggle("chosen", +b.dataset.i === S.chosen); });
    $("submitted-box").classList.toggle("hidden", !done);
  }
  async function submitChoice(idx) {
    S.chosen = idx; markChosen();
    const upd = {}; upd["choices.r" + S.session.round] = idx;
    // 중첩 필드 갱신: 백엔드마다 다르므로 choices 객체 전체를 다시 씀
    const choices = Object.assign({}, S.player.choices || {}); choices["r" + S.session.round] = idx;
    try { await playersRef(S.code).doc(S.pid).update({ choices }); } catch (e) { $("submitted-box").textContent = "제출에 실패했습니다. 다시 눌러 주세요."; $("submitted-box").classList.remove("hidden"); }
  }

  function renderReveal(ss, ch, first) {
    const r = ss.round, sc = scenarioOf(ss.scenarioIds[r]);
    const results = ss.results && ss.results["r" + r];
    if (!results) return;
    const mine = results[S.pid];
    if (!mine) { $("result-why").textContent = "이번 라운드에 참가하지 못했습니다."; return; }
    if (first) {
      const bad = mine.dm + mine.db + mine.ds < 0;
      if (bad) { $("screen-student").classList.add("flash"); setTimeout(() => $("screen-student").classList.remove("flash"), 600); }
    }
    $("result-choice").textContent = `${sc.title} · 내 선택: ${mine.text}${mine.substituted ? " (제출하지 않아 자동 처리됨)" : ""}`;
    const d = (v, l) => `<div class="delta ${v < 0 ? "neg" : v > 0 ? "pos" : "zero"}">${sign(v)}<small>${l}</small></div>`;
    $("result-deltas").innerHTML = d(mine.dm, "💰 재산") + d(mine.db, "❤️ 몸") + d(mine.ds, "💙 마음");
    $("result-why").textContent = mine.why;
    const list = Object.entries(results).map(([pid, x]) => ({ pid, loss: x.loss })).sort((a, b) => b.loss - a.loss);
    const pos = list.findIndex(x => x.pid === S.pid) + 1;
    $("class-pos").textContent = `이번 라운드에서 우리 반 ${list.length}명 중 ${pos}번째로 많이 잃었어요.`;
    $("s-ineq").innerHTML = ineqHTML(results, ss);
  }

  function renderFinal(ss, ch) {
    const ranking = finalRanking(ss);
    const me = ranking.find(x => x.pid === S.pid);
    const myRank = ranking.findIndex(x => x.pid === S.pid) + 1;
    $("my-final").innerHTML = me ? `<div style="display:flex;gap:12px;align-items:center">${avatar(ch, 90)}<div><div class="big-rank">${myRank}등 <small style="font-size:18px">/ ${ranking.length}</small></div><div>${ch.name} · ${esc(S.player.nickname)}</div><div class="score-line">총점 ${me.score.total} = 재산 ${me.score.moneyScore} + 몸 ${me.state.body} + 마음 ${me.state.mind}</div></div></div>` + statsHTML(me.state) : "";
    qIdx = 0; renderQuestion();
    $("reflection-error").textContent = "";
  }

  function historyHTML(ss, pid) {
    const rows = [];
    for (let r = 0; r < ROUNDS; r++) {
      const res = ss.results && ss.results["r" + r] && ss.results["r" + r][pid];
      if (!res) continue;
      const sc = scenarioOf(ss.scenarioIds[r]);
      rows.push(`<div class="h-row"><b>${r + 1}</b><div><div>${sc.title}</div><div class="h-d">${res.text}</div></div><b>💰${sign(res.dm)} ❤️${sign(res.db)} 💙${sign(res.ds)}</b></div>`);
    }
    return rows.join("");
  }
  $("btn-my-status").onclick = () => $("status-panel").classList.toggle("hidden");
  $("btn-status-close").onclick = () => $("status-panel").classList.add("hidden");

  // 디브리핑 + 소감
  let qIdx = 0;
  const answers = [];
  function renderQuestion() {
    $("debrief-q").textContent = `${qIdx + 1}. ${DEBRIEF_QUESTIONS[qIdx]}`;
    $("debrief-a").value = answers[qIdx] || "";
    $("debrief-count").textContent = `${qIdx + 1} / ${DEBRIEF_QUESTIONS.length}`;
    $("btn-debrief-next").textContent = qIdx === DEBRIEF_QUESTIONS.length - 1 ? "처음 질문으로" : "다음 질문";
  }
  $("btn-debrief-next").onclick = () => { answers[qIdx] = $("debrief-a").value; qIdx = (qIdx + 1) % DEBRIEF_QUESTIONS.length; renderQuestion(); };
  $("debrief-a").addEventListener("input", () => { answers[qIdx] = $("debrief-a").value; });
  $("reflection-text").addEventListener("input", () => { $("reflection-len").textContent = `${$("reflection-text").value.trim().length}자`; });
  $("btn-submit").onclick = async () => {
    const text = $("reflection-text").value.trim();
    if (text.length < 50) { $("reflection-error").textContent = `50자 이상 써 주세요. (지금 ${text.length}자)`; return; }
    if (text.length > 300) { $("reflection-error").textContent = "300자 이하로 줄여 주세요."; return; }
    answers[qIdx] = $("debrief-a").value;
    $("btn-submit").disabled = true; $("reflection-error").textContent = "저장 중...";
    const ranking = finalRanking(S.session); const me = ranking.find(x => x.pid === S.pid);
    const row = { nickname: S.player.nickname, character: charOf(S.player.charId).name, score: me ? me.score.total : 0, code: S.code, reflection: text, debrief: answers.filter(Boolean).join(" / "), submitted_at: new Date().toISOString() };
    try {
      await reflectionsRef().doc(S.code + "_" + S.pid).set(row);
      $("done-text").textContent = `${S.player.nickname}님의 소감이 제출되었습니다. (${row.character}, ${row.score}점)`;
      showStep($("screen-student"), "s-step-done");
    } catch (e) { $("reflection-error").textContent = "저장에 실패했습니다. 다시 눌러 주세요."; }
    $("btn-submit").disabled = false;
  };

  // 공통: 불평등 카드 HTML (results = 이번 라운드 전원 결과)
  function ineqHTML(results, ss) {
    const list = Object.entries(results).map(([pid, x]) => Object.assign({ pid }, x)).sort((a, b) => b.loss - a.loss);
    if (!list.length) return "";
    const worst = list[0], best = list[list.length - 1];
    const card = (x, tag, cls) => { const ch = charOf(x.charId); return `<div class="ineq-card ${cls}">${avatar(ch, 72)}<div><div class="tag">${tag}</div><h3>${ch.name} <small>${esc(x.nickname)} · ${ch.place}</small></h3><div class="ineq-delta">💰 ${sign(x.dm)} · ❤️ ${sign(x.db)} · 💙 ${sign(x.ds)} · ${x.text}</div><p class="ineq-why">${x.why}</p></div></div>`; };
    return card(worst, "가장 많이 잃음", "ineq-worst") + `<div class="ineq-vs">VS</div>` + card(best, "가장 적게 잃음", "ineq-best");
  }
  // 공통: 최종 순위 (session.results 기준)
  function finalRanking(ss) {
    const last = {};
    for (let r = 0; r < ROUNDS; r++) { const res = ss.results && ss.results["r" + r]; if (!res) continue; Object.entries(res).forEach(([pid, x]) => { last[pid] = x; }); }
    return Object.entries(last).map(([pid, x]) => ({ pid, nickname: x.nickname, charId: x.charId, state: x.state, score: E.score(x.state) })).sort((a, b) => b.score.total - a.score.total);
  }

  // ================================================================
  //  교사
  // ================================================================
  let T = { code: null, session: null, players: [], unsubS: null, unsubP: null, sort: "loss", lastKey: null };

  $("btn-role-teacher").onclick = () => { $("input-password").value = ""; $("password-error").textContent = ""; show("screen-teacher-login"); $("input-password").focus(); };
  $("btn-teacher-back").onclick = () => show("screen-start");
  $("input-password").addEventListener("keydown", e => { if (e.key === "Enter") $("btn-password-ok").click(); });
  $("btn-password-ok").onclick = () => {
    if ($("input-password").value !== String(CFG.TEACHER_PASSWORD ?? "1")) { $("password-error").textContent = "비밀번호가 틀렸습니다."; return; }
    show("screen-teacher-home");
  };
  $("btn-th-back").onclick = () => show("screen-start");

  $("btn-new-session").onclick = async () => {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const scenarioIds = E.drawScenarios(ROUNDS).map(s => s.id);
    await sessionRef(code).set({ code, scenarioIds, round: 0, phase: "lobby", results: {}, createdAt: new Date().toISOString() });
    openBoard(code);
  };
  $("btn-open-session").onclick = async () => {
    const code = $("input-open-code").value.trim();
    const snap = await sessionRef(code).get();
    if (!snap.exists) { $("open-error").textContent = "그 코드의 수업이 없습니다."; return; }
    openBoard(code);
  };

  function openBoard(code) {
    SOUND.mute(false); soundBtn.classList.remove("hidden");
    T.code = code; T.lastKey = null;
    try { localStorage.setItem("cg-teacher-code", code); } catch (e) {}
    $("b-code").textContent = code; $("big-code").textContent = code;
    show("screen-board");
    if (T.unsubS) T.unsubS(); if (T.unsubP) T.unsubP();
    T.unsubS = sessionRef(code).onSnapshot(s => { if (s.exists) { T.session = s.data(); renderBoard(); } });
    T.unsubP = playersRef(code).onSnapshot(q => { T.players = q.docs.map(d => Object.assign({ pid: d.id }, d.data())); renderBoard(); });
  }
  $("btn-b-exit").onclick = () => { if (T.unsubS) T.unsubS(); if (T.unsubP) T.unsubP(); show("screen-teacher-home"); };

  function renderBoard() {
    const ss = T.session; if (!ss) return;
    $("b-phase").textContent = ss.phase === "lobby" ? "대기실" : ss.phase === "final" ? "최종 결과" : `${ss.round + 1} / ${ROUNDS} 라운드 · ${PHASE_LABEL[ss.phase]}`;
    $("b-count").textContent = `참가 ${T.players.length}명`;
    const root = $("screen-board");
    if (ss.phase === "lobby") {
      SOUND.bgm("lobby");
      if (T.lastCount !== undefined && T.players.length > T.lastCount) SOUND.sfx("join");
      T.lastCount = T.players.length;
      $("lobby-players").innerHTML = T.players.map(p => { const ch = charOf(p.charId); return `<div class="p-chip ${p.isBot ? "bot" : ""}">${avatar(ch)}<div style="min-width:0"><div class="p-nick">${esc(p.nickname)}</div><div class="p-char">${ch.name}</div></div></div>`; }).join("") || `<p class="hint">아직 참가한 학생이 없습니다.</p>`;
      $("btn-start-round").disabled = T.players.length === 0;
      showStep(root, "b-step-lobby");
    } else if (ss.phase === "choosing") {
      const sc = scenarioOf(ss.scenarioIds[ss.round]);
      const key = "c" + ss.round;
      SOUND.bgm("choose");
      if (T.lastKey !== key) {
        SOUND.sfx("disaster");
        $("b-disaster-where").textContent = sc.where; $("b-disaster-title").textContent = sc.title; $("b-disaster-story").textContent = sc.story;
        $("b-disaster-img").innerHTML = disasterImg(sc);
        $("b-options").innerHTML = sc.options.map((o, i) => `<div><span class="opt-no">${choiceLabel(i)}</span>${o.text}</div>`).join("");
      }
      const done = T.players.filter(p => p.choices && p.choices["r" + ss.round] !== undefined);
      if (T.lastDone !== undefined && done.length > T.lastDone) SOUND.sfx("tick");
      T.lastDone = done.length;
      const humans = T.players.filter(p => !p.isBot);
      const humansDone = done.filter(p => !p.isBot);
      $("submit-count").textContent = humans.length ? `${humansDone.length} / ${humans.length}` : `${done.length} / ${T.players.length}`;
      $("submit-list").innerHTML = T.players.map(p => `<span class="${(p.isBot || (p.choices && p.choices["r" + ss.round] !== undefined)) ? "done" : ""}">${esc(p.nickname)}${p.isBot ? "🤖" : ""}</span>`).join("");
      showStep(root, "b-step-choosing");
      T.lastKey = key;
    } else if (ss.phase === "reveal") {
      SOUND.bgm("reveal");
      if (T.lastKey !== "v" + ss.round) SOUND.sfx("reveal");
      renderRevealBoard(ss);
      showStep(root, "b-step-reveal");
      T.lastKey = "v" + ss.round;
    } else if (ss.phase === "final") {
      SOUND.bgm("final");
      if (T.lastKey !== "final") SOUND.sfx("fanfare");
      T.lastKey = "final";
      renderFinalBoard(ss);
      showStep(root, "b-step-final");
    }
  }

  // 가상 학생
  $("btn-add-bots").onclick = async () => {
    const BOT_NAMES = ["하늘", "바다", "구름", "별빛", "달님", "나무", "숲길", "강물", "모래", "바람", "노을", "햇살", "이슬", "무지개", "폭포", "안개", "파도", "들판", "언덕", "계곡", "호수", "섬마을", "초원", "빙하", "사막", "정글", "습지", "동굴", "화산", "협곡", "오로라", "산호"];
    const need = 32 - T.players.length;
    const used = {}; T.players.forEach(p => { used[p.charId] = (used[p.charId] || 0) + 1; });
    for (let i = 0; i < need; i++) {
      const min = Math.min(...CHARACTERS.map(c => used[c.id] || 0));
      const pool = CHARACTERS.filter(c => (used[c.id] || 0) === min);
      const ch = pool[Math.floor(Math.random() * pool.length)]; used[ch.id] = (used[ch.id] || 0) + 1;
      await playersRef(T.code).doc("bot" + i + "_" + Math.random().toString(36).slice(2, 6)).set({ nickname: BOT_NAMES[i % BOT_NAMES.length] + (i >= BOT_NAMES.length ? i : ""), charId: ch.id, isBot: true, joinedAt: new Date().toISOString(), choices: {} });
    }
  };

  $("btn-start-round").onclick = async () => { await sessionRef(T.code).update({ round: 0, phase: "choosing" }); };

  // 결과 공개: 전원 계산 → session.results[r] 저장
  $("btn-reveal").onclick = async () => {
    const ss = T.session, r = ss.round, sc = scenarioOf(ss.scenarioIds[r]);
    const results = Object.assign({}, ss.results || {});
    const roundRes = {};
    T.players.forEach(p => {
      const ch = charOf(p.charId);
      const st = stateBefore(ss, p.pid, p.charId, r);
      let choice = p.choices && p.choices["r" + r];
      let substituted = false;
      if (choice === undefined) {
        const open = E.optionStatus(ch, st, sc).filter(o => !o.lock);
        choice = p.isBot ? open[Math.floor(Math.random() * open.length)].index : (open[0] ? open[0].index : 0);
        substituted = !p.isBot;
      }
      const { state, result } = E.applyRound(ch, st, sc, choice);
      roundRes[p.pid] = { nickname: p.nickname, charId: p.charId, isBot: !!p.isBot, choice: result.choice, text: result.text, substituted: substituted || result.substituted, dm: result.dm, db: result.db, ds: result.ds, why: result.why, loss: Math.round(E.lossOf(result, st)), state };
    });
    results["r" + r] = roundRes;
    $("btn-reveal").disabled = true;
    SOUND.sfx("drum");
    await new Promise(res => setTimeout(res, 1100));
    await sessionRef(T.code).update({ phase: "reveal", results });
    $("btn-reveal").disabled = false;
  };

  function renderRevealBoard(ss) {
    const r = ss.round, sc = scenarioOf(ss.scenarioIds[r]);
    const res = ss.results && ss.results["r" + r]; if (!res) return;
    $("reveal-title").innerHTML = `${r + 1}라운드 · ${sc.title}<small>${sc.where}</small>`;
    $("btn-next-round").textContent = r >= ROUNDS - 1 ? "최종 결과 보기" : `${r + 2}라운드 시작`;
    $("b-ineq").innerHTML = ineqHTML(res, ss);
    let list = Object.entries(res).map(([pid, x]) => Object.assign({ pid, score: E.score(x.state).total }, x));
    const worstPid = list.slice().sort((a, b) => b.loss - a.loss)[0]?.pid, bestPid = list.slice().sort((a, b) => a.loss - b.loss)[0]?.pid;
    if (T.sort === "loss") list.sort((a, b) => b.loss - a.loss);
    else if (T.sort === "score") list.sort((a, b) => b.score - a.score);
    else list.sort((a, b) => a.charId - b.charId || b.loss - a.loss);
    let html = "", lastChar = null;
    list.forEach(x => {
      const ch = charOf(x.charId);
      if (T.sort === "char" && ch.id !== lastChar) { html += `<div class="board-group">${ch.name} · ${ch.place}</div>`; lastChar = ch.id; }
      const dl = v => `<span class="${v < 0 ? "neg" : v > 0 ? "pos" : ""}">${sign(v)}</span>`;
      const bar = (v, max, color) => `<div class="b-bar"><i style="width:${Math.min(100, v / max * 100)}%;background:${color}"></i></div>`;
      html += `<div class="bcard ${x.pid === worstPid ? "worst" : x.pid === bestPid ? "best" : ""}" style="border-top-color:${ch.color}">
        <div class="b-top">${avatar(ch)}<div style="min-width:0"><div class="b-nick">${esc(x.nickname)}${x.isBot ? "🤖" : ""}</div><div class="b-char">${ch.name}</div></div></div>
        <div class="b-choice">${choiceLabel(x.choice)}. ${x.text}</div>
        <div class="b-delta">${dl(x.dm)}${dl(x.db)}${dl(x.ds)}</div>
        <div class="b-bars">${bar(x.state.money, Math.max(x.state.start, 1), "var(--money)")}${bar(x.state.body, 100, "var(--body)")}${bar(x.state.mind, 100, "var(--mind)")}</div>
        <div class="b-score">누적 ${x.score}점</div></div>`;
    });
    $("board-grid").innerHTML = html;
  }
  document.querySelectorAll(".reveal-sort .chip").forEach(b => b.onclick = () => { T.sort = b.dataset.sort; document.querySelectorAll(".reveal-sort .chip").forEach(c => c.classList.toggle("active", c === b)); renderRevealBoard(T.session); });

  $("btn-next-round").onclick = async () => {
    const r = T.session.round;
    if (r >= ROUNDS - 1) await sessionRef(T.code).update({ phase: "final" });
    else await sessionRef(T.code).update({ round: r + 1, phase: "choosing" });
  };

  let finalByChar = false;
  function renderFinalBoard(ss) {
    const ranking = finalRanking(ss);
    const DEVELOPED = [1, 2, 3, 4, 5, 6, 7, 8];
    const avg = f => { const arr = ranking.filter(x => f(charOf(x.charId))); return arr.length ? Math.round(arr.reduce((s, x) => s + x.score.total, 0) / arr.length) : "-"; };
    const groups = [
      ["선진국", c => DEVELOPED.includes(c.id), "개발도상국·난민", c => !DEVELOPED.includes(c.id)],
      ["시작 재산 100 이상", c => c.money >= 100, "시작 재산 100 미만", c => c.money < 100],
      ["장애 없음", c => !c.tags.includes("disability"), "장애 있음", c => c.tags.includes("disability")],
      ["남", c => c.sex === "남", "여", c => c.sex === "여"],
      ["보험 있음", c => c.ins === 1, "보험 없음", c => c.ins === 0],
      ["어른(18세 이상)", c => c.age >= 18, "아동·청소년", c => c.age < 18],
    ];
    $("group-avg").innerHTML = `<div class="label">조건별 평균 점수 (${ranking.length}명)</div>` + groups.map(g => `<div class="ga-row"><span>${g[0]}</span><b>${avg(g[1])}</b><span>${g[2]}</span><b>${avg(g[3])}</b></div>`).join("");
    if (finalByChar) {
      const byChar = CHARACTERS.map(ch => { const arr = ranking.filter(x => x.charId === ch.id); return { ch, n: arr.length, avg: arr.length ? Math.round(arr.reduce((s, x) => s + x.score.total, 0) / arr.length) : null }; }).filter(x => x.n).sort((a, b) => b.avg - a.avg);
      $("rank-list").innerHTML = byChar.map((x, i) => `<div class="rank-row ${i < 3 ? "top3" : ""}"><span>${i + 1}</span>${avatar(x.ch)}<span class="r-nick">${x.ch.name}</span><span class="r-char">${x.n}명</span><span class="r-score">${x.avg}</span></div>`).join("");
      $("btn-final-sort-char").textContent = "학생별 순위 보기";
    } else {
      $("rank-list").innerHTML = ranking.map((x, i) => { const ch = charOf(x.charId); return `<div class="rank-row ${i < 3 ? "top3" : ""}"><span>${i + 1}</span>${avatar(ch)}<span class="r-nick">${esc(x.nickname)}</span><span class="r-char">${ch.name}</span><span class="r-score">${x.score.total}</span></div>`; }).join("");
      $("btn-final-sort-char").textContent = "캐릭터별 평균 보기";
    }
  }
  $("btn-final-sort-char").onclick = () => { finalByChar = !finalByChar; renderFinalBoard(T.session); };

  // ---------------- 소감 목록 ----------------
  let rows = [], reflBackTo = "screen-teacher-home";
  $("btn-reflections-home").onclick = () => { reflBackTo = "screen-teacher-home"; openReflections(); };
  $("btn-b-reflections").onclick = () => { reflBackTo = "screen-board"; openReflections(); };
  $("btn-reflections-back").onclick = () => show(reflBackTo);
  async function openReflections() { show("screen-reflections"); await refreshReflections(); }
  async function refreshReflections() {
    $("teacher-tbody").innerHTML = `<tr><td colspan="6">불러오는 중...</td></tr>`;
    try { const q = await reflectionsRef().get(); rows = q.docs.map(d => d.data()); } catch (e) { $("teacher-tbody").innerHTML = `<tr><td colspan="6">불러오기 실패</td></tr>`; return; }
    $("reflections-note").textContent = T.code ? `수업 코드 ${T.code}의 소감만 표시합니다.` : "모든 수업의 소감을 표시합니다.";
    if (T.code) rows = rows.filter(r => r.code === T.code);
    renderReflections();
  }
  function sortedRows() {
    const m = $("sort-select").value, arr = rows.slice(), byNick = (a, b) => a.nickname.localeCompare(b.nickname, "ko");
    if (m === "nick-desc") arr.sort((a, b) => byNick(b, a)); else if (m === "nick-asc") arr.sort(byNick);
    else if (m === "time-desc") arr.sort((a, b) => (b.submitted_at || "").localeCompare(a.submitted_at || "")); else arr.sort((a, b) => (b.score || 0) - (a.score || 0));
    return arr;
  }
  const fmtTime = iso => { if (!iso) return ""; const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }); };
  function renderReflections() {
    const arr = sortedRows();
    $("teacher-count").textContent = `(${arr.length}명)`;
    $("teacher-tbody").innerHTML = arr.length ? arr.map(r => `<tr><td><b>${esc(r.nickname)}</b></td><td>${esc(r.character)}</td><td>${r.score}</td><td>${esc(r.code)}</td><td>${fmtTime(r.submitted_at)}</td><td class="refl">${esc(r.reflection)}${r.debrief ? `<div class="hint" style="margin-top:4px">생각 정리: ${esc(r.debrief)}</div>` : ""}</td></tr>`).join("") : `<tr><td colspan="6">아직 제출된 소감이 없습니다.</td></tr>`;
  }
  $("sort-select").onchange = renderReflections;
  $("btn-refresh").onclick = refreshReflections;

  async function saveFile(filename, blob) {
    let dl = null;
    try { if (window.claude && window.claude.use) dl = await window.claude.use("downloads"); } catch (e) { dl = null; }
    if (dl) { try { await dl.save({ filename, data: blob }); } catch (e) { if (e && e.code !== "declined") $("reflections-note").textContent = "저장할 수 없습니다: " + (e.message || e.code); } return; }
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  const today = () => new Date().toISOString().slice(0, 10);
  $("btn-xlsx").onclick = () => {
    const arr = sortedRows().map(r => ({ "닉네임": r.nickname, "캐릭터": r.character, "최종 점수": r.score, "수업 코드": r.code, "제출 시각": fmtTime(r.submitted_at), "소감": r.reflection, "생각 정리": r.debrief || "" }));
    const ws = XLSX.utils.json_to_sheet(arr); ws["!cols"] = [{ wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 16 }, { wch: 60 }, { wch: 60 }];
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "소감");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveFile(`기후불평등게임_소감_${today()}.xlsx`, new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
  };
  $("btn-png").onclick = async () => {
    const wrap = $("teacher-table-wrap"); const prev = wrap.style.overflow; wrap.style.overflow = "visible";
    const canvas = await html2canvas($("teacher-table"), { scale: 2, backgroundColor: "#ffffff" }); wrap.style.overflow = prev;
    canvas.toBlob(blob => saveFile(`기후불평등게임_소감_${today()}.png`, blob), "image/png");
  };

  // ---------------- 이어서 ----------------
  (async function resume() {
    let code = null; try { code = sessionStorage.getItem("cg-code"); } catch (e) {}
    if (code) { const s = await sessionRef(code).get(); const p = await playersRef(code).doc(S.pid).get(); if (s.exists && p.exists) { S.code = code; startStudent(); return; } }
    show("screen-start");
  })();
})();
