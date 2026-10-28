// ============================================================
// 사운드: BGM + 효과음 (Web Audio로 직접 합성, 음원 파일 없음)
//   SOUND.bgm("lobby" | "choose" | "choose_heat" | "choose_water" | "choose_cold" | "choose_social" | "reveal" | "final" | "title" | null)
//   SOUND.sfx("click" | "submit" | "disaster" | "loss" | "gain" | "reveal" | "join" | "drum" | "fanfare" | "tick"
//             | "heat" | "rain" | "storm" | "fire" | "cold" | "drought" | "crowd" | "pop" | "drain" | "rise")
//   SOUND.bgmFor(category) / SOUND.sfxFor(category)  category: heat|water|storm|fire|cold|drought|social
//   SOUND.toggle() / SOUND.enabled
//   브라우저 정책상 첫 터치·클릭 뒤에 소리가 납니다.
// ============================================================
(function (root) {
  let ctx = null, master = null, bgmGain = null, sfxGain = null;
  let enabled = true;
  try { enabled = localStorage.getItem("cg-sound") !== "off"; } catch (e) {}
  let muted = false;    // true면 소리 기능 자체를 쓰지 않음 (학생 기기)
  let current = null;   // 현재 BGM 이름
  let bgmTimer = null;  // 스케줄러
  let bgmNodes = [];

  function ensure() {
    if (muted) return false;
    if (ctx) { if (ctx.state === "suspended") ctx.resume(); return true; }
    const AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = enabled ? 1 : 0; master.connect(ctx.destination);
    bgmGain = ctx.createGain(); bgmGain.gain.value = 0.16; bgmGain.connect(master);
    sfxGain = ctx.createGain(); sfxGain.gain.value = 0.5; sfxGain.connect(master);
    return true;
  }
  // 첫 상호작용에서 깨우기
  ["pointerdown", "keydown", "touchstart"].forEach(ev => root.addEventListener(ev, () => { if (ensure() && current) startBgm(current); }, { once: false, passive: true }));

  // ---------- 기본 악기 ----------
  const NOTE = {};
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  for (let o = 1; o <= 7; o++) names.forEach((n, i) => { NOTE[n + o] = 440 * Math.pow(2, (o * 12 + i - 57) / 12); });
  const f = n => (typeof n === "number" ? n : NOTE[n]);

  function tone(dest, freq, t, dur, type, vol, attack, release) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || "triangle"; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + (attack || 0.01));
    g.gain.setValueAtTime(vol, t + dur - (release || 0.05));
    g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.02);
    return o;
  }
  function noise(dest, t, dur, vol, filterFreq) {
    const len = Math.ceil(ctx.sampleRate * dur), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = ctx.createBufferSource(); s.buffer = buf;
    const flt = ctx.createBiquadFilter(); flt.type = "lowpass"; flt.frequency.value = filterFreq || 1200;
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(flt); flt.connect(g); g.connect(dest); s.start(t); s.stop(t + dur);
  }
  function kick(dest, t, vol) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.3);
  }

  // ---------- BGM 패턴 (bpm, 반복되는 마디) ----------
  // 각 패턴: { bpm, bars: 마디 수, beat(i, t, step) } i = 16분음표 인덱스
  const BGM = {
    title: { bpm: 100, steps: 32, play(i, t, s) {
      const mel = ["C5", null, "E5", null, "G5", null, "E5", null, "A4", null, "C5", null, "E5", null, "D5", null, "F4", null, "A4", null, "C5", null, "A4", null, "G4", null, "B4", null, "D5", null, "B4", null];
      const bass = ["C3", "G3", "A2", "E3", "F2", "C3", "G2", "D3"];
      if (mel[i]) tone(bgmGain, f(mel[i]), t, s * 1.6, "triangle", 0.5, 0.02, 0.1);
      if (i % 4 === 0) tone(bgmGain, f(bass[(i / 4) | 0]), t, s * 3.5, "sine", 0.6, 0.02, 0.1);
      if (i % 8 === 4) noise(bgmGain, t, 0.06, 0.15, 3000);
    } },
    lobby: { bpm: 112, steps: 32, play(i, t, s) {
      const mel = ["E5", null, null, "G5", null, "A5", null, null, "G5", null, "E5", null, null, null, "D5", null, "E5", null, null, "G5", null, "B5", null, null, "A5", null, "G5", null, "E5", null, null, null];
      const bass = ["C3", "C3", "A2", "A2", "F2", "F2", "G2", "G2"];
      if (mel[i]) tone(bgmGain, f(mel[i]), t, s * 1.4, "square", 0.18, 0.01, 0.08);
      if (i % 4 === 0) tone(bgmGain, f(bass[(i / 4) | 0]), t, s * 3.2, "triangle", 0.55, 0.02, 0.1);
      if (i % 4 === 0) kick(bgmGain, t, 0.5);
      if (i % 4 === 2) noise(bgmGain, t, 0.05, 0.12, 4000);
    } },
    choose: { bpm: 128, steps: 32, play(i, t, s) {
      // 긴장감: 단조 아르페지오 + 틱틱
      const arp = ["A3", "C4", "E4", "A4", "E4", "C4", "A3", "C4", "G3", "B3", "D4", "G4", "D4", "B3", "G3", "B3", "F3", "A3", "C4", "F4", "C4", "A3", "F3", "A3", "E3", "G#3", "B3", "E4", "B3", "G#3", "E3", "G#3"];
      tone(bgmGain, f(arp[i]), t, s * 0.9, "sawtooth", 0.14, 0.005, 0.05);
      if (i % 8 === 0) kick(bgmGain, t, 0.6);
      if (i % 2 === 1) noise(bgmGain, t, 0.03, 0.08, 6000);
      if (i % 16 === 0) tone(bgmGain, f("A2"), t, s * 15, "sine", 0.5, 0.05, 0.3);
    } },
    reveal: { bpm: 96, steps: 32, play(i, t, s) {
      // 무거운 분위기: 느린 베이스 + 간헐적 화음
      const chords = [["D3", "F3", "A3"], ["A#2", "D3", "F3"], ["C3", "E3", "G3"], ["A2", "C3", "E3"]];
      if (i % 8 === 0) chords[(i / 8) | 0].forEach(n => tone(bgmGain, f(n), t, s * 7.5, "triangle", 0.3, 0.1, 0.4));
      if (i % 4 === 0) kick(bgmGain, t, 0.4);
      if (i % 8 === 4) noise(bgmGain, t, 0.12, 0.1, 1500);
    } },
    final: { bpm: 120, steps: 32, play(i, t, s) {
      const mel = ["C5", "E5", "G5", "C6", null, "G5", null, "E5", "F5", "A5", "C6", "F6", null, "C6", null, "A5", "G5", "B5", "D6", "G6", null, "D6", null, "B5", "C6", null, "G5", null, "E5", null, "C5", null];
      const bass = ["C3", "C3", "F3", "F3", "G3", "G3", "C3", "C3"];
      if (mel[i]) tone(bgmGain, f(mel[i]), t, s * 1.5, "square", 0.16, 0.01, 0.08);
      if (i % 4 === 0) tone(bgmGain, f(bass[(i / 4) | 0]), t, s * 3.5, "triangle", 0.5, 0.02, 0.1);
      if (i % 4 === 0) kick(bgmGain, t, 0.5);
      if (i % 4 === 2) noise(bgmGain, t, 0.06, 0.14, 4000);
    } },
    // ---- 재난 유형별 선택 BGM ----
    choose_heat: { bpm: 120, steps: 32, play(i, t, s) {
      // 폭염·가뭄·산불: 메마른 드론 + 매미 같은 고음 떨림 + 묵직한 박동
      const arp = ["D3", "F3", "A3", "D4", "A3", "F3", "D3", "F3", "C3", "E3", "G3", "C4", "G3", "E3", "C3", "E3", "A#2", "D3", "F3", "A#3", "F3", "D3", "A#2", "D3", "A2", "C#3", "E3", "A3", "E3", "C#3", "A2", "C#3"];
      tone(bgmGain, f(arp[i]), t, s * 0.95, "sawtooth", 0.12, 0.005, 0.05);
      if (i % 2 === 0) tone(bgmGain, 3200 + (i % 8) * 60, t, s * 0.5, "square", 0.025, 0.002, 0.02);
      if (i % 8 === 0) kick(bgmGain, t, 0.55);
      if (i % 16 === 0) tone(bgmGain, f("D2"), t, s * 15, "sine", 0.45, 0.1, 0.4);
    } },
    choose_water: { bpm: 100, steps: 32, play(i, t, s) {
      // 홍수·태풍·해수면: 빗소리 노이즈 + 낮게 구르는 베이스 + 단조 화음
      noise(bgmGain, t, s * 1.2, 0.05, 2500);
      const chords = [["E3", "G3", "B3"], ["C3", "E3", "G3"], ["D3", "F3", "A3"], ["B2", "D3", "F#3"]];
      if (i % 8 === 0) chords[(i / 8) | 0].forEach(n => tone(bgmGain, f(n), t, s * 7.5, "triangle", 0.22, 0.2, 0.5));
      if (i % 4 === 0) tone(bgmGain, f(["E2", "C2", "D2", "B1"][(i / 8) | 0]), t, s * 3.6, "sine", 0.5, 0.05, 0.3);
      if (i % 16 === 8) kick(bgmGain, t, 0.5);
    } },
    choose_cold: { bpm: 84, steps: 32, play(i, t, s) {
      // 한파·얼음: 성긴 고음 종소리 + 차가운 바람 + 느린 베이스
      const mel = ["B5", null, null, null, "F#5", null, null, null, "G5", null, null, null, "D5", null, null, null, "E5", null, null, null, "B4", null, null, null, "C5", null, null, null, "F#4", null, null, null];
      if (mel[i]) tone(bgmGain, f(mel[i]), t, s * 3.5, "sine", 0.35, 0.01, 1.0);
      if (i % 8 === 0) tone(bgmGain, f(["E2", "C2", "D2", "B1"][(i / 8) | 0]), t, s * 7.5, "triangle", 0.35, 0.3, 0.6);
      if (i % 16 === 0) noise(bgmGain, t, s * 14, 0.04, 900);
    } },
    choose_social: { bpm: 108, steps: 32, play(i, t, s) {
      // 대피소·난민·폭동·회의: 긴장된 행진 리듬 + 반복 베이스 + 낮은 종
      const bass = ["A2", "A2", "A2", "C3", "G2", "G2", "G2", "A#2"];
      if (i % 4 === 0) tone(bgmGain, f(bass[(i / 4) | 0]), t, s * 1.8, "triangle", 0.5, 0.01, 0.1);
      if (i % 4 === 2) tone(bgmGain, f(bass[(i / 4) | 0]) * 2, t, s * 0.9, "square", 0.08, 0.005, 0.05);
      if (i % 8 === 0 || i % 8 === 3 || i % 8 === 6) kick(bgmGain, t, 0.45);
      if (i % 2 === 1) noise(bgmGain, t, 0.03, 0.07, 5000);
      if (i % 32 === 0) tone(bgmGain, f("A3"), t, s * 10, "sine", 0.18, 0.05, 1.5);
    } },
  };

  function stopBgm() {
    if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null; }
  }
  function startBgm(name) {
    stopBgm();
    const p = BGM[name]; if (!p || !ctx) return;
    const step = 60 / p.bpm / 4; // 16분음표 길이(초)
    let i = 0, next = ctx.currentTime + 0.05;
    const schedule = () => {
      while (next < ctx.currentTime + 0.3) {
        p.play(i % p.steps, next, step);
        next += step; i++;
      }
    };
    schedule();
    bgmTimer = setInterval(schedule, 100);
  }
  function bgm(name) {
    if (muted) { current = null; stopBgm(); return; }
    if (name === current) return;
    current = name;
    if (!ctx) return;             // 첫 상호작용 때 startBgm(current)로 시작됨
    if (!name) { stopBgm(); return; }
    startBgm(name);
  }

  // ---------- 효과음 ----------
  const SFX = {
    click() { tone(sfxGain, 880, ctx.currentTime, 0.06, "square", 0.25, 0.005, 0.03); },
    tick() { tone(sfxGain, 1200, ctx.currentTime, 0.03, "square", 0.15, 0.002, 0.01); },
    join() { const t = ctx.currentTime; tone(sfxGain, f("E5"), t, 0.08, "triangle", 0.4); tone(sfxGain, f("G5"), t + 0.08, 0.12, "triangle", 0.4); },
    submit() { const t = ctx.currentTime; tone(sfxGain, f("C5"), t, 0.08, "square", 0.3); tone(sfxGain, f("E5"), t + 0.08, 0.08, "square", 0.3); tone(sfxGain, f("G5"), t + 0.16, 0.18, "square", 0.3); },
    disaster() { const t = ctx.currentTime; noise(sfxGain, t, 0.9, 0.6, 600); tone(sfxGain, 70, t, 0.8, "sawtooth", 0.5, 0.05, 0.4); tone(sfxGain, 55, t + 0.1, 0.9, "sawtooth", 0.4, 0.05, 0.5); },
    loss() { const t = ctx.currentTime; tone(sfxGain, f("E4"), t, 0.12, "sawtooth", 0.35); tone(sfxGain, f("C4"), t + 0.12, 0.12, "sawtooth", 0.35); tone(sfxGain, f("A3"), t + 0.24, 0.3, "sawtooth", 0.35, 0.01, 0.2); },
    gain() { const t = ctx.currentTime; tone(sfxGain, f("C5"), t, 0.08, "triangle", 0.4); tone(sfxGain, f("E5"), t + 0.07, 0.08, "triangle", 0.4); tone(sfxGain, f("G5"), t + 0.14, 0.08, "triangle", 0.4); tone(sfxGain, f("C6"), t + 0.21, 0.25, "triangle", 0.4, 0.01, 0.15); },
    drum() { const t = ctx.currentTime; for (let k = 0; k < 12; k++) { noise(sfxGain, t + k * 0.09, 0.08, 0.35, 900); kick(sfxGain, t + k * 0.09, 0.5); } },
    reveal() { const t = ctx.currentTime; kick(sfxGain, t, 0.9); noise(sfxGain, t, 0.5, 0.5, 2000); tone(sfxGain, f("D3"), t, 0.6, "sawtooth", 0.3, 0.01, 0.4); tone(sfxGain, f("A3"), t + 0.05, 0.6, "sawtooth", 0.25, 0.01, 0.4); },
    fanfare() { const t = ctx.currentTime; [["C5", 0], ["C5", 0.12], ["C5", 0.24], ["E5", 0.36], ["G5", 0.6], ["E5", 0.84], ["G5", 0.96]].forEach(([n, d], k) => tone(sfxGain, f(n), t + d, k === 6 ? 0.6 : 0.14, "square", 0.3, 0.01, 0.08)); noise(sfxGain, t + 0.96, 0.5, 0.3, 5000); },
    // ---- 재난 유형별 효과음 ----
    heat() { const t = ctx.currentTime; noise(sfxGain, t, 1.2, 0.18, 7000); tone(sfxGain, 2800, t, 1.1, "square", 0.05, 0.3, 0.5); tone(sfxGain, 48, t, 1.2, "sawtooth", 0.4, 0.3, 0.6); tone(sfxGain, f("D3"), t + 0.2, 0.9, "sawtooth", 0.2, 0.3, 0.5); },
    rain() { const t = ctx.currentTime; noise(sfxGain, t, 1.4, 0.45, 2200); noise(sfxGain, t + 0.5, 1.0, 0.3, 1200); kick(sfxGain, t + 0.3, 0.7); tone(sfxGain, 45, t + 0.3, 1.0, "sine", 0.5, 0.05, 0.6); },
    storm() { const t = ctx.currentTime; noise(sfxGain, t, 1.6, 0.5, 700); noise(sfxGain, t + 0.2, 1.2, 0.35, 350); kick(sfxGain, t + 0.6, 0.9); noise(sfxGain, t + 0.6, 0.6, 0.5, 1800); tone(sfxGain, 40, t + 0.6, 0.9, "sawtooth", 0.4, 0.02, 0.6); },
    fire() { const t = ctx.currentTime; noise(sfxGain, t, 1.4, 0.3, 3500); for (let k = 0; k < 10; k++) noise(sfxGain, t + 0.08 + Math.random() * 1.1, 0.04, 0.35, 6000 + Math.random() * 3000); tone(sfxGain, 60, t, 1.3, "sawtooth", 0.35, 0.2, 0.6); },
    cold() { const t = ctx.currentTime; noise(sfxGain, t, 1.6, 0.25, 900); tone(sfxGain, f("B5"), t + 0.1, 0.8, "sine", 0.3, 0.01, 0.6); tone(sfxGain, f("F#6"), t + 0.35, 0.8, "sine", 0.22, 0.01, 0.6); tone(sfxGain, f("E2"), t, 1.4, "triangle", 0.3, 0.3, 0.6); },
    drought() { const t = ctx.currentTime; noise(sfxGain, t, 1.5, 0.22, 1400); tone(sfxGain, 42, t, 1.4, "sawtooth", 0.35, 0.4, 0.6); tone(sfxGain, f("A3"), t + 0.3, 0.5, "triangle", 0.15, 0.1, 0.3); tone(sfxGain, f("F3"), t + 0.8, 0.6, "triangle", 0.15, 0.1, 0.4); },
    crowd() { const t = ctx.currentTime; noise(sfxGain, t, 1.3, 0.2, 500); for (let k = 0; k < 14; k++) tone(sfxGain, 160 + Math.random() * 220, t + Math.random() * 1.0, 0.12, "triangle", 0.06, 0.02, 0.06); tone(sfxGain, f("A2"), t, 1.2, "sine", 0.3, 0.05, 0.8); kick(sfxGain, t + 0.1, 0.6); },
    // ---- 게이지·화면 효과음 ----
    pop() { const t = ctx.currentTime; tone(sfxGain, f("G5"), t, 0.07, "triangle", 0.35, 0.005, 0.03); tone(sfxGain, f("C6"), t + 0.06, 0.1, "triangle", 0.3, 0.005, 0.05); },
    drain() { const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sawtooth"; o.frequency.setValueAtTime(900, t); o.frequency.exponentialRampToValueAtTime(140, t + 0.9); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.22, t + 0.05); g.gain.exponentialRampToValueAtTime(0.001, t + 0.95); o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t + 1); noise(sfxGain, t, 0.9, 0.12, 1500); },
    rise() { const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = "triangle"; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(1100, t + 0.7); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.25, t + 0.05); g.gain.exponentialRampToValueAtTime(0.001, t + 0.8); o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t + 0.85); tone(sfxGain, f("C6"), t + 0.6, 0.25, "triangle", 0.3, 0.01, 0.15); },
  };
  // 재난 유형 → BGM / 효과음 이름
  const CAT_BGM = { heat: "choose_heat", drought: "choose_heat", fire: "choose_heat", water: "choose_water", storm: "choose_water", cold: "choose_cold", social: "choose_social" };
  const CAT_SFX = { heat: "heat", drought: "drought", fire: "fire", water: "rain", storm: "storm", cold: "cold", social: "crowd" };
  const bgmFor = cat => CAT_BGM[cat] || "choose";
  const sfxFor = cat => CAT_SFX[cat] || "disaster";
  function sfx(name) { if (muted || !ensure() || !enabled) return; try { SFX[name] && SFX[name](); } catch (e) {} }

  function setEnabled(on) {
    enabled = on;
    try { localStorage.setItem("cg-sound", on ? "on" : "off"); } catch (e) {}
    if (master) master.gain.setTargetAtTime(on ? 1 : 0, ctx.currentTime, 0.05);
    if (on && ctx && current && !bgmTimer) startBgm(current);
  }
  function toggle() { setEnabled(!enabled); return enabled; }
  function mute(on) { muted = on; if (on) { current = null; stopBgm(); if (master) master.gain.setTargetAtTime(0, ctx.currentTime, 0.02); } else if (master) master.gain.setTargetAtTime(enabled ? 1 : 0, ctx.currentTime, 0.02); }

  root.SOUND = { bgm, sfx, bgmFor, sfxFor, toggle, setEnabled, mute, get enabled() { return enabled; } };
})(window);
