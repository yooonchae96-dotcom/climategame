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

  // 캐릭터 + 현재 상태를 합친 객체 (선택지 함수는 현재 재산을 본다)
  function withState(ch, st) {
    return Object.assign({}, ch, { money: st.money, body: st.body, mind: st.mind });
  }

  // 해당 캐릭터가 고를 수 있는 선택지 번호 (잠긴 이유 포함)
  function optionStatus(ch, st, sc) {
    const c = withState(ch, st);
    return sc.options.map((o, i) => ({ index: i, text: o.text, lock: o.lock(c) }));
  }

  // 학생이 고른 선택지를 이 캐릭터가 고를 수 없으면, 첫 번째 열린 선택지로
  function resolveChoice(ch, st, sc, wanted) {
    const status = optionStatus(ch, st, sc);
    if (status[wanted] && !status[wanted].lock) return wanted;
    const open = status.find(s => !s.lock);
    return open ? open.index : wanted;
  }

  // 한 라운드 적용 → { state, result }
  function applyRound(ch, st, sc, choiceIdx) {
    const idx = resolveChoice(ch, st, sc, choiceIdx);
    const c = withState(ch, st);
    const r = sc.options[idx].effect(c);
    // 운 요소: ±10% (소수점은 버림). 재현 가능하도록 seed 없이 간단히
    const luck = () => 0.9 + Math.random() * 0.2;
    let dm = Math.round(r.m * (r.m < 0 ? luck() : 1));
    let db = Math.round(r.b * (r.b < 0 ? luck() : 1));
    let ds = Math.round(r.s * (r.s < 0 ? luck() : 1));
    const next = Object.assign({}, st);
    next.money = clamp(st.money + dm, 0, 99999);
    next.body = clamp(st.body + db, 0, 100);
    next.mind = clamp(st.mind + ds, 0, 100);
    return {
      state: next,
      result: { choice: idx, substituted: idx !== choiceIdx, dm: next.money - st.money, db: next.body - st.body, ds: next.mind - st.mind, why: r.why, text: sc.options[idx].text },
    };
  }

  // 최종 점수 = 재산 점수(시작 대비 남은 비율×100, 최대 100) + 몸 + 마음
  function score(st) {
    const moneyScore = st.start > 0 ? clamp(Math.round(st.money / st.start * 100), 0, 100) : 0;
    return { moneyScore, total: moneyScore + st.body + st.mind };
  }

  // 한 라운드에서 '피해 크기' = 몸 손실 + 마음 손실 + 재산 손실 비율(×100)
  function lossOf(res, st) {
    const moneyLoss = st.start > 0 ? Math.max(0, -res.dm) / st.start * 100 : 0;
    return Math.max(0, -res.db) + Math.max(0, -res.ds) + moneyLoss;
  }

  // 16명 전원을 같은 라운드·같은 선택으로 돌려 보기 (불평등 카드, 최종 순위용)
  function simulateAll(scenarioList, choices, seed) {
    // seed가 있으면 운 요소 없이 (결정적) 계산
    const origRandom = Math.random;
    if (seed !== undefined) Math.random = () => 0.5;
    const out = CHARACTERS.map(ch => {
      let st = newState(ch);
      const rounds = [];
      scenarioList.forEach((sc, i) => {
        const { state, result } = applyRound(ch, st, sc, choices[i]);
        rounds.push({ result, loss: lossOf(result, st) });
        st = state;
      });
      return { ch, state: st, rounds, score: score(st) };
    });
    Math.random = origRandom;
    return out;
  }

  // 시나리오 20개 중 무작위 10개
  function drawScenarios(n) {
    const arr = SCENARIOS.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, n || 10);
  }

  const ENGINE = { newState, optionStatus, resolveChoice, applyRound, score, lossOf, simulateAll, drawScenarios, clamp };
  if (typeof module !== "undefined") module.exports = ENGINE;
  root.ENGINE = ENGINE;
})(typeof window !== "undefined" ? window : globalThis);
