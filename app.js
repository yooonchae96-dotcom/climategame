// ============================================================
// 기후 불평등 게임 - 화면 로직 (학생 태블릿 + 교사 전자칠판)
// ============================================================
(async function () {
  const CFG = window.CONFIG || {};
  const $ = id => document.getElementById(id);
  const E = window.ENGINE;
  const ROUNDS = 10;
  const PHASE_LABEL = { lobby: "대기실", choosing: "선택 중", reveal: "결과 공개", final: "최종 결과" };
  const DIS_EMOJI = ["🌡️", "🌧️", "🌀", "⛺", "🏜️", "🔥", "🌊", "🦟", "❄️", "🧳", "🌪️", "🚰", "👷", "🧊", "🪓", "🍞", "🏫", "📄", "🌾", "🏛️", "✊"];
  // 게이지 기준: 재산은 가장 부유한 캐릭터(500)가 꽉 찬 상태, 나머지는 그 비율. 몸·마음은 100 기준.
  const MAX_MONEY = Math.max(...CHARACTERS.map(c => c.money));
  // 재난 유형 (BGM·효과음 선택용): heat 폭염 / water 홍수·해수면 / storm 태풍·사이클론 / fire 산불 / cold 한파·얼음 / drought 가뭄 / social 대피소·난민·회의
  const DIS_CAT = { 1: "heat", 2: "water", 3: "storm", 4: "social", 5: "drought", 6: "fire", 7: "water", 8: "water", 9: "cold", 10: "social", 11: "storm", 12: "drought", 13: "heat", 14: "cold", 15: "fire", 16: "social", 17: "social", 18: "social", 19: "heat", 20: "social" };

  const { db, mode, label: modeLabel } = await connectStore();
  // 소리 버튼 + 모든 버튼 클릭음
  const soundBtn = $("btn-sound"), soundPanel = $("sound-panel"), volRange = $("vol-range"), muteBtn = $("btn-mute");
  const paintSound = () => { const on = SOUND.enabled; soundBtn.textContent = on ? "🔊" : "🔇"; soundBtn.classList.toggle("off", !on); muteBtn.textContent = on ? "🔇 소리 끄기" : "🔊 소리 켜기"; volRange.value = Math.round(SOUND.volume * 100); };
  paintSound();
  soundBtn.onclick = () => { soundPanel.classList.toggle("hidden"); paintSound(); };
  muteBtn.onclick = () => { SOUND.toggle(); paintSound(); if (SOUND.enabled) SOUND.sfx("click"); };
  volRange.oninput = () => { SOUND.setVolume(volRange.value / 100); };
  volRange.onchange = () => { SOUND.sfx("click"); };
  const closeSoundPanel = e => { if (!e || !e.target.closest(".sound-ctl")) soundPanel.classList.add("hidden"); };
  document.addEventListener("pointerdown", closeSoundPanel, true);
  document.addEventListener("touchstart", closeSoundPanel, { capture: true, passive: true });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeSoundPanel(); });
  document.addEventListener("click", e => { const b = e.target.closest("button"); if (b && !b.closest(".sound-ctl") && !b.classList.contains("option")) SOUND.sfx("click"); }, true);
  // 토스트: data-tip이 있는 요소에 마우스를 올리거나 누르면 중요한 안내가 잠깐 뜬다
  const toastEl = $("toast"); let toastTimer = null, lastTip = null;
  // anchor(ⓘ 버튼)를 주면 그 바로 위에 띄우고, 없으면 화면 아래 가운데에 띄운다
  function showToast(msg, ms, anchor) {
    toastEl.textContent = msg; toastEl.classList.remove("hidden"); toastEl.classList.remove("anchored", "below"); toastEl.style.left = toastEl.style.top = toastEl.style.width = "";
    if (anchor) {
      const app = $("app").getBoundingClientRect(), r = anchor.getBoundingClientRect();
      toastEl.classList.add("anchored");
      const w = toastEl.offsetWidth, h = toastEl.offsetHeight, pad = 8;
      toastEl.style.width = w + "px"; // left 를 옮겨도 폭이 줄어 줄바꿈되지 않도록 측정한 폭으로 고정
      const cx = Math.min(Math.max(r.left + r.width / 2 - app.left, w / 2 + pad), app.width - w / 2 - pad);
      const above = r.top - app.top - 10 - h;
      if (above >= pad) { toastEl.style.top = above + "px"; }
      else { toastEl.classList.add("below"); toastEl.style.top = (r.bottom - app.top + 10) + "px"; }
      toastEl.style.left = cx + "px";
    }
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { toastEl.classList.add("hidden"); lastTip = null; }, ms || 3200);
  }
  // ⓘ 버튼은 data-for 로 가리킨 요소의 안내를, 아니면 감싸고 있는 [data-tip] 요소의 안내를 띄운다
  const tipSrc = t => { const b = t.closest(".tip-btn"); return (b && b.dataset.for) ? $(b.dataset.for) : t.closest("[data-tip]"); };
  document.addEventListener("mouseover", e => { const el = tipSrc(e.target); if (el && el !== lastTip) { lastTip = el; showToast(el.dataset.tip, 0, e.target.closest(".tip-btn")); } });
  document.addEventListener("click", e => { const el = tipSrc(e.target); if (el) { lastTip = el; showToast(el.dataset.tip, 0, e.target.closest(".tip-btn")); } }, true);

  // ---------------- 공통 도우미 ----------------
  const charOf = id => CHARACTERS.find(c => c.id === id);
  const scenarioOf = id => SCENARIOS.find(s => s.id === id);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  const sign = v => (v > 0 ? "+" : "") + v;
  const imgSrc = p => (window.IMAGES && window.IMAGES[p]) || p; // 아티팩트에서는 내장 이미지 사용
  function show(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active")); $(id).classList.add("active");
    $("sound-ctl").classList.toggle("hidden", !["screen-teacher-login", "screen-teacher-home", "screen-board", "screen-reflections"].includes(id));
    if (id === "screen-teacher-login" || id === "screen-teacher-home") SOUND.bgm("title");
    else if (id !== "screen-board" && id !== "screen-student") SOUND.bgm(null);
  }
  function showStep(root, id) { root.querySelectorAll(".step").forEach(s => s.classList.remove("active")); $(id).classList.add("active"); }
  function setAccent(color) { document.documentElement.style.setProperty("--accent", color); }
  function avatar(ch, size) {
    return `<div class="avatar" style="background:${ch.color}${size ? `;width:${size}px;height:${size}px` : ""}"><img src="${imgSrc(`images/char_${String(ch.id).padStart(2, "0")}.png`)}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'${ch.name[0]}'}))"></div>`;
  }
  // prev를 주면 이전 상태 → 현재 상태로 변하는 게이지(유령 막대 + 이전 위치 표식 + 증감 숫자)를 만들고, animateGauges()로 움직입니다.
  function statsHTML(st, mini, prev) {
    const row = (cls, l, v, max, pv) => {
      const pct = x => Math.min(100, Math.max(0, x / max * 100));
      const from = pv === undefined ? v : pv, d = v - from;
      const ghost = pv === undefined ? "" : `<div class="stat-ghost ${d < 0 ? "lost" : ""}" style="width:${pct(from)}%"></div><i class="stat-mark" style="left:${pct(from)}%"></i>`;
      const chg = pv === undefined ? "" : `<small class="stat-chg ${d < 0 ? "neg" : d > 0 ? "pos" : "zero"}">${d === 0 ? "±0" : sign(d)}</small>`;
      return `<div class="stat stat-${cls}"><span>${l}</span><div class="stat-bar">${ghost}<div class="stat-fill ${v > 0 ? "nz" : ""}" style="width:${pct(from)}%" data-to="${pct(v)}"></div></div><span class="stat-num"><b data-from="${from}" data-to="${v}">${from}</b>${chg}</span></div>`;
    };
    return row("money", mini ? "재산" : "💰 재산", st.money, MAX_MONEY, prev && prev.money) + row("body", mini ? "몸" : "❤️ 몸", st.body, 100, prev && prev.body) + row("mind", mini ? "마음" : "💙 마음", st.mind, 100, prev && prev.mind);
  }
  // 컨테이너 안의 게이지(막대 폭 + 숫자)를 이전 값에서 현재 값으로 움직입니다.
  function animateGauges(root, delay, dur) {
    const fills = root.querySelectorAll(".stat-fill[data-to], .b-bar .fill[data-to]");
    const nums = root.querySelectorAll("b[data-from][data-to]");
    const DUR = dur || 1100;
    setTimeout(() => {
      fills.forEach(el => { el.style.transitionDuration = (DUR / 1000) + "s"; el.style.width = el.dataset.to + "%"; });
      const t0 = performance.now();
      const step = now => {
        const k = Math.min(1, (now - t0) / DUR), e = 1 - Math.pow(1 - k, 3);
        nums.forEach(el => { const a = +el.dataset.from, b = +el.dataset.to; el.textContent = Math.round(a + (b - a) * e); });
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      // 화면이 뒤에 있어 애니메이션 프레임이 멈춰도 숫자는 최종값으로 맞춤
      setTimeout(() => nums.forEach(el => { el.textContent = el.dataset.to; }), DUR + 100);
    }, delay || 120);
  }
  function disasterImg(sc) { return `<img src="${imgSrc(sc.image)}" alt="" onerror="this.replaceWith(document.createTextNode('${DIS_EMOJI[sc.id - 1] || "🌍"}'))">`; }
  // 카드 수와 빈 공간 크기에 맞춰 열 수·카드 폭·글자 크기를 정해, 인원이 몇 명이든 스크롤 없이 꽉 차고 가운데 정렬되게
  //   aspect: 카드 가로/세로 비율(대략), maxW: 카드 최대 폭(px), ratio: 카드 폭 → 글자 크기 비율
  function fitGrid(el, n, aspect, maxW, ratio) {
    if (!el || !n) return;
    const W = el.clientWidth, H = el.clientHeight; if (!W || !H) return;
    const gap = 8;
    let best = null;
    for (let cols = 1; cols <= n; cols++) {
      const rows = Math.ceil(n / cols);
      const w = Math.min((W - gap * (cols - 1)) / cols, (H - gap * (rows - 1)) / rows * aspect, maxW);
      if (!best || w > best.w) best = { cols, w };
    }
    const w = Math.floor(best.w);
    el.style.gridTemplateColumns = `repeat(${best.cols}, ${w}px)`;
    let fs = Math.max(8, Math.min(20, w * ratio));
    el.style.fontSize = fs + "px";
    // 높이가 넘치면 글자를 조금씩 줄여 한 화면에 들어가게
    let guard = 24;
    while (el.scrollHeight > el.clientHeight + 1 && fs > 7 && guard--) { fs -= 0.5; el.style.fontSize = fs + "px"; }
  }
  const fitLobby = () => fitGrid($("lobby-players"), T.players.length, 1.5, 320, 1 / 10);
  const fitBoard = () => { const n = $("board-grid").querySelectorAll(".bcard").length; fitGrid($("board-grid"), n + (T.sort === "char" ? 2 : 0), 1.05, 260, 1 / 11); };
  window.addEventListener("resize", () => { if (!$("screen-board").classList.contains("active")) return; if ($("b-step-lobby").classList.contains("active")) fitLobby(); if ($("b-step-reveal").classList.contains("active")) fitBoard(); });
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
  try { S.pid = sessionStorage.getItem("cg-pid"); } catch (e) { }
  if (!S.pid) { S.pid = "p" + Math.random().toString(36).slice(2, 10); try { sessionStorage.setItem("cg-pid", S.pid); } catch (e) { } }

  $("btn-role-student").onclick = () => { show("screen-join"); $("input-code").focus(); };
  const pidKey = code => "cg-pid-" + code;
  function rememberPid(code) { try { sessionStorage.setItem("cg-pid", S.pid); localStorage.setItem(pidKey(code), S.pid); } catch (e) { } }
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
    let pdoc = playersRef(code).doc(S.pid);
    let mine = await pdoc.get();
    const all = await playersRef(code).get();
    if (!mine.exists) {
      // 튕긴 학생: 같은 닉네임으로 다시 들어오면 원래 캐릭터(원래 아이디)로 이어서
      const same = all.docs.find(d => !d.data().isBot && d.data().nickname === nick);
      if (same) { S.pid = same.id; pdoc = playersRef(code).doc(S.pid); mine = same; }
    }
    if (!mine.exists) {
      // 캐릭터 배정: 가장 적게 쓰인 캐릭터 중 무작위
      const used = {}; all.docs.forEach(d => { const c = d.data().charId; used[c] = (used[c] || 0) + 1; });
      const min = Math.min(...CHARACTERS.map(c => used[c.id] || 0));
      const pool = CHARACTERS.filter(c => (used[c.id] || 0) === min);
      const ch = pool[Math.floor(Math.random() * pool.length)];
      await pdoc.set({ nickname: nick, charId: ch.id, isBot: false, joinedAt: new Date().toISOString(), choices: {} });
    } else if (mine.data().nickname !== nick) {
      await pdoc.update({ nickname: nick });
    }
    S.code = code;
    try { sessionStorage.setItem("cg-code", code); } catch (e) { }
    rememberPid(code);
    startStudent();
  }

  function startStudent() {
    SOUND.setRole("student"); paintSound();
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
    $("s-profile").innerHTML = `<ul class="char-traits s-traits">${ch.traits.map(t => `<li>${t}</li>`).join("")}</ul><div class="stats s-stats">${statsHTML(st, true)}</div>`;
    $("s-round").textContent = (st.dead ? "💀 " : "") + (ss.phase === "lobby" ? "대기 중" : ss.phase === "final" ? "최종 결과" : `${ss.round + 1} / ${ROUNDS} · ${PHASE_LABEL[ss.phase]}`);
    if (ss.phase === "lobby") SOUND.bgm("lobby");
    else if (ss.phase === "choosing") SOUND.bgm(SOUND.bgmFor(DIS_CAT[ss.scenarioIds[ss.round]] || "social"));
    else if (ss.phase === "reveal") SOUND.bgm("reveal");
    else if (ss.phase === "final") SOUND.bgm("final");
    $("status-stats").innerHTML = statsHTML(st);
    $("status-history").innerHTML = historyHTML(ss, S.pid) || `<p class="hint">아직 겪은 재난이 없습니다.</p>`;

    const key = ss.phase + ":" + ss.round;
    const root = $("screen-student");
    const changed = S.lastPhaseKey !== key;
    // 대기 화면에서는 가운데 캐릭터 카드만 보이게: 헤더의 특징·게이지와 '내 상황' 버튼은 숨김
    const lobby = ss.phase === "lobby";
    $("s-profile").classList.toggle("hidden", lobby);
    $("btn-my-status").classList.toggle("hidden", lobby);
    if (lobby) $("status-panel").classList.add("hidden");
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
  }

  function renderChoose(ss, ch, st) {
    const sc = scenarioOf(ss.scenarioIds[ss.round]);
    const c = Object.assign({}, ch, { money: st.money, body: st.body, mind: st.mind });
    $("s-disaster").innerHTML = `<div class="d-img">${disasterImg(sc)}</div><div><h3>${sc.title}</h3><div class="d-where">${sc.where}</div><p>${sc.story}</p></div>`;
    $("situation-text").textContent = sc.situation(c);
    if (st.dead) {
      $("situation-text").textContent = `${st.deadRound + 1}라운드에 ${st.deadWhy} 세상을 떠났다.`;
      $("options").innerHTML = `<div class="dead-box">💀 ${ch.name}은(는) 더 이상 게임을 할 수 없습니다.<br>남은 라운드는 친구들의 결과를 지켜봅니다.</div>`;
      $("submitted-box").classList.add("hidden");
      return;
    }
    const status = E.optionStatus(ch, st, sc);
    const fx = (v, ic) => `<span class="${v < 0 ? "neg" : v > 0 ? "pos" : "zero"}">${ic} ${sign(v)}</span>`;
    const effHTML = i => { const o = status[i]; const r = o && o.effect ? o.effect.raw : null; return r ? `<span class="opt-eff">${fx(r.m, "💰")}${fx(r.b, "❤️")}${fx(r.s, "💙")}</span>` : ""; };
    $("options").innerHTML = status.map(o => `<button class="option ${o.lock ? "locked" : ""}" data-i="${o.index}" ${o.lock ? "disabled" : ""}><span class="opt-no">${choiceLabel(o.index)}</span><span>${o.text}</span>${effHTML(o.index)}${o.lock ? `<span class="lock-reason">🔒 ${o.lock}</span>` : ""}</button>`).join("");
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
      const prev = stateBefore(ss, S.pid, ch.id, r);
      $("result-stats").innerHTML = `<div class="label">게이지 변화 (전 라운드 → 지금)</div>` + statsHTML(mine.state, false, prev);
      animateGauges($("result-stats"), 350);
    }
    $("result-choice").textContent = `${sc.title} · 내 선택: ${mine.text}${mine.substituted ? " (제출하지 않아 자동 처리됨)" : ""}`;
    const d = (v, l) => `<div class="delta ${v < 0 ? "neg" : v > 0 ? "pos" : "zero"}">${sign(v)}<small>${l}</small></div>`;
    $("result-deltas").innerHTML = d(mine.dm, "💰 재산") + d(mine.db, "❤️ 몸") + d(mine.ds, "💙 마음");
    const notes = (mine.notes || []).map(n => `<div>· ${esc(n)}</div>`).join("");
    $("result-why").innerHTML = (mine.dead && mine.deadRound === r ? `<div class="dead-box">💀 ${mine.deadWhy} 세상을 떠났다. 더 이상 게임을 할 수 없다.</div>` : "") + esc(mine.why) + (notes ? `<div class="result-notes">${notes}</div>` : "");
    const list = Object.entries(results).map(([pid, x]) => ({ pid, loss: x.loss })).sort((a, b) => b.loss - a.loss);
    const pos = list.findIndex(x => x.pid === S.pid) + 1;
    $("class-pos").textContent = `이번 라운드에서 우리 반 ${list.length}명 중 ${pos}번째로 많이 잃었어요.`;
    $("s-ineq").innerHTML = ineqHTML(results, ss);
  }

  function renderFinal(ss, ch) {
    const ranking = finalRanking(ss);
    const me = ranking.find(x => x.pid === S.pid);
    const myRank = ranking.findIndex(x => x.pid === S.pid) + 1;
    $("my-final").innerHTML = me ? `<div style="display:flex;gap:12px;align-items:center">${avatar(ch, 90)}<div><div class="big-rank">${myRank}등 <small style="font-size:18px">/ ${ranking.length}</small></div><div>${ch.name} · ${esc(S.player.nickname)}</div><div class="score-line">총점 ${me.score.total} = 재산 ${me.score.moneyScore} + 몸 ${me.state.body} + 마음 ${me.state.mind}</div>${me.dead ? `<div class="score-line">💀 ${me.state.deadRound + 1}라운드, ${esc(me.state.deadWhy || "")} 세상을 떠났다.</div>` : ""}</div></div>` + statsHTML(me.state) : "";
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
  // 마지막(5번째) 질문은 소감 칸
  const REFLECTION_Q = "이 게임을 하고 '기후 불평등'에 대해 새로 알게 된 것이나 느낀 점을 적어 보세요. (소감, 50자 이상)";
  const QN = DEBRIEF_QUESTIONS.length + 1;
  function renderQuestion() {
    const last = qIdx === QN - 1;
    $("debrief-q").textContent = `${qIdx + 1}. ${last ? REFLECTION_Q : DEBRIEF_QUESTIONS[qIdx]}`;
    $("debrief-a").classList.toggle("hidden", last);
    $("reflection-text").classList.toggle("hidden", !last);
    $("reflection-foot").classList.toggle("hidden", !last);
    if (!last) $("debrief-a").value = answers[qIdx] || "";
    $("debrief-count").textContent = `${qIdx + 1} / ${QN}`;
    $("btn-debrief-next").textContent = last ? "처음 질문으로" : "다음 질문";
  }
  $("btn-debrief-next").onclick = () => { if (qIdx < QN - 1) answers[qIdx] = $("debrief-a").value; qIdx = (qIdx + 1) % QN; renderQuestion(); };
  $("debrief-a").addEventListener("input", () => { answers[qIdx] = $("debrief-a").value; });
  $("reflection-text").addEventListener("input", () => { $("reflection-len").textContent = `${$("reflection-text").value.trim().length}자`; });
  $("btn-submit").onclick = async () => {
    const text = $("reflection-text").value.trim();
    if (text.length < 50) { $("reflection-error").textContent = `50자 이상 써 주세요. (지금 ${text.length}자)`; return; }
    if (text.length > 300) { $("reflection-error").textContent = "300자 이하로 줄여 주세요."; return; }
    if (qIdx < QN - 1) answers[qIdx] = $("debrief-a").value;
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
    const card = (x, tag, cls) => { const ch = charOf(x.charId); return `<div class="ineq-card ${cls}" data-pid="${x.pid}" role="button" tabindex="0" title="눌러서 캐릭터 상황 보기">${avatar(ch, 72)}<div><div class="tag">${tag}</div><h3>${ch.name} <small>${esc(x.nickname)} · ${ch.place}</small></h3><div class="ineq-delta">💰 ${sign(x.dm)} · ❤️ ${sign(x.db)} · 💙 ${sign(x.ds)} · ${x.text}</div><p class="ineq-why">${x.why}</p></div></div>`; };
    return card(worst, "가장 많이 잃음", "ineq-worst") + `<div class="ineq-vs">VS</div>` + card(best, "가장 적게 잃음", "ineq-best");
  }
  // 공통: 최종 순위 (session.results 기준)
  function finalRanking(ss) {
    const last = {};
    for (let r = 0; r < ROUNDS; r++) { const res = ss.results && ss.results["r" + r]; if (!res) continue; Object.entries(res).forEach(([pid, x]) => { last[pid] = x; }); }
    return Object.entries(last).map(([pid, x]) => ({ pid, nickname: x.nickname, charId: x.charId, state: x.state, dead: !!x.state.dead, score: E.score(x.state) }))
      .sort((a, b) => (a.dead - b.dead) || (a.dead ? (b.state.deadRound - a.state.deadRound) : (b.score.total - a.score.total)));
  }

  // ================================================================
  //  교사
  // ================================================================
  let T = { code: null, session: null, players: [], unsubS: null, unsubP: null, sort: "loss", lastKey: null };

  $("btn-role-teacher").onclick = () => { $("input-password").value = ""; $("password-error").textContent = ""; show("screen-teacher-login"); $("input-password").focus(); };
  $("btn-teacher-back").onclick = () => show("screen-start");
  $("input-password").addEventListener("keydown", e => { if (e.key === "Enter") $("btn-password-ok").click(); });
  $("btn-password-ok").onclick = () => {
    if ($("input-password").value !== String(CFG.TEACHER_PASSWORD ?? "0906")) { $("password-error").textContent = "비밀번호가 틀렸습니다."; return; }
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

  function renderLobbyQR(code) {
    let joinUrl = `${window.location.origin}${window.location.pathname}?code=${encodeURIComponent(code)}`;
    if (window.location.protocol === "file:") {
      joinUrl = `https://climate-game-olive-nine.vercel.app/?code=${encodeURIComponent(code)}`;
    }
    const draw = (el, size) => {
      if (!el) return;
      el.innerHTML = "";
      if (window.QRCode) {
        try {
          new QRCode(el, {
            text: joinUrl,
            width: size,
            height: size,
            colorDark: "#111111",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.M
          });
        } catch (e) {
          console.error("QR Code error:", e);
        }
      }
    };
    draw($("lobby-qrcode"), 180);
    draw($("b-rejoin-qr"), 76); draw($("b-rejoin-qr-right"), 76); // 헤더 양쪽에 고정되는 작은 QR (라운드 중에도 재참가용)
  }

  function openBoard(code) {
    SOUND.setRole("teacher"); paintSound();
    T.code = code; T.lastKey = null;
    try { localStorage.setItem("cg-teacher-code", code); } catch (e) { }
    $("b-code").textContent = code; $("big-code").textContent = code;
    renderLobbyQR(code);
    show("screen-board");
    if (T.unsubS) T.unsubS(); if (T.unsubP) T.unsubP();
    T.unsubS = sessionRef(code).onSnapshot(s => { if (s.exists) { T.session = s.data(); renderBoard(); } });
    T.unsubP = playersRef(code).onSnapshot(q => { T.players = q.docs.map(d => Object.assign({ pid: d.id }, d.data())); renderBoard(); });
  }
  $("btn-b-exit").onclick = () => { if (T.unsubS) T.unsubS(); if (T.unsubP) T.unsubP(); closePlayerModal(); show("screen-teacher-home"); };

  const setRejoin = on => ["b-rejoin", "b-rejoin-right"].forEach(id => $(id).classList.toggle("hidden", !on));
  function renderBoard() {
    const ss = T.session; if (!ss) return;
    $("b-phase").textContent = ss.phase === "lobby" ? "대기실" : ss.phase === "final" ? "최종 결과" : `${ss.round + 1} / ${ROUNDS} 라운드 · ${PHASE_LABEL[ss.phase]}`;
    $("b-count").textContent = `참가 ${T.players.length}명`;
    const root = $("screen-board");
    if (ss.phase === "lobby") {
      SOUND.bgm("lobby");
      if (T.lastCount !== undefined && T.players.length > T.lastCount) SOUND.sfx("join");
      T.lastCount = T.players.length;
      $("lobby-players").innerHTML = T.players.map(p => { const ch = charOf(p.charId); const st = latestState(ss, p.pid, p.charId); return `<div class="p-chip ${p.isBot ? "bot" : ""}" data-pid="${p.pid}" role="button" tabindex="0" title="눌러서 캐릭터 보기"><div class="p-head">${avatar(ch)}<div style="min-width:0"><div class="p-nick">${esc(p.nickname)}</div><div class="p-char">${ch.name}</div></div></div><div class="stats stats-chip">${statsHTML(st, true)}</div></div>`; }).join("") || `<p class="hint">아직 참가한 학생이 없습니다.</p>`;
      $("lobby-count").textContent = T.players.length ? `${T.players.length}명` : "";
      $("btn-start-round").disabled = T.players.length === 0;
      setRejoin(false);
      showStep(root, "b-step-lobby");
      fitLobby();
    } else if (ss.phase === "choosing") {
      setRejoin(true);
      const sc = scenarioOf(ss.scenarioIds[ss.round]);
      const key = "c" + ss.round;
      const cat = DIS_CAT[sc.id] || "social";
      SOUND.bgm(SOUND.bgmFor(cat));
      if (T.lastKey !== key) {
        closePlayerModal(); flushDeath();
        SOUND.sfx(SOUND.sfxFor(cat));
        $("b-disaster-where").textContent = sc.where; $("b-disaster-title").textContent = sc.title; $("b-disaster-story").textContent = sc.story;
        $("b-disaster-img").innerHTML = disasterImg(sc);
      }
      const pickOf = p => p.choices && p.choices["r" + ss.round];
      const done = T.players.filter(p => pickOf(p) !== undefined);
      if (T.lastDone !== undefined && done.length > T.lastDone) SOUND.sfx("tick");
      T.lastDone = done.length;
      // 선택지별 인원
      const tally = sc.options.map(() => 0); done.forEach(p => { tally[pickOf(p)] = (tally[pickOf(p)] || 0) + 1; });
      $("b-options").innerHTML = sc.options.map((o, i) => `<div><span class="opt-no pick-${i}">${choiceLabel(i)}</span>${o.text}<span class="opt-count">${tally[i]}명</span></div>`).join("");
      const humans = T.players.filter(p => !p.isBot);
      const humansDone = done.filter(p => !p.isBot);
      $("submit-count").textContent = humans.length ? `${humansDone.length} / ${humans.length}` : `${done.length} / ${T.players.length}`;
      // 캐릭터별로 누가 몇 번을 골랐는지
      const byChar = {}; T.players.forEach(p => { (byChar[p.charId] = byChar[p.charId] || []).push(p); });
      $("char-choices").innerHTML = CHARACTERS.filter(ch => byChar[ch.id]).map(ch => {
        const ps = byChar[ch.id];
        const picks = ps.map(p => { const c = pickOf(p); return `<span class="pick ${c === undefined ? "wait" : "pick-" + c}" data-pid="${p.pid}" role="button" tabindex="0" title="눌러서 상황 보기"><b>${c === undefined ? (p.isBot ? "🤖" : "…") : choiceLabel(c)}</b>${c === undefined ? "" : `<span class="pick-text">${esc(sc.options[c].text)}</span>`}<small>${esc(p.nickname)}</small></span>`; }).join("");
        return `<div class="cc-row" style="border-left-color:${ch.color}" data-pid="${ps[0].pid}" role="button" tabindex="0" title="눌러서 캐릭터 상황 보기">${avatar(ch)}<div class="cc-name">${ch.name}<small>${ps.length}명</small></div><div class="cc-picks">${picks}</div></div>`;
      }).join("");
      showStep(root, "b-step-choosing");
      T.lastKey = key;
    } else if (ss.phase === "reveal") {
      setRejoin(true);
      SOUND.bgm("reveal");
      const newRound = T.lastKey !== "v" + ss.round;
      if (newRound) { closePlayerModal(); SOUND.sfx("reveal"); renderRevealBoard(ss, true); }
      showStep(root, "b-step-reveal");
      if (newRound) fitBoard();
      T.lastKey = "v" + ss.round;
    } else if (ss.phase === "final") {
      setRejoin(true);
      SOUND.bgm("final");
      if (T.lastKey !== "final") { closePlayerModal(); flushDeath(); SOUND.sfx("fanfare"); }
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
      const { state, result } = E.applyRound(ch, st, sc, choice, { round: r });
      roundRes[p.pid] = { nickname: p.nickname, charId: p.charId, isBot: !!p.isBot, choice: result.choice, text: result.text, substituted: !result.skipped && (substituted || result.substituted), dm: result.dm, db: result.db, ds: result.ds, why: result.why, loss: Math.round(E.lossOf(result, st)), state, notes: result.notes || [], dead: !!state.dead, deadRound: state.deadRound ?? null, deadWhy: state.deadWhy || null, skipped: !!result.skipped };
    });
    results["r" + r] = roundRes;
    $("btn-reveal").disabled = true;
    SOUND.sfx("drum");
    await new Promise(res => setTimeout(res, 1100));
    await sessionRef(T.code).update({ phase: "reveal", results });
    $("btn-reveal").disabled = false;
  };

  // animate=true면 각 카드의 게이지가 전 라운드 값에서 지금 값으로 움직이며 숫자가 바뀜 (유령 막대로 잃은 만큼 표시)
  function renderRevealBoard(ss, animate) {
    const r = ss.round, sc = scenarioOf(ss.scenarioIds[r]);
    const res = ss.results && ss.results["r" + r]; if (!res) return;
    $("reveal-title").innerHTML = `${r + 1}라운드 · ${sc.title}<small>${sc.where}</small>`;
    $("btn-next-round").textContent = r >= ROUNDS - 1 ? "최종 결과 보기" : `${r + 2}라운드 시작`;
    $("b-ineq").innerHTML = ineqHTML(res, ss);
    let list = Object.entries(res).map(([pid, x]) => Object.assign({ pid, score: E.score(x.state).total }, x));
    const alive = list.filter(x => !x.skipped);
    const worstPid = alive.slice().sort((a, b) => b.loss - a.loss)[0]?.pid, bestPid = alive.slice().sort((a, b) => a.loss - b.loss)[0]?.pid;
    if (T.sort === "loss") list.sort((a, b) => b.loss - a.loss);
    else if (T.sort === "score") list.sort((a, b) => b.score - a.score);
    else list.sort((a, b) => a.charId - b.charId || b.loss - a.loss);
    let html = "", lastChar = null;
    list.forEach(x => {
      const ch = charOf(x.charId);
      if (T.sort === "char" && ch.id !== lastChar) { html += `<div class="board-group">${ch.name} · ${ch.place}</div>`; lastChar = ch.id; }
      const prev = stateBefore(ss, x.pid, x.charId, r);
      const g = (icon, v, pv, max, color) => {
        const pct = n => Math.min(100, Math.max(0, n / max * 100)), d = v - pv;
        return `<div class="b-g"><span class="b-g-ico">${icon}</span><div class="b-bar">${d !== 0 ? `<i class="ghost ${d < 0 ? "lost" : ""}" style="width:${pct(pv)}%"></i>` : ""}<i class="fill" style="width:${pct(animate ? pv : v)}%;background:${color}" data-to="${pct(v)}"></i></div><span class="b-g-num"><b data-from="${animate ? pv : v}" data-to="${v}">${animate ? pv : v}</b><small class="${d < 0 ? "neg" : d > 0 ? "pos" : ""}">${d === 0 ? "" : sign(d)}</small></span></div>`;
      };
      html += `<div class="bcard ${x.pid === worstPid ? "worst" : x.pid === bestPid ? "best" : ""} ${x.dead ? "dead" : ""}" style="border-top-color:${ch.color}" data-pid="${x.pid}" role="button" tabindex="0" title="눌러서 캐릭터 상황 보기">
        <div class="b-top">${avatar(ch)}<div style="min-width:0"><div class="b-nick">${esc(x.nickname)}${x.isBot ? "🤖" : ""}</div><div class="b-char">${ch.name}</div></div></div>
        <div class="b-choice">${x.skipped ? `💀 ${x.deadRound + 1}라운드 사망` : `<span class="opt-no pick-${x.choice}">${choiceLabel(x.choice)}</span>${x.text}`}</div>
        <div class="b-gauges">${g("💰", x.state.money, prev.money, MAX_MONEY, "var(--g-money)")}${g("❤️", x.state.body, prev.body, 100, "var(--g-body)")}${g("💙", x.state.mind, prev.mind, 100, "var(--g-mind)")}</div>
        <div class="b-score">누적 ${x.score}점</div></div>`;
    });
    $("board-grid").innerHTML = html;
    if (T.cdTimer) { clearInterval(T.cdTimer); T.cdTimer = null; }
    $("gauge-countdown").classList.add("hidden");
    if (animate) {
      // 3초 예고(3·2·1) 뒤 2.6초에 걸쳐 천천히 게이지가 움직임
      const cd = $("gauge-countdown"), num = $("gc-num");
      let n = 3; num.textContent = n; cd.classList.remove("hidden"); SOUND.sfx("tick");
      T.cdTimer = setInterval(() => {
        n--;
        if (n > 0) { num.textContent = n; SOUND.sfx("tick"); return; }
        clearInterval(T.cdTimer); T.cdTimer = null; cd.classList.add("hidden");
        animateGauges($("board-grid"), 50, 2600);
        const sum = list.reduce((a, x) => a + x.dm + x.db + x.ds, 0);
        SOUND.sfx(sum < 0 ? "drain" : "rise");
        // 이번 라운드에 세상을 떠난 캐릭터가 있으면 게이지가 다 움직인 뒤 전체 안내
        const died = list.filter(x => x.dead && x.deadRound === r);
        if (died.length) { T.deathPending = { died, r }; T.deathTimer = setTimeout(() => showDeath(died, r), 3000); }
      }, 1000);
    }
  }
  // 사망 안내 (전자칠판 전체 화면 + 슬픈 BGM). 확인을 누르면 닫히고 결과 BGM으로 돌아감
  function showDeath(died, r) {
    if (T.deathTimer) { clearTimeout(T.deathTimer); T.deathTimer = null; }
    T.deathPending = null;
    const ov = $("death-overlay");
    $("death-img").innerHTML = `<img src="${imgSrc("images/announce.png")}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'death-emoji',textContent:'🕯️'}))">`;
    $("death-title").textContent = died.length === 1 ? `${charOf(died[0].charId).name}이(가) 세상을 떠났습니다` : `${died.length}명이 세상을 떠났습니다`;
    $("death-list").innerHTML = died.map(x => { const ch = charOf(x.charId); return `<div class="death-row">${avatar(ch, 56)}<div><b>${ch.name}</b> <small>${esc(x.nickname)}${x.isBot ? " 🤖" : ""} · ${ch.place}</small><div class="death-why">${r + 1}라운드, ${x.deadWhy} 세상을 떠났습니다.</div></div></div>`; }).join("");
    $("death-text").textContent = "같은 재난을 겪었지만 몸을 지킬 돈도, 치료받을 병원도 충분하지 않았습니다. 이 캐릭터는 더 이상 게임을 할 수 없고, 남은 라운드는 친구들의 결과를 지켜봅니다.";
    ov.classList.remove("hidden");
    SOUND.bgm("mourn");
  }
  // 아직 띄우지 못한 사망 안내가 있으면(교사가 안내가 뜨기 전에 다음 라운드로 넘긴 경우) 지금 바로 띄우고, 없으면 닫는다
  function flushDeath() { if (T.deathPending) showDeath(T.deathPending.died, T.deathPending.r); else closeDeath(); }
  function closeDeath() { if (T.deathTimer) { clearTimeout(T.deathTimer); T.deathTimer = null; } T.deathPending = null; const ov = $("death-overlay"); if (ov && !ov.classList.contains("hidden")) { ov.classList.add("hidden"); if (T.session && T.session.phase === "reveal") SOUND.bgm("reveal"); } }
  $("btn-death-close").onclick = closeDeath;
  // 대기실 참가자 모달
  function openPlayerModal(pid) {
    const p = T.players.find(x => x.pid === pid); if (!p || !T.session) return;
    const ch = charOf(p.charId), st = latestState(T.session, pid, p.charId);
    const m = $("player-modal");
    m.style.setProperty("--accent", ch.color);
    $("m-portrait").style.background = ch.color;
    $("m-portrait").innerHTML = `<img src="${imgSrc(`images/char_${String(ch.id).padStart(2, "0")}.png`)}" alt="${ch.name}">`;
    $("m-portrait").querySelector("img").onerror = function () { this.replaceWith(Object.assign(document.createElement("div"), { className: "portrait-fallback", textContent: ch.name[0] })); };
    $("m-nick").textContent = `${p.nickname}${p.isBot ? " 🤖" : ""} 님의 캐릭터`;
    $("m-name").textContent = ch.name; $("m-age").textContent = `${ch.age}세 · ${ch.sex}`; $("m-place").textContent = ch.place;
    $("m-traits").innerHTML = ch.traits.map(t => `<li>${t}</li>`).join("");
    $("m-strength").textContent = ch.strength;
    $("m-stats").innerHTML = statsHTML(st);
    const ss = T.session; let extra = "";
    if (ss.phase === "choosing") {
      const c = p.choices && p.choices["r" + ss.round], sc = scenarioOf(ss.scenarioIds[ss.round]);
      extra += `<div class="m-now"><b>${ss.round + 1}라운드 · ${sc.title}</b>${c === undefined ? `<span class="pick wait">아직 선택 안 함</span>` : `<span class="pick pick-${c}"><b>${choiceLabel(c)}</b><span class="pick-text">${esc(sc.options[c].text)}</span></span>`}</div>`;
    }
    const sc0 = E.score(st);
    extra += `<div class="m-score">누적 점수 <b>${sc0.total}</b> <small>= 재산 ${sc0.moneyScore} + 몸 ${st.body} + 마음 ${st.mind}</small></div>`;
    extra += `<div class="label">지금까지 겪은 라운드</div><div class="history">${historyHTML(ss, pid) || `<p class="hint">아직 겪은 재난이 없습니다.</p>`}</div>`;
    $("m-extra").innerHTML = extra;
    m.classList.remove("hidden");
    SOUND.sfx("pop");
  }
  // 전자칠판 어디서든 data-pid가 있는 카드(대기실 칩·선택 현황·결과 카드·불평등 카드·순위)를 누르면 모달
  $("screen-board").addEventListener("click", e => { if (e.target.closest("button")) return; const el = e.target.closest("[data-pid]"); if (el) openPlayerModal(el.dataset.pid); });
  $("screen-board").addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.dataset && e.target.dataset.pid) { e.preventDefault(); openPlayerModal(e.target.dataset.pid); } });
  function closePlayerModal() { const m = $("player-modal"); if (m && !m.classList.contains("hidden")) m.classList.add("hidden"); }
  $("btn-player-modal-close").onclick = closePlayerModal;
  $("player-modal-backdrop").onclick = closePlayerModal;
  document.addEventListener("keydown", e => { if (e.key === "Escape") closePlayerModal(); });
  document.querySelectorAll(".reveal-sort .chip").forEach(b => b.onclick = () => { T.sort = b.dataset.sort; document.querySelectorAll(".reveal-sort .chip").forEach(c => c.classList.toggle("active", c === b)); renderRevealBoard(T.session, false); fitBoard(); });

  $("btn-next-round").onclick = async () => {
    const r = T.session.round;
    if (r >= ROUNDS - 1) await sessionRef(T.code).update({ phase: "final" });
    else await sessionRef(T.code).update({ round: r + 1, phase: "choosing" });
  };

  let finalByChar = false;
  function renderFinalBoard(ss) {
    const ranking = finalRanking(ss);
    const crown = i => (i === 0 ? `<span class="crown">👑</span>` : "");
    if (finalByChar) {
      const byChar = CHARACTERS.map(ch => { const arr = ranking.filter(x => x.charId === ch.id && !x.dead); const deadN = ranking.filter(x => x.charId === ch.id && x.dead).length; return { ch, n: arr.length + deadN, deadN, avg: arr.length ? Math.round(arr.reduce((s, x) => s + x.score.total, 0) / arr.length) : -1 }; }).filter(x => x.n).sort((a, b) => b.avg - a.avg);
      $("rank-list").innerHTML = byChar.map((x, i) => `<div class="rank-row ${i === 0 ? "first" : i < 3 ? "top3" : ""} ${x.avg < 0 ? "dead" : ""}" data-pid="${ranking.find(r => r.charId === x.ch.id).pid}" role="button" tabindex="0" title="눌러서 캐릭터 상황 보기"><span>${crown(i)}${i + 1}</span>${avatar(x.ch)}<span class="r-nick">${x.ch.name}</span><span class="r-char">${x.n}명${x.deadN ? ` · 💀${x.deadN}` : ""}</span><span class="r-score">${x.avg < 0 ? "💀" : x.avg}</span></div>`).join("");
      $("btn-final-sort-char").textContent = "학생별 순위 보기";
    } else {
      $("rank-list").innerHTML = ranking.map((x, i) => { const ch = charOf(x.charId); return `<div class="rank-row ${i === 0 ? "first" : i < 3 ? "top3" : ""} ${x.dead ? "dead" : ""}" data-pid="${x.pid}" role="button" tabindex="0" title="눌러서 캐릭터 상황 보기"><span>${crown(i)}${i + 1}</span>${avatar(ch)}<span class="r-nick">${esc(x.nickname)}</span><span class="r-char">${ch.name}${x.dead ? ` · 💀 ${x.state.deadRound + 1}라운드, ${esc(x.state.deadWhy || "")} 사망` : ""}</span><span class="r-score">${x.dead ? "💀" : x.score.total}</span></div>`; }).join("");
      $("btn-final-sort-char").textContent = "캐릭터별 평균 보기";
    }
    renderCounterfactual(ss, ranking);
  }
  // 1등이 사회적 약자(여성·노인·장애인·낙후 지역)라면: 그 조건이 없었다면 같은 선택으로 얼마나 더 얻었을지 보여 줌
  function renderCounterfactual(ss, ranking) {
    const box = $("cf-box"); const top = ranking[0];
    if (!top || top.dead) { box.classList.add("hidden"); return; }
    const ch = charOf(top.charId);
    const choices = []; for (let i = 0; i < ROUNDS; i++) { const x = ss.results && ss.results["r" + i] && ss.results["r" + i][top.pid]; choices.push(x ? x.choice : 0); }
    const cf = E.counterfactual(ch, ss.scenarioIds.map(scenarioOf), choices);
    if (!cf) { box.classList.add("hidden"); return; }
    // 차이(운 요소 제외)는 다시 계산한 두 값으로 구하고, 화면의 '실제'는 순위표와 같은 실제 기록 점수를 쓴다.
    //   '만약' 점수 = 실제 기록 점수 + 차이 → 왼쪽 '실제'와 오른쪽 순위표 점수가 항상 일치
    const dMoney = cf.cf.state.money - cf.actual.state.money, dTotal = cf.cf.score.total - cf.actual.score.total;
    const realTotal = top.score.total, realMoney = top.state.money;
    const cfTotal = realTotal + dTotal, cfMoney = realMoney + dMoney;
    // 조건이 여럿이면 마지막만 '~다면'으로 두고 앞은 '~고'로 잇는다 (예: "남성이고 젊었다면")
    const labels = cf.vuls.map(v => v.label).join("·"), cfs = cf.vuls.map((v, i) => i < cf.vuls.length - 1 ? v.cf.replace("이었다면", "이고").replace("었다면", "고") : v.cf).join(" ");
    const cfShort = cf.vuls.map(v => v.cf.replace("이었다면", "").replace("었다면", "")).join("·");
    box.innerHTML = `<div class="cf-head">👑 1등 ${esc(top.nickname)} <small>(${ch.name} · ${labels})</small></div>
      <div class="cf-q">만약 ${cfs}?</div>
      <div class="cf-compare">
        <div class="cf-col"><small>실제</small><b>${realTotal}점</b><span>💰 ${realMoney}코인</span></div>
        <div class="cf-arrow">→</div>
        <div class="cf-col cf-better"><small>${cfShort}</small><b>${cfTotal}점</b><span>💰 ${cfMoney}코인</span></div>
      </div>
      <div class="cf-nums"><span>총점 <b>${sign(dTotal)}</b>점</span><span>재산 <b>${sign(dMoney)}</b>코인</span></div>
      <div class="cf-foot">같은 선택으로 10라운드 · 운 요소 제외</div>`;
    box.classList.remove("hidden");
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
    $("teacher-count").textContent = `(${arr.length}명${T.code ? ` · 수업 ${T.code}` : ""})`;
    $("teacher-tbody").innerHTML = arr.length ? arr.map(r => `<tr><td><b>${esc(r.nickname)}</b></td><td>${esc(r.character)}</td><td>${r.score}</td><td>${esc(r.code)}</td><td>${fmtTime(r.submitted_at)}</td><td class="refl">${esc(r.reflection)}${r.debrief ? `<div class="hint" style="margin-top:4px">생각 정리: ${esc(r.debrief)}</div>` : ""}</td></tr>`).join("") : `<tr><td colspan="6">아직 제출된 소감이 없습니다.</td></tr>`;
  }
  $("sort-select").onchange = renderReflections;
  $("btn-refresh").onclick = refreshReflections;

  async function saveFile(filename, blob) {
    let dl = null;
    try { if (window.claude && window.claude.use) dl = await window.claude.use("downloads"); } catch (e) { dl = null; }
    if (dl) { try { await dl.save({ filename, data: blob }); } catch (e) { if (e && e.code !== "declined") showToast("저장할 수 없습니다: " + (e.message || e.code)); } return; }
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

  // ---------------- 이어서 & QR 바로 참가 ----------------
  (async function resume() {
    const urlParams = new URLSearchParams(window.location.search);
    const queryCode = urlParams.get("code") || urlParams.get("c");

    let savedCode = null;
    try { savedCode = sessionStorage.getItem("cg-code"); } catch (e) { }

    // 1. QR코드 파라미터로 접속한 경우
    if (queryCode && /^\d{4}$/.test(queryCode)) {
      // 이미 같은 세션에 참가 중이었다면(같은 탭, 또는 같은 기기에서 튕겼다 다시 들어온 경우) 바로 학생 화면으로 복구
      let remembered = null; try { remembered = localStorage.getItem(pidKey(queryCode)); } catch (e) { }
      const tryPid = savedCode === queryCode ? S.pid : remembered;
      if (tryPid) {
        const s = await sessionRef(queryCode).get();
        const p = await playersRef(queryCode).doc(tryPid).get();
        if (s.exists && p.exists) {
          S.pid = tryPid; S.code = queryCode;
          try { sessionStorage.setItem("cg-code", queryCode); } catch (e) { }
          rememberPid(queryCode);
          startStudent();
          return;
        }
      }
      // 새 참가이거나 세션이 없으면 참가 폼에 코드 자동 입력 후 닉네임 입력 대기
      $("input-code").value = queryCode;
      show("screen-join");
      setTimeout(() => {
        const nick = $("input-nickname");
        if (nick) nick.focus();
      }, 150);
      return;
    }

    // 2. 기존 학생 세션 복구
    if (savedCode) {
      const s = await sessionRef(savedCode).get();
      const p = await playersRef(savedCode).doc(S.pid).get();
      if (s.exists && p.exists) {
        S.code = savedCode;
        startStudent();
        return;
      }
    }

    show("screen-start");
  })();
})();
