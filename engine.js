// ============================================================
// 게임 계산 로직 (화면과 분리되어 있어 node에서도 검증 가능)
// ============================================================
(function (root) {
  const DATA = root.CHARACTERS ? root : (typeof require !== "undefined" ? require("./data.js") : {});
  const { CHARACTERS, SCENARIOS } = DATA;

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // 캐릭터로 초기 상태 만들기
  function newState(ch) {
    return { charId: ch.id, start: ch.money, money: ch.money, body: ch.body, mind: ch.mind, hospital: 0 };
  }

  // ---------- 사회적 약자(구조적 불이익) ----------
  //   여성 / 노인(65세 이상) / 장애인 / 낙후 지역(선진국 밖 또는 원주민)
  //   매 라운드 선택 결과와 별개로 조금씩 더 잃는다. 재난 때 실제 통계에서 확인되는 차이를 작게 반영한 것.
  const DEVELOPED = [1, 2, 3, 4, 5, 6, 7, 8];
  const SAFE_ROUNDS = 7;   // 7라운드까지는 어떤 일이 있어도 죽지 않는다
  // 극심한 더위·추위 재난: 8라운드부터 70세 이상은 남은 게이지와 상관없이 급사(고혈압 등)
  const EXTREME_TEMP = { 1: "폭염", 9: "한파", 13: "폭염", 19: "폭염" };
  const ELDERLY_RISK_AGE = 70;
  function vulnerabilities(ch) {
    const v = [];
    if (ch.sex === "여") v.push({ key: "female", label: "여성", cf: "남성이었다면", note: "여성: 재난 중 돌봄·안전 부담을 더 졌다." });
    if (ch.age >= 65) v.push({ key: "elderly", label: "노인", cf: "젊었다면", note: "노인: 몸이 회복되는 속도가 느렸다." });
    if (ch.tags.includes("disability")) v.push({ key: "disability", label: "장애인", cf: "비장애인이었다면", note: "장애: 이동과 의료에 돈과 체력이 더 들었다." });
    if (!DEVELOPED.includes(ch.id) || ch.tags.includes("indigenous")) v.push({ key: "developing", label: "낙후 지역", cf: "선진국 시민이었다면", note: "낙후 지역: 지원이 늦고 적게 왔다." });
    return v;
  }
  function structural(ch, st) {
    const out = { m: 0, b: 0, s: 0, notes: [] };
    vulnerabilities(ch).forEach(v => {
      if (v.key === "female") { out.s -= 3; out.m -= Math.round(st.money * 0.02); }
      if (v.key === "elderly") { out.b -= 3; }
      if (v.key === "disability") { out.b -= 2; out.m -= Math.max(2, Math.round(st.money * 0.02)); }
      if (v.key === "developing") { out.s -= 2; out.m -= Math.round(st.money * 0.02); }
      out.notes.push(v.note);
    });
    return out;
  }
  // 사회적 약자가 아닌 캐릭터(남성·젊음·비장애·선진국 — 위 약자 조건이 하나도 없음)
  //   수업 개설 후 첫 게임(firstGame)에서는 어떤 이유로도 죽지 않는다. 첫 게임이 아니면 희귀 재난(sc.fatal)로 죽을 수 있다.
  const isPrivileged = ch => vulnerabilities(ch).length === 0;
  // 반사실 캐릭터: 약자 조건을 떼어 낸 '만약의' 캐릭터 (남성·젊음·비장애·선진국)
  function counterfactualChar(ch) {
    const c = Object.assign({}, ch, { sex: "남", age: Math.min(ch.age, 40), tags: ch.tags.filter(t => !["female", "disability", "deaf", "elderly"].includes(t)) });
    if (ch.tags.includes("disability")) c.mob = Math.max(c.mob, 1);
    return c;
  }

  // 캐릭터 + 현재 상태를 합친 객체 (선택지 함수는 현재 재산을 본다)
  function withState(ch, st) {
    return Object.assign({}, ch, { money: st.money, body: st.body, mind: st.mind });
  }

  // 선택지 하나의 실제 변화량 (현재 상태에서 잘라낸 뒤) — 미리보기와 잠금 판단에 씀
  function previewEffect(c, st, o) {
    let r = null;
    try { r = o.effect(c); } catch (e) { r = null; }
    if (!r) return null;
    return { m: clamp(st.money + r.m, 0, 99999) - st.money, b: clamp(st.body + r.b, 0, 100) - st.body, s: clamp(st.mind + r.s, 0, 100) - st.mind, raw: r };
  }
  // 해당 캐릭터가 고를 수 있는 선택지 번호 (잠긴 이유 포함)
  //   추가 규칙: 지금 상태에서 잃을 것도 얻을 것도 없는 선택지는 잠근다 (잃을 돈이 없음, 이미 꽉 차서 얻을 수 없음 등).
  //   단, 그 규칙 때문에 모든 선택지가 잠기면 그 규칙으로 잠근 것은 다시 연다.
  function optionStatus(ch, st, sc) {
    const c = withState(ch, st);
    const list = sc.options.map((o, i) => {
      let lock = o.lock(c), auto = false;
      const e = previewEffect(c, st, o);
      if (!lock && e && e.m === 0 && e.b === 0 && e.s === 0) {
        auto = true;
        lock = e.raw.m < 0 && st.money <= 0 ? "잃을 돈이 없다" : (e.raw.m > 0 || e.raw.b > 0 || e.raw.s > 0) ? "지금은 더 얻을 것이 없다" : "지금 너에게는 아무 변화가 없는 선택이다";
      }
      return { index: i, text: o.text, lock, auto, effect: e };
    });
    if (list.every(x => x.lock) && list.some(x => x.auto)) list.forEach(x => { if (x.auto) { x.lock = null; x.auto = false; } });
    return list;
  }

  // 학생이 고른 선택지를 이 캐릭터가 고를 수 없으면, 첫 번째 열린 선택지로
  function resolveChoice(ch, st, sc, wanted) {
    const status = optionStatus(ch, st, sc);
    if (status[wanted] && !status[wanted].lock) return wanted;
    const open = status.find(s => !s.lock);
    return open ? open.index : wanted;
  }

  // 한 라운드 적용 → { state, result }
  //   opts.round        라운드 번호(0부터). 7라운드(인덱스 6)까지는 몸이 0이 되어도 1로 살려 둔다. 8라운드부터 몸이 0이면 사망.
  //   opts.noLuck       운 요소 없이 계산 (반사실 비교용)
  //   opts.noStructural 구조적 불이익 없이 계산 (반사실 비교용)
  //   opts.firstGame    수업 개설 후 첫 게임: 사회적 약자가 아닌 캐릭터는 8라운드 이후에도 절대 죽지 않는다
  function applyRound(ch, st, sc, choiceIdx, opts) {
    opts = opts || {};
    const round = opts.round === undefined ? SAFE_ROUNDS : opts.round;
    if (st.dead) {
      return { state: Object.assign({}, st), result: { choice: -1, substituted: false, dm: 0, db: 0, ds: 0, why: "더 이상 게임을 할 수 없다.", text: "—", dead: true, skipped: true, deadRound: st.deadRound, deadWhy: st.deadWhy, notes: [] } };
    }
    const idx = resolveChoice(ch, st, sc, choiceIdx);
    const c = withState(ch, st);
    const r = sc.options[idx].effect(c);
    // 운 요소: ±10% (소수점은 버림). 재현 가능하도록 seed 없이 간단히
    const luck = () => opts.noLuck ? 1 : 0.9 + Math.random() * 0.2;
    let dm = Math.round(r.m * (r.m < 0 ? luck() : 1));
    let db = Math.round(r.b * (r.b < 0 ? luck() : 1));
    let ds = Math.round(r.s * (r.s < 0 ? luck() : 1));
    const sx = opts.noStructural ? { m: 0, b: 0, s: 0, notes: [] } : structural(ch, st);
    const next = Object.assign({}, st);
    next.money = clamp(st.money + dm + sx.m, 0, 99999);
    next.body = clamp(st.body + db + sx.b, 0, 100);
    next.mind = clamp(st.mind + ds + sx.s, 0, 100);
    let dead = false, deadWhy = null, rec = 0;
    const immune = !!opts.firstGame && isPrivileged(ch);           // 첫 게임의 비약자: 죽지 않는다
    // 희귀 시나리오의 치명 규칙(sc.fatal): 8라운드부터 해당 캐릭터는 남은 게이지와 상관없이 사망
    const fatalWhy = !immune && round >= SAFE_ROUNDS && typeof sc.fatal === "function" ? sc.fatal(c) : null;
    if (fatalWhy) {
      dead = true; deadWhy = fatalWhy; next.dead = true; next.deadRound = round; next.deadWhy = deadWhy;
    } else if (!immune && round >= SAFE_ROUNDS && ch.age >= ELDERLY_RISK_AGE && EXTREME_TEMP[sc.id]) {
      dead = true; deadWhy = `${EXTREME_TEMP[sc.id]} 속에서 갑자기 고혈압이 악화되어`; next.dead = true; next.deadRound = round; next.deadWhy = deadWhy;
    } else if (next.body <= 0) {
      if (round < SAFE_ROUNDS || immune) next.body = 1;            // 7라운드까지는 절대 죽지 않는다 (첫 게임의 비약자는 끝까지)
      else { dead = true; deadWhy = next.money <= 0 ? "굶주림과 병으로" : "다쳐서"; next.dead = true; next.deadRound = round; next.deadWhy = deadWhy; }
    }
    if (!dead) {
      // 재난과 재난 사이의 회복: 몸은 의료 접근이 좋을수록 더 회복, 마음은 조금
      rec = 5 + (ch.med || 0) * 2;
      next.body = clamp(next.body + rec, 0, 100);
      next.mind = clamp(next.mind + 2, 0, 100);
      if (next.body - st.body - db - sx.b > 0) sx.notes.push(`다음 재난 전까지 쉬며 몸 +${next.body - clamp(st.body + db + sx.b, 0, 100)} 회복`);
    }
    return {
      state: next,
      result: { choice: idx, substituted: idx !== choiceIdx, dm: next.money - st.money, db: next.body - st.body, ds: next.mind - st.mind, why: r.why, text: sc.options[idx].text, notes: sx.notes, dead, deadRound: dead ? round : undefined, deadWhy },
    };
  }

  // 약자 조건을 떼어 낸 채 같은 선택으로 다시 돌려 보기 → { vuls, actual, cf }
  //   실제 결과(운 없음)와 반사실 결과(운 없음·구조적 불이익 없음·조건 제거)를 나란히 계산
  function counterfactual(ch, scenarioList, choices) {
    const vuls = vulnerabilities(ch);
    if (!vuls.length) return null;
    const run = (character, noStructural) => {
      let st = newState(character);
      scenarioList.forEach((sc, i) => { st = applyRound(character, st, sc, choices[i], { round: i, noLuck: true, noStructural }).state; });
      return { state: st, score: score(st) };
    };
    return { vuls, actual: run(ch, false), cf: run(counterfactualChar(ch), true) };
  }

  // 최종 점수 = 남은 재산(코인 그대로) + 몸 + 마음
  //   비율로 환산하지 않음 — 출발선의 불평등이 점수에 그대로 드러나게 하려는 의도
  function score(st) {
    const moneyScore = Math.max(0, Math.round(st.money));
    return { moneyScore, total: moneyScore + st.body + st.mind };
  }

  // 한 라운드에서 '피해 크기' = 몸 손실 + 마음 손실 + 재산 손실 비율(×100)
  function lossOf(res, st) {
    const moneyLoss = st.start > 0 ? Math.max(0, -res.dm) / st.start * 100 : 0;
    return Math.max(0, -res.db) + Math.max(0, -res.ds) + moneyLoss;
  }

  // 16명 전원을 같은 라운드·같은 선택으로 돌려 보기 (불평등 카드, 최종 순위용)
  function simulateAll(scenarioList, choices, seed, opts) {
    opts = opts || {};
    // seed가 있으면 운 요소 없이 (결정적) 계산
    const origRandom = Math.random;
    if (seed !== undefined) Math.random = () => 0.5;
    const out = CHARACTERS.map(ch => {
      let st = newState(ch);
      const rounds = [];
      scenarioList.forEach((sc, i) => {
        const { state, result } = applyRound(ch, st, sc, choices[i], { round: i, noLuck: seed !== undefined, firstGame: opts.firstGame });
        rounds.push({ result, loss: lossOf(result, st) });
        st = state;
      });
      return { ch, state: st, rounds, score: score(st) };
    });
    Math.random = origRandom;
    return out;
  }

  // 시나리오 20개 중 무작위 10개
  //   rare가 붙은 희귀 시나리오는 보통 뽑기에서 빠지고, 각자의 확률(rare)로만 끼어든다.
  //   끼어들 때는 8라운드 이후(SAFE_ROUNDS부터) 자리 하나를 대신 차지한다 → 치명 규칙이 실제로 작동하는 구간.
  //   opts.firstGame 이면 희귀 시나리오는 끼어들지 않는다 (첫 게임은 불평등만 겪게).
  function drawScenarios(n, opts) {
    n = n || 10; opts = opts || {};
    const arr = SCENARIOS.filter(s => !s.rare);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const picked = arr.slice(0, n);
    if (n > SAFE_ROUNDS && !opts.firstGame) {
      SCENARIOS.filter(s => s.rare).forEach(s => {
        if (Math.random() < s.rare) picked[SAFE_ROUNDS + Math.floor(Math.random() * (n - SAFE_ROUNDS))] = s;
      });
    }
    return picked;
  }

  const ENGINE = { newState, optionStatus, resolveChoice, applyRound, score, lossOf, simulateAll, drawScenarios, clamp, vulnerabilities, structural, counterfactual, counterfactualChar, previewEffect, isPrivileged, SAFE_ROUNDS, DEVELOPED };
  if (typeof module !== "undefined") module.exports = ENGINE;
  root.ENGINE = ENGINE;
})(typeof window !== "undefined" ? window : globalThis);
