// ============================================================
// 기후 불평등 게임 - 데이터 파일
// 교사가 숫자와 문장을 직접 고칠 수 있도록 모든 내용을 이 파일에 모았습니다.
// ============================================================

// ------------------------------------------------------------
// 1. 캐릭터 16명
//   money: 시작 재산(코인) / body: 몸 건강 / mind: 마음 건강
//   숨은 수치 (학생에게는 숫자로 보이지 않음)
//     alert   경보 수신력 0~3 (0 없음, 3 높음)
//     mob     이동 수단 0~3 (0 휠체어·계단 불가, 1 도보, 2 자가용·스노모빌, 3 자가 비행기)
//     guard   보호자 0~2 (0 없음, 1 일부 시간만, 2 있음)
//     med     의료 접근 0~4
//     aid     구호 우선순위 0~4
//     viol    폭력 노출 위험 0~4
//     ins     보험 (0/1) / pass 여권 (0/1) / net 인터넷·기기 (0/1)
//     aircon  에어컨 (0/1) / car 자가용 (0/1)
//     tags    처지를 설명하는 꼬리표
// ------------------------------------------------------------
const CHARACTERS = [
  { id: 1,  name: "파이살",  age: 17, sex: "남", place: "카타르 도하, 석유 가문 대저택", money: 500, body: 100, mind: 100, color: "#FFC300",
    traits: ["초부유층", "자가 비행기", "어디든 갈 수 있는 여권"], strength: "가족과 공동체의 결속이 강하고 손님을 극진히 대접하는 문화 속에서 자랐다.",
    alert: 3, mob: 3, guard: 2, med: 4, aid: 4, viol: 0, ins: 1, pass: 1, net: 1, aircon: 1, car: 1, tags: ["wealthy", "employer"] },
  { id: 2,  name: "올리비아", age: 14, sex: "여", place: "호주 시드니 해변가 주택", money: 350, body: 100, mind: 100, color: "#FF5E78",
    traits: ["변호사 부모", "보험 완비", "산불 위험 지역"], strength: "바다와 숲을 사랑하고 환경 동아리에서 활동한다.",
    alert: 3, mob: 2, guard: 2, med: 3, aid: 3, viol: 0, ins: 1, pass: 1, net: 1, aircon: 1, car: 1, tags: ["wealthy", "female", "bushfire"] },
  { id: 3,  name: "민준",    age: 15, sex: "남", place: "한국 서울 강남 아파트", money: 300, body: 100, mind: 100, color: "#00B4FF",
    traits: ["대기업 임원 부모", "에어컨·자가용", "고층 아파트"], strength: "빠른 인터넷과 학교 교육 덕분에 정보를 찾는 일에 익숙하다.",
    alert: 3, mob: 2, guard: 2, med: 3, aid: 3, viol: 0, ins: 1, pass: 1, net: 1, aircon: 1, car: 1, tags: ["wealthy", "highrise"] },
  { id: 4,  name: "루이",    age: 19, sex: "남", place: "프랑스 파리 시내", money: 180, body: 80, mind: 100, color: "#8E44FF",
    traits: ["중산층", "휠체어 사용", "엘리베이터 없는 건물 4층"], strength: "장애인 권리 모임에서 활동하며 시민 운동에 밝다.",
    alert: 3, mob: 0, guard: 0, med: 3, aid: 2, viol: 1, ins: 1, pass: 1, net: 1, aircon: 0, car: 0, tags: ["disability", "stairs", "alone"] },
  { id: 5,  name: "헬가",    age: 78, sex: "여", place: "독일 뮌헨 단독주택", money: 220, body: 80, mind: 100, color: "#1DE9B6",
    traits: ["은퇴 교사", "혼자 삶", "더위·추위에 약함"], strength: "연금이 안정적이고 이웃 모임에서 오래 활동했다.",
    alert: 2, mob: 1, guard: 0, med: 3, aid: 2, viol: 0, ins: 1, pass: 1, net: 1, aircon: 0, car: 0, tags: ["elderly", "alone", "female"] },
  { id: 6,  name: "자스민",  age: 16, sex: "여", place: "미국 휴스턴 저지대 임대주택", money: 40, body: 100, mind: 100, color: "#FF2DAA",
    traits: ["흑인", "엄마와 둘이 삶(엄마는 야간 근무)", "자동차·보험 없음"], strength: "교회 공동체와 이웃이 서로 돕는 동네에 산다.",
    alert: 2, mob: 1, guard: 1, med: 1, aid: 1, viol: 3, ins: 0, pass: 1, net: 1, aircon: 0, car: 0, tags: ["female", "renter", "lowland", "nightalone"] },
  { id: 7,  name: "아푸티",  age: 15, sex: "남", place: "캐나다 북극권 이누이트 마을", money: 60, body: 100, mind: 100, color: "#40E0FF",
    traits: ["원주민", "바다 얼음 사냥으로 식량 마련", "병원까지 비행기 2시간"], strength: "얼음과 날씨를 읽는 전통 지식을 할아버지에게 배웠다.",
    alert: 2, mob: 2, guard: 2, med: 1, aid: 1, viol: 0, ins: 0, pass: 1, net: 1, aircon: 0, car: 0, tags: ["indigenous", "remote", "arctic"] },
  { id: 8,  name: "영수",    age: 82, sex: "남", place: "한국 농촌, 혼자 사는 할아버지", money: 35, body: 80, mind: 100, color: "#9CFF2E",
    traits: ["고령 독거", "휴대전화 문자 못 읽음", "비닐하우스 농사가 전 재산"], strength: "50년 농사 경험으로 날씨 변화를 몸으로 안다.",
    alert: 1, mob: 1, guard: 0, med: 2, aid: 2, viol: 0, ins: 0, pass: 1, net: 0, aircon: 0, car: 0, tags: ["elderly", "alone", "farmer", "korea"] },
  { id: 9,  name: "아르준",  age: 11, sex: "남", place: "인도 델리 건설 현장 옆 판자촌", money: 10, body: 100, mind: 100, color: "#FF7A00",
    traits: ["아빠가 건설 노동자", "폭염 속 야외 노동", "학교 못 감"], strength: "판자촌 아이들끼리 서로 챙기는 끈끈한 우정이 있다.",
    alert: 1, mob: 1, guard: 1, med: 1, aid: 1, viol: 2, ins: 0, pass: 0, net: 0, aircon: 0, car: 0, tags: ["child", "outdoor", "slum", "poor"] },
  { id: 10, name: "사니타",  age: 13, sex: "여", place: "네팔 산간 마을 비탈 흙집", money: 8, body: 100, mind: 100, color: "#FF1E56",
    traits: ["농부 딸", "라디오·전기 없음", "물 길어 오는 담당"], strength: "산길을 누구보다 잘 알고 마을 사람 모두가 서로를 안다.",
    alert: 0, mob: 1, guard: 2, med: 0, aid: 1, viol: 3, ins: 0, pass: 0, net: 0, aircon: 0, car: 0, tags: ["female", "child", "mountain", "farmer", "poor", "water"] },
  { id: 11, name: "라피크",  age: 14, sex: "남", place: "방글라데시 해안 어촌", money: 12, body: 100, mind: 100, color: "#00E5C8",
    traits: ["어부 아들", "해수면 1m 높이에 삶", "대피소까지 5km"], strength: "배를 다루고 바다를 읽는 솜씨가 좋다.",
    alert: 1, mob: 1, guard: 2, med: 1, aid: 1, viol: 2, ins: 0, pass: 0, net: 0, aircon: 0, car: 0, tags: ["coast", "boat", "poor", "outdoor"] },
  { id: 12, name: "테아",    age: 12, sex: "여", place: "투발루 산호섬", money: 15, body: 100, mind: 100, color: "#C6FF00",
    traits: ["섬 전체가 해수면 상승 위기", "다른 나라 국적 못 얻음"], strength: "섬 공동체가 노래와 춤으로 서로를 지탱한다.",
    alert: 2, mob: 1, guard: 2, med: 1, aid: 1, viol: 2, ins: 0, pass: 1, net: 0, aircon: 0, car: 0, tags: ["island", "female", "child", "novisa", "boat", "poor"] },
  { id: 13, name: "마리셀",  age: 15, sex: "여", place: "필리핀 마닐라 강변 빈민가", money: 6, body: 100, mind: 100, color: "#FFE600",
    traits: ["청각장애", "경보 사이렌 못 들음", "수화 통역 없음"], strength: "농인 친구 모임이 있고 눈치가 빠르다.",
    alert: 0, mob: 1, guard: 2, med: 0, aid: 1, viol: 3, ins: 0, pass: 0, net: 0, aircon: 0, car: 0, tags: ["deaf", "disability", "female", "slum", "lowland", "poor"] },
  { id: 14, name: "사이토티", age: 12, sex: "남", place: "케냐 북부 유목민 가정", money: 20, body: 100, mind: 100, color: "#FF3B30",
    traits: ["마사이족", "가축이 전 재산", "가뭄으로 우물 말라감"], strength: "먼 길을 걷는 체력과 가축을 돌보는 지식이 있다.",
    alert: 0, mob: 1, guard: 2, med: 0, aid: 1, viol: 2, ins: 0, pass: 0, net: 0, aircon: 0, car: 0, tags: ["pastoral", "child", "drought", "poor", "water", "indigenous"] },
  { id: 15, name: "카우에",  age: 13, sex: "남", place: "브라질 아마존 원주민 마을", money: 9, body: 100, mind: 100, color: "#00D26A",
    traits: ["원주민", "숲이 생계·집·약", "벌목·산불로 숲 사라짐"], strength: "숲의 식물과 약초를 아는 지식을 물려받았다.",
    alert: 0, mob: 1, guard: 2, med: 0, aid: 0, viol: 2, ins: 0, pass: 0, net: 0, aircon: 0, car: 0, tags: ["indigenous", "forest", "child", "poor", "boat"] },
  { id: 16, name: "아미라",  age: 14, sex: "여", place: "요르단 난민 캠프 천막", money: 5, body: 100, mind: 100, color: "#2962FF",
    traits: ["시리아 난민, 무국적", "엄마·동생들과 삶", "천막은 홍수·폭염에 무방비"], strength: "동생들을 돌보며 캠프 안에서 또래 친구들과 수업을 열었다.",
    alert: 1, mob: 1, guard: 1, med: 0, aid: 0, viol: 4, ins: 0, pass: 0, net: 0, aircon: 0, car: 0, tags: ["refugee", "female", "child", "camp", "poor", "novisa"] },
];

// ------------------------------------------------------------
// 2. 피해 계산 도우미
//   r(c, {m,b,s,why}) : 재산(m, 코인), 몸(b), 마음(s) 변화와 이유 문장
//   has(c, tag)       : 꼬리표 확인
// ------------------------------------------------------------
const has = (c, t) => c.tags.includes(t);
const poorish = c => c.money < 50;             // 재산이 적은 캐릭터
const R = (m, b, s, why) => ({ m, b, s, why });
const LOCK = (c, cond, reason) => (cond ? reason : null);
// 남아서 몸으로 막는 선택(둑 쌓기·불 막기·집 지키기)의 추가 몸 손실
//   노인 20, 어린이 10, 여성 10 (겹치면 합산) — 힘쓰는 일이 더 고된 처지를 반영
const LABOR = c => (has(c, "elderly") ? 20 : 0) + (has(c, "child") ? 10 : 0) + (c.sex === "여" ? 10 : 0);
// 휠체어 사용자(mob 0)는 몸으로 막는 선택을 아예 고를 수 없다
const NO_LABOR = (c, what) => LOCK(c, c.mob === 0, `휠체어로는 ${what} 수 없다`);

// ------------------------------------------------------------
// 3. 기후 재난 시나리오 20개
//   title, where, story    : 재난 카드
//   situation(c)           : 내 캐릭터의 처지 한 줄
//   options[]              : { text, lock(c) -> 잠긴 이유 또는 null, effect(c) -> R(...) }
//   image                  : images/disaster_XX.png
// ------------------------------------------------------------
const SCENARIOS = [
  // ---------- 1 살인 폭염 ----------
  { id: 1, title: "살인 폭염", where: "인도 델리 · 한국 · 유럽", image: "images/disaster_01.png",
    story: "델리의 낮 기온이 48도를 넘었다. 서울과 파리도 40도를 넘겼다. 거리에서 쓰러지는 사람이 늘고, 병원 응급실이 가득 찼다.",
    situation: c => c.aircon ? "너의 집에는 에어컨이 있다. 창문만 닫으면 시원하다."
      : has(c, "outdoor") ? "너(혹은 너의 가족)는 땡볕 아래서 일해야 돈을 번다. 집에는 선풍기도 없다."
      : has(c, "elderly") ? "너는 더위에 약한 나이다. 집에 에어컨은 없고 물수건으로 버틴다."
      : has(c, "camp") ? "천막 안은 바깥보다 더 뜨겁다. 그늘이 없다."
      : "집에 에어컨이 없다. 선풍기 한 대로 버텨야 한다.",
    options: [
      { text: "실내에서 버틴다", lock: () => null,
        effect: c => c.aircon ? R(-5, 0, 0, "에어컨을 틀고 시원하게 지냈다. 전기요금만 조금 나갔다.")
          : has(c, "elderly") ? R(0, -30, -5, "에어컨이 없는 집에서 체온이 올라 탈진했다.")
          : has(c, "camp") ? R(0, -25, -10, "천막은 실내가 아니었다. 더위에 동생들이 아팠다.")
          : R(0, -15, -5, "에어컨이 없어 밤에도 잠을 못 잤다.") },
      { text: "평소처럼 일·학교에 나간다", lock: () => null,
        effect: c => has(c, "outdoor") ? R(2, -35, -5, "땡볕에서 일하다 쓰러졌다. 일당은 받았지만 몸이 상했다.")
          : c.car ? R(-5, -5, 0, "자가용으로 시원하게 이동했다.")
          : has(c, "elderly") ? R(0, -25, 0, "뙤약볕에서 걷다 어지러워 쓰러졌다.")
          : R(0, -15, 0, "걸어서 다니다 더위를 먹었다.") },
      { text: "시원한 곳으로 떠난다", lock: c => LOCK(c, c.money < 60, "떠날 돈이 없다"),
        effect: c => c.mob === 3 ? R(-30, 0, 5, "자가 비행기로 시원한 나라에 가서 지냈다.")
          : R(-60, 0, 5, "호텔에서 며칠 지냈다. 돈은 들었지만 몸은 지켰다.") },
    ] },

  // ---------- 2 몬순 홍수와 산사태 ----------
  { id: 2, title: "몬순 홍수와 산사태", where: "네팔 산간 마을", image: "images/disaster_02.png",
    story: "밤사이 폭우가 쏟아졌다. 산비탈이 무너져 마을 절반이 흙더미에 묻혔다. 경보는 라디오와 휴대전화 문자로만 나왔다.",
    situation: c => c.alert === 0 ? "너는 경보를 받을 방법이 없다. 라디오도 전기도 없다."
      : c.alert <= 1 ? "경보가 왔지만 너는 그 문자를 읽지 못했거나 늦게 알았다."
      : has(c, "mountain") ? "경보를 들었다. 하지만 집은 비탈 위에 있다."
      : "경보를 바로 받았다. 너의 집은 튼튼한 땅 위에 있다.",
    options: [
      { text: "경보를 듣고 미리 대피한다", lock: c => LOCK(c, c.alert === 0, "경보를 받을 라디오·휴대전화가 없다"),
        effect: c => c.alert >= 2 ? R(-5, 0, 0, "경보를 듣고 일찍 안전한 곳으로 갔다.")
          : R(-10, -15, -10, "경보를 늦게 알아 흙탕물 속을 걸어 빠져나왔다.") },
      { text: "집을 지킨다", lock: () => null,
        effect: c => has(c, "mountain") ? R(-c.money, -40 - LABOR(c), -30, "빗속에서 흙을 퍼내며 버텼지만 비탈 흙집이 무너졌다. 집과 밭, 전 재산을 잃었다.")
          : has(c, "forest") || has(c, "slum") || has(c, "camp") ? R(-Math.round(c.money * 0.6), -30 - LABOR(c), -20, "밤새 물을 퍼냈지만 약한 집이 물에 잠겨 살림살이 대부분을 잃었다.")
          : c.ins ? R(-10, -10 - LABOR(c), -5, "모래주머니를 쌓느라 몸은 고됐다. 집이 조금 침수됐지만 보험이 수리비를 대부분 돌려줬다.")
          : R(-Math.round(c.money * 0.3), -15 - LABOR(c), -10, "밤새 물을 퍼냈지만 집이 침수돼 수리비가 많이 들었다.") },
      { text: "높은 곳 친척 집으로 간다", lock: () => null,
        effect: c => has(c, "mountain") ? R(-Math.round(c.money * 0.8), -15, -20, "목숨은 건졌지만 두고 온 집과 밭이 사라졌다.")
          : has(c, "alone") ? R(-20, -10, -15, "찾아갈 친척이 없어 모텔에서 지냈다.")
          : R(-15, -5, -5, "친척 집에서 안전하게 지냈다.") },
    ] },

  // ---------- 3 사이클론 해안 침수 ----------
  { id: 3, title: "사이클론 해안 침수", where: "방글라데시 해안", image: "images/disaster_03.png",
    story: "거대한 사이클론이 상륙했다. 바닷물이 5m 높이로 밀려와 해안 마을을 덮쳤다. 사이렌이 울리고 사람들이 대피소로 달렸다.",
    situation: c => has(c, "deaf") ? "사이렌이 울렸지만 너는 듣지 못했다. 이웃이 알려 줄 때까지 몰랐다."
      : has(c, "stairs") ? "대피소는 계단으로만 올라갈 수 있는 건물 2층이다."
      : has(c, "coast") ? "대피소까지 5km, 걸어서 1시간이다. 물은 더 빨리 온다."
      : c.car ? "차로 10분이면 높은 곳에 갈 수 있다."
      : "대피소까지 걸어서 30분이다.",
    options: [
      { text: "대피소로 뛴다", lock: () => null,
        effect: c => has(c, "deaf") ? R(-Math.round(c.money * 0.5), -40, -20, "사이렌을 못 들어 한발 늦게 출발했다. 물에 휩쓸릴 뻔했다.")
          : has(c, "stairs") ? R(-20, -30, -25, "휠체어로 계단을 오를 수 없어 대피소에 못 들어갔다.")
          : has(c, "coast") ? R(-Math.round(c.money * 0.5), -25, -15, "물이 발목까지 찬 길을 1시간 걸어 겨우 도착했다.")
          : c.mob >= 2 ? R(-5, 0, 0, "차로 빨리 높은 곳에 갔다.")
          : has(c, "elderly") ? R(-10, -20, -10, "서두르다 넘어져 다쳤다.")
          : R(-10, -10, -5, "젖은 채 대피소에 도착했다.") },
      { text: "배를 타고 바다로 나간다", lock: c => LOCK(c, !has(c, "boat"), "배가 없다"),
        effect: c => R(-Math.round(c.money * 0.3), -20, -20, "거센 파도 속에서 밤을 보냈다. 배가 부서졌다.") },
      { text: "지붕 위로 올라간다", lock: c => LOCK(c, c.mob === 0, "휠체어로는 지붕에 오를 수 없다"),
        effect: c => has(c, "highrise") || has(c, "wealthy") ? R(-5, -5, 0, "높은 건물이라 물은 닿지 않았지만, 지붕에서 비를 맞고 감기에 걸렸다.")
          : has(c, "elderly") ? R(-Math.round(c.money * 0.4), -35, -20, "지붕에서 밤새 비를 맞았다. 체온이 떨어졌다.")
          : R(-Math.round(c.money * 0.4), -25, -20, "지붕 위에서 구조를 기다렸다. 집 안 물건은 다 떠내려갔다.") },
    ] },

  // ---------- 4 대피소 생활 ----------
  { id: 4, title: "대피소 생활", where: "체육관·천막 대피소", image: "images/disaster_04.png",
    story: "재난 뒤 2주 동안 사람들이 체육관과 천막 대피소에서 함께 지낸다. 화장실은 멀고 불은 밤에 꺼진다. 낯선 사람들이 많다.",
    situation: c => c.viol >= 3 ? "너는 밤마다 불안하다. 누군가 천막 주변을 서성이고, 화장실 가는 길이 무섭다."
      : c.viol === 2 ? "낯선 어른들 사이에서 눈치를 본다. 물건이 자주 없어진다."
      : c.money >= 150 ? "너는 굳이 대피소에 있을 필요가 없다. 호텔에 방을 잡을 수 있다."
      : "불편하지만 가족과 함께 있어 견딜 만하다.",
    options: [
      { text: "대피소에 머문다", lock: () => null,
        effect: c => c.viol >= 4 ? R(0, -10, -40, "밤마다 위협을 느껴 잠을 못 잤다. 동생들을 지키느라 지쳤다.")
          : c.viol === 3 ? R(0, -5, -30, "밤에 누군가 천막에 들어오려 했다. 이후 잠을 이루지 못했다.")
          : c.viol === 2 ? R(-3, -5, -15, "물건을 도둑맞고 눈치 보며 지냈다.")
          : has(c, "disability") ? R(0, -10, -15, "화장실이 멀고 통로가 좁아 하루 종일 힘들었다.")
          : R(0, -5, -5, "불편했지만 무사히 지냈다.") },
      { text: "호텔·친척 집으로 옮긴다", lock: c => LOCK(c, c.money < 100 && c.guard < 2, "갈 곳도, 숙소를 잡을 돈도 없다"),
        effect: c => c.money >= 100 ? R(-80, 0, 0, "호텔에서 편하게 지냈다.")
          : R(-10, 0, -5, "친척 집에서 신세를 졌다.") },
      { text: "혼자 집터로 돌아간다", lock: () => null,
        effect: c => c.viol >= 3 ? R(-Math.round(c.money * 0.3), -20, -25, "부서진 집터에 혼자 있다가 위협을 당했다.")
          : has(c, "elderly") ? R(-10, -25, -10, "전기도 물도 없는 집에서 버티다 탈이 났다.")
          : R(-10, -15, -10, "물도 전기도 없는 집에서 버텼다.") },
    ] },

  // ---------- 5 대가뭄과 식량 가격 폭등 ----------
  { id: 5, title: "대가뭄과 식량 가격 폭등", where: "케냐 북부 · 전 세계", image: "images/disaster_05.png",
    story: "케냐 북부에 3년째 비가 오지 않는다. 가축이 죽고 우물이 말랐다. 전 세계 곡물값이 두 배로 뛰었다.",
    situation: c => has(c, "pastoral") ? "너의 가축이 하나둘 죽어 간다. 가축이 전 재산이다."
      : poorish(c) ? "빵 한 개 값이 두 배가 됐다. 오늘 저녁거리가 걱정이다."
      : "식료품값이 올랐지만 사는 데 지장은 없다.",
    options: [
      { text: "비싸도 식량을 산다", lock: () => null,
        effect: c => c.money >= 100 ? R(-30, 0, 0, "값이 올라도 평소처럼 먹었다.")
          : c.money >= 30 ? R(-Math.round(c.money * 0.6), 0, -5, "저축한 돈을 식비로 거의 다 썼다.")
          : R(-c.money, -5, -15, "가진 돈을 전부 쓰고도 식량이 모자랐다.") },
      { text: "식량을 줄이고 버틴다", lock: () => null,
        effect: c => has(c, "child") ? R(0, -30, -10, "성장기에 끼니를 줄여 몸이 약해졌다.")
          : has(c, "elderly") ? R(0, -25, -5, "영양이 부족해 기력이 떨어졌다.")
          : R(0, -15, -5, "배고픔을 참으며 지냈다.") },
      { text: "가축·물건을 팔아 돈을 만든다", lock: () => null,
        effect: c => has(c, "pastoral") ? R(-10, -15, -25, "가축이 이미 죽어 팔 것이 없었다. 남은 염소를 헐값에 넘겼다.")
          : has(c, "farmer") ? R(5, -10, -15, "농기구를 팔아 몇 끼를 샀다.")
          : c.money >= 100 ? R(20, 0, 0, "쓰지 않는 물건을 팔아 오히려 돈이 늘었다.")
          : R(3, -10, -10, "팔 물건이 거의 없었다.") },
    ] },

  // ---------- 6 대형 산불 ----------
  { id: 6, title: "대형 산불", where: "호주 · 캐나다 · 아마존", image: "images/disaster_06.png",
    story: "숲에서 시작된 불이 바람을 타고 도시 외곽까지 번졌다. 연기가 수백 km를 덮어 하늘이 주황색이 됐다.",
    situation: c => has(c, "forest") ? "불이 너의 마을 숲을 태우고 있다. 숲이 집이고 식량이고 약이다."
      : has(c, "bushfire") ? "너의 집 근처까지 불이 왔다. 다행히 보험이 있다."
      : c.car ? "연기가 심하지만 차로 멀리 피할 수 있다."
      : "연기로 숨쉬기가 힘들다. 멀리 갈 방법이 없다.",
    options: [
      { text: "차로 멀리 대피한다", lock: c => LOCK(c, !c.car && c.mob < 2, "차가 없다"),
        effect: c => c.ins ? R(-20, 0, -5, "안전하게 피했고 피해는 보험이 처리했다.")
          : R(-25, 0, -10, "피했지만 집 걱정으로 밤을 샜다.") },
      { text: "집에 남아 불을 막는다", lock: c => NO_LABOR(c, "불을 막을"),
        effect: c => has(c, "forest") ? R(-c.money, -35 - LABOR(c), -35, "밤새 물을 길어 불과 싸웠지만 숲이 다 탔다. 집도 밭도 약초도 한꺼번에 사라졌다.")
          : c.ins ? R(-30, -25 - LABOR(c), -10, "연기 속에서 호스를 들고 버텼다. 집 일부가 탔지만 보험이 집값을 돌려줬다.")
          : R(-Math.round(c.money * 0.5), -30 - LABOR(c), -20, "연기 속에서 밤새 불을 껐다. 집이 반쯤 탔고 복구할 돈이 없다.") },
      { text: "마스크 쓰고 버틴다", lock: () => null,
        effect: c => has(c, "elderly") || has(c, "disability") ? R(-5, -30, -10, "연기를 마셔 호흡기가 크게 나빠졌다.")
          : has(c, "forest") || has(c, "arctic") ? R(-Math.round(c.money * 0.4), -25, -20, "연기 속에서 버텼지만 사냥터와 숲이 사라졌다.")
          : R(-5, -15, -5, "며칠 동안 기침이 멈추지 않았다.") },
    ] },

  // ---------- 7 해수면 상승 ----------
  { id: 7, title: "해수면 상승으로 섬이 잠김", where: "투발루 · 방글라데시 해안", image: "images/disaster_07.png",
    story: "바닷물이 밀려와 우물에 소금물이 섞이고 밭이 죽었다. 섬의 가장 높은 곳도 해발 4m밖에 안 된다.",
    situation: c => has(c, "island") ? "너의 섬은 몇 년 안에 사라질지 모른다. 받아 주는 나라가 없다."
      : has(c, "novisa") ? "너는 여권도 비자도 없다. 다른 나라로 갈 길이 막혀 있다."
      : has(c, "coast") || has(c, "lowland") ? "너의 집은 바다보다 조금 높을 뿐이다."
      : "너의 집은 바다에서 멀고 높은 곳에 있다.",
    options: [
      { text: "다른 나라로 이주한다", lock: c => LOCK(c, has(c, "novisa") && !has(c, "island"), "여권·비자가 없어 받아 주는 나라가 없다"),
        effect: c => has(c, "island") ? R(-10, -5, -30, "이주 신청을 냈지만 받아 주는 나라가 없어 '대기 중'이다.")
          : c.pass && c.money >= 150 ? R(-100, 0, -5, "비자를 받아 새 나라에 자리 잡았다.")
          : R(-Math.round(c.money * 0.7), -10, -20, "브로커에게 돈을 주고 떠났지만 불안정한 신분으로 산다.") },
      { text: "남아서 둑을 쌓는다", lock: c => NO_LABOR(c, "둑을 쌓을"),
        effect: c => has(c, "island") || has(c, "coast") ? R(-Math.round(c.money * 0.5), -35 - LABOR(c), -20, "며칠 밤낮 모래주머니를 날라 둑을 쌓았지만 다음 밀물에 무너졌다. 몸이 남아나지 않았다.")
          : R(-5, -5, 0, "너의 집에는 바닷물이 오지 않았다.") },
      { text: "더 높은 곳으로 옮긴다", lock: c => LOCK(c, !has(c, "island") && !has(c, "coast") && !has(c, "lowland"), "이미 높은 곳에 살아 옮길 필요가 없다"),
        effect: c => has(c, "island") ? R(-Math.round(c.money * 0.6), -10, -25, "섬에서 가장 높은 곳으로 갔지만 그곳도 안전하지 않다.")
          : R(-Math.round(c.money * 0.5), -10, -15, "집을 옮기느라 가진 돈을 거의 썼다.") },
    ] },

  // ---------- 8 홍수 뒤 전염병 ----------
  { id: 8, title: "홍수 뒤 전염병", where: "물이 빠진 모든 지역", image: "images/disaster_08.png",
    story: "물이 빠진 뒤 고인 물에서 모기가 늘고, 오염된 물로 콜레라와 뎅기열이 퍼졌다. 병원마다 환자가 넘친다.",
    situation: c => c.med >= 3 ? "집 근처에 큰 병원이 있고 진료비 걱정이 없다."
      : has(c, "remote") ? "가장 가까운 병원까지 비행기로 2시간이다."
      : has(c, "deaf") ? "병원에 가도 의사와 말이 통하지 않는다. 통역이 없다."
      : c.med === 0 ? "병원이 멀고 진료비를 낼 돈이 없다."
      : "작은 보건소뿐이고 약이 부족하다.",
    options: [
      { text: "병원에 간다", lock: () => null,
        effect: c => c.med >= 3 ? R(-10, -5, 0, "바로 치료받고 금방 나았다.")
          : has(c, "remote") ? R(-40, -15, -5, "비행기를 타고 병원에 갔다. 비용이 컸다.")
          : has(c, "deaf") ? R(-5, -25, -15, "증상을 설명하지 못해 치료가 반만 됐다.")
          : c.med === 0 ? R(-Math.round(c.money * 0.7), -25, -10, "먼 병원까지 갔지만 약값을 다 내지 못했다.")
          : R(-10, -15, -5, "보건소에서 기본 치료만 받았다.") },
      { text: "약을 사서 집에서 버틴다", lock: () => null,
        effect: c => c.med >= 2 ? R(-5, -10, 0, "약국 약으로 나았다.")
          : has(c, "child") || has(c, "elderly") ? R(-3, -30, -10, "제대로 된 약이 아니어서 병이 길어졌다.")
          : R(-3, -20, -5, "가짜 약을 사서 효과가 없었다.") },
      { text: "깨끗한 물을 사서 예방한다", lock: c => LOCK(c, c.money < 10, "생수를 살 돈이 없다"),
        effect: c => c.money >= 50 ? R(-10, 0, 0, "생수로 예방해 아프지 않았다.")
          : R(-Math.round(c.money * 0.5), -5, -5, "생수를 사느라 다른 데 쓸 돈이 없었다.") },
    ] },

  // ---------- 9 한파와 대정전 ----------
  { id: 9, title: "한파와 대정전", where: "미국 남부 · 한국 · 유럽", image: "images/disaster_09.png",
    story: "따뜻하던 지역에 영하 15도 한파가 닥쳤다. 발전소가 얼어 전기와 수도가 끊겼다. 집 안 수도관이 터진다.",
    situation: c => has(c, "wealthy") && c.id === 1 ? "저택에는 자가 발전기가 있다. 정전을 느끼지도 못한다."
      : has(c, "elderly") && has(c, "alone") ? "혼자 사는 너에게 난방이 끊겼다. 도와줄 사람이 없다."
      : has(c, "camp") ? "천막은 바람을 막지 못한다. 동생들이 떨고 있다."
      : poorish(c) ? "난방 기구를 살 돈이 없다. 담요뿐이다."
      : "춥지만 난방 기구를 살 수 있다.",
    options: [
      { text: "난방 기구를 산다", lock: c => LOCK(c, c.money < 40, "난방 기구를 살 돈이 없다"),
        effect: c => c.id === 1 ? R(-40, 0, 3, "자가 발전기가 있어 필요 없었지만 예비로 하나 더 샀다. 든든했다.")
          : R(-40, 0, 0, "난방 기구로 따뜻하게 지냈다.") },
      { text: "이웃·공공시설로 간다", lock: () => null,
        effect: c => c.mob === 0 ? R(0, -20, -15, "눈 쌓인 길을 휠체어로 갈 수 없어 집에 갇혔다.")
          : has(c, "elderly") ? R(-5, -15, -5, "추운 길을 걸어 마을회관에 갔다.")
          : has(c, "camp") || has(c, "slum") ? R(0, -15, -10, "공공시설이 가득 차 들어가지 못했다.")
          : R(-5, -5, 0, "온열 쉼터에서 지냈다.") },
      { text: "집에서 담요로 버틴다", lock: () => null,
        effect: c => c.id === 1 ? R(-5, 0, 0, "자가 발전기 연료를 더 샀다. 정전은 느끼지도 못했다.")
          : has(c, "elderly") ? R(-10, -35, -10, "저체온증이 왔다. 이웃이 발견해 겨우 살았다.")
          : has(c, "camp") ? R(0, -30, -15, "천막 안에서 동생들과 얼어붙은 밤을 보냈다.")
          : c.money >= 100 ? R(-20, -10, 0, "수도관이 터졌지만 수리비를 바로 냈다.")
          : R(-10, -20, -5, "수도관이 터져 물도 없이 떨었다.") },
    ] },

  // ---------- 10 기후 난민의 이동 ----------
  { id: 10, title: "기후 난민의 이동", where: "국경", image: "images/disaster_10.png",
    story: "살던 곳이 더는 사람이 살 수 없는 땅이 됐다. 수많은 사람이 국경으로 향한다. 국경은 좁게 열려 있다.",
    situation: c => has(c, "refugee") ? "너는 이미 한 번 고향을 잃었다. 또 떠나야 한다."
      : c.pass && c.money >= 150 ? "너는 여권이 있고 비행기 표를 살 수 있다."
      : has(c, "novisa") ? "너에게는 여권이 없다. 합법적으로 국경을 넘을 길이 없다."
      : "비행기 표를 살 돈이 없다. 걸어서 가야 한다.",
    options: [
      { text: "비행기로 이민 간다", lock: c => LOCK(c, !c.pass || c.money < 150, !c.pass ? "여권이 없다" : "비행기 표와 정착금(150코인)이 없다"),
        effect: c => R(-150, 0, -5, "비행기로 안전하게 새 나라에 갔다.") },
      { text: "걸어서·배로 국경을 넘는다", lock: () => null,
        effect: c => has(c, "refugee") ? R(-c.money, -25, -40, "두 번째 난민살이가 시작됐다. 길에서 위협을 당했다.")
          : c.viol >= 3 ? R(-Math.round(c.money * 0.8), -25, -35, "길에서 사기와 폭력을 당했다.")
          : c.viol === 2 ? R(-Math.round(c.money * 0.7), -20, -20, "브로커에게 돈을 뜯기고 며칠을 굶었다.")
          : c.mob === 0 ? R(-Math.round(c.money * 0.5), -30, -20, "휠체어로 산길을 넘을 수 없어 도중에 멈췄다.")
          : has(c, "elderly") ? R(-Math.round(c.money * 0.5), -30, -15, "긴 길을 걷다 쓰러졌다.")
          : R(-Math.round(c.money * 0.5), -15, -15, "힘들게 국경을 넘었다.") },
      { text: "남아서 버틴다", lock: () => null,
        effect: c => has(c, "island") || has(c, "camp") || has(c, "mountain") || has(c, "pastoral") ? R(-Math.round(c.money * 0.5), -30, -25, "물도 식량도 없는 땅에서 버텼다.")
          : c.money >= 150 ? R(-20, -5, -5, "집에 남아 생필품을 사 두고 버텼다.")
          : R(-Math.round(c.money * 0.3), -20, -15, "물가가 오르고 일자리가 사라졌다.") },
    ] },

  // ---------- 11 태풍 상륙과 강변 침수 ----------
  { id: 11, title: "태풍 상륙과 강변 침수", where: "필리핀 마닐라", image: "images/disaster_11.png",
    story: "강한 태풍이 마닐라를 지나갔다. 강물이 넘쳐 강변 저지대가 2m 깊이로 잠겼다. 사이렌이 울리고 대피 방송이 나왔다.",
    situation: c => has(c, "deaf") ? "사이렌도 방송도 너에게는 들리지 않는다. 이웃이 어깨를 두드릴 때까지 몰랐다."
      : has(c, "highrise") ? "너는 고층 아파트에 산다. 물은 1층도 넘지 못했다."
      : has(c, "slum") || has(c, "lowland") || has(c, "camp") ? "너의 집은 강변 저지대에 있다. 물이 금방 차오른다."
      : "너의 동네는 높은 곳이라 침수되지 않았다.",
    options: [
      { text: "사이렌을 듣고 고지대로 간다", lock: c => LOCK(c, has(c, "deaf"), "사이렌을 들을 수 없다"),
        effect: c => has(c, "slum") || has(c, "lowland") ? R(-Math.round(c.money * 0.4), -10, -10, "몸은 피했지만 집 안 살림은 물에 잠겼다.")
          : c.car ? R(-5, 0, 0, "차로 빨리 높은 곳에 갔다.")
          : R(-5, -5, 0, "걸어서 고지대로 피했다.") },
      { text: "2층 이상 건물로 올라간다", lock: c => LOCK(c, c.mob === 0, "휠체어로 계단을 오를 수 없다"),
        effect: c => has(c, "highrise") || has(c, "wealthy") ? R(-5, 0, 0, "집 자체가 높아 피해는 없었다. 비상식량을 사 두느라 조금 썼다.")
          : has(c, "deaf") ? R(-c.money, -30, -20, "이웃이 알려 줘 뒤늦게 올라갔다. 이미 허리까지 물이 찼었다.")
          : has(c, "slum") || has(c, "lowland") ? R(-Math.round(c.money * 0.5), -15, -10, "이웃 건물 2층에서 밤을 보냈다. 집은 잠겼다.")
          : R(-5, 0, 0, "안전하게 기다렸다.") },
      { text: "집에 남아 짐을 지킨다", lock: () => null,
        effect: c => has(c, "slum") || has(c, "lowland") || has(c, "camp") ? R(-Math.round(c.money * 0.3), -35 - LABOR(c), -20, "물을 퍼내다 지쳐 쓰러졌다. 물이 지붕까지 차 구조를 기다렸다.")
          : has(c, "highrise") || has(c, "wealthy") ? R(-10, 0, 0, "집에 물은 오지 않았지만 지하 주차장의 차를 손봐야 했다.")
          : R(-10, -15 - LABOR(c), -5, "밤새 짐을 옮기고 물을 퍼냈지만 지하실이 잠겨 물건이 젖었다.") },
    ] },

  // ---------- 12 우물이 마르고 물값이 오름 ----------
  { id: 12, title: "우물이 마르고 물값이 오름", where: "네팔 산간 · 케냐 북부", image: "images/disaster_12.png",
    story: "가뭄으로 마을 우물이 말랐다. 가장 가까운 물까지 왕복 4시간이다. 도시에서는 생수값이 세 배로 올랐다.",
    situation: c => has(c, "water") ? "물 길어 오는 일은 너의 몫이다. 학교 대신 하루 종일 물을 나른다."
      : poorish(c) ? "생수값이 올라 살 수가 없다."
      : "수도꼭지를 틀면 물이 나온다. 생수도 살 수 있다.",
    options: [
      { text: "생수를 산다", lock: c => LOCK(c, c.money < 10, "생수를 살 돈이 없다"),
        effect: c => c.money >= 100 ? R(-15, 0, 0, "생수를 사서 평소처럼 지냈다.")
          : R(-Math.round(c.money * 0.6), 0, -5, "물값에 돈을 거의 다 썼다.") },
      { text: "매일 물을 길어 온다", lock: () => null,
        effect: c => has(c, "water") ? R(0, -15, -15, "하루 4시간씩 물을 날랐다. 학교에 못 가고 몸이 지쳤다.")
          : has(c, "elderly") || has(c, "disability") ? R(0, -25, -5, "무거운 물통을 나르다 몸이 상했다.")
          : c.money >= 100 ? R(-5, 0, 0, "집 수도가 끊기지 않아 길어 올 필요가 없었다.")
          : R(0, -10, -5, "먼 길을 오가며 지쳤다.") },
      { text: "더러운 물을 끓여 마신다", lock: () => null,
        effect: c => c.money >= 100 ? R(-5, 0, 0, "수돗물이 나와 그럴 필요가 없었다.")
          : has(c, "child") || has(c, "elderly") ? R(0, -30, -5, "끓여도 모자라 설사병에 걸렸다.")
          : R(0, -20, -5, "배탈이 나 며칠 앓았다.") },
    ] },

  // ---------- 13 폭염 노동 금지령 ----------
  { id: 13, title: "폭염 노동 금지령", where: "카타르 · 인도 건설 현장", image: "images/disaster_13.png",
    story: "정부가 낮 12시부터 3시까지 야외 노동을 금지했다. 쉬는 시간에는 임금이 나오지 않는다. 현장에는 선풍기 하나 없다.",
    situation: c => has(c, "employer") ? "너의 가문은 그 건설 현장의 고용주다. 임금을 안 줘도 손해가 없다."
      : has(c, "outdoor") ? "일을 쉬면 오늘 저녁밥이 없다. 일을 하면 쓰러질 수 있다."
      : c.money >= 100 ? "너는 실내에서 지낸다. 금지령은 뉴스로만 본다."
      : "너의 가족 수입이 줄었다.",
    options: [
      { text: "쉬고 임금을 포기한다", lock: () => null,
        effect: c => has(c, "employer") ? R(15, 0, -5, "너의 가문은 임금을 주지 않아 비용이 줄었다. 노동자들의 원망을 들었다.")
          : has(c, "outdoor") ? R(-Math.round(c.money * 0.6), -5, -15, "며칠 수입이 끊겨 먹을 것을 줄였다.")
          : c.money >= 100 ? R(0, 0, -3, "뉴스로 쓰러진 노동자 소식을 보고 마음이 무거웠다.")
          : R(-Math.round(c.money * 0.2), 0, -5, "가족 수입이 줄었다.") },
      { text: "몰래 일한다", lock: () => null,
        effect: c => has(c, "outdoor") ? R(5, -40, -10, "일당은 받았지만 아빠(혹은 너)가 현장에서 쓰러졌다.")
          : has(c, "employer") ? R(10, 0, -5, "노동자들을 몰래 일하게 해 이익을 냈지만 한 명이 다쳤다.")
          : R(0, -10, 0, "뙤약볕에 나갔다가 더위를 먹었다.") },
      { text: "다른 일자리를 찾는다", lock: c => LOCK(c, has(c, "camp"), "난민은 합법적으로 일할 수 없다"),
        effect: c => has(c, "outdoor") ? R(-Math.round(c.money * 0.3), -10, -10, "며칠을 헤맸지만 실내 일자리는 없었다.")
          : c.net ? R(-5, 0, 0, "인터넷으로 실내 일자리를 찾았다.")
          : R(-5, -5, -5, "일자리를 찾아 돌아다니느라 지쳤다.") },
    ] },

  // ---------- 14 바다 얼음이 녹아 사냥길이 끊김 ----------
  { id: 14, title: "바다 얼음이 녹아 사냥길이 끊김", where: "캐나다 북극 · 아마존 강", image: "images/disaster_14.png",
    story: "북극의 바다 얼음이 두 달 늦게 얼고 얇아졌다. 아마존에서는 강 수위가 낮아져 배가 다닐 수 없다. 전통 방식으로 식량을 구하던 사람들이 길을 잃었다.",
    situation: c => has(c, "arctic") ? "얼음이 얇아 사냥을 나가기 위험하다. 상점 식량은 비행기로 들어와 세 배 비싸다."
      : has(c, "forest") ? "강물이 줄어 물고기가 사라졌다. 카누가 바닥에 걸린다."
      : "너의 식탁에는 변화가 없다. 뉴스에서만 본 일이다.",
    options: [
      { text: "전통 방식으로 식량을 구하러 나간다", lock: () => null,
        effect: c => has(c, "arctic") ? R(0, -40, -15, "얼음이 깨져 물에 빠졌다. 간신히 구조됐다.")
          : has(c, "forest") ? R(0, -20, -15, "하루 종일 강을 헤맸지만 잡은 것이 없었다.")
          : has(c, "pastoral") || has(c, "coast") ? R(0, -15, -10, "먼 길을 갔지만 먹을 것을 구하지 못했다.")
          : R(0, -5, 0, "너와는 관계없는 일이었다.") },
      { text: "상점에서 비싼 식량을 산다", lock: c => LOCK(c, c.money < 15, "식량을 살 돈이 없다"),
        effect: c => has(c, "arctic") ? R(-30, 0, -10, "항공 운송 식량에 돈을 거의 다 썼다.")
          : c.money >= 100 ? R(-10, 0, 0, "평소처럼 장을 봤다.")
          : R(-Math.round(c.money * 0.5), 0, -5, "식량값에 돈 절반이 들어갔다.") },
      { text: "정부 지원을 기다린다", lock: () => null,
        effect: c => c.aid >= 3 ? R(0, 0, -3, "지원이 필요 없었다. 뉴스 속 굶는 마을을 보며 마음이 무거웠다.")
          : has(c, "indigenous") ? R(0, -25, -20, "지원은 오지 않았다. 굶으며 기다렸다.")
          : R(0, -10, -10, "지원이 늦게 조금 왔다.") },
    ] },

  // ---------- 15 숲을 빼앗는 벌목과 불 ----------
  { id: 15, title: "숲을 빼앗는 벌목과 불", where: "아마존 · 케냐 초원", image: "images/disaster_15.png",
    story: "기업이 농장을 만들려고 숲에 불을 놓았다. 땅 문서가 없는 원주민 마을은 법의 보호를 받지 못했다.",
    situation: c => has(c, "forest") ? "너의 마을 숲이 타고 있다. 기업은 '이 땅은 우리 것'이라고 한다."
      : has(c, "pastoral") ? "가축을 먹이던 초원에 울타리가 생겼다. 들어가면 체포된다."
      : c.money >= 150 ? "너는 그 농장에서 나올 값싼 고기와 콩을 사 먹게 될 것이다."
      : "뉴스에서 본 먼 나라 이야기다.",
    options: [
      { text: "마을을 지키며 항의한다", lock: () => null,
        effect: c => has(c, "forest") ? R(-Math.round(c.money * 0.3), -15, -30, "항의하는 마을 사람들이 위협을 받았다. 삼촌이 다쳤다.")
          : has(c, "pastoral") ? R(-5, -10, -20, "울타리 앞에서 쫓겨났다.")
          : has(c, "wealthy") ? R(0, 0, 5, "온라인 서명 운동에 참여했다.")
          : R(-3, 0, 3, "후원금을 조금 보냈다. 마음은 조금 나아졌다.") },
      { text: "도시로 떠난다", lock: () => null,
        effect: c => has(c, "forest") || has(c, "pastoral") ? R(-Math.round(c.money * 0.5), -15, -30, "도시 빈민가로 갔다. 말도 일자리도 낯설었다.")
          : R(-5, 0, 0, "이미 도시에 산다. 숲을 태워 만든 농장의 값싼 고기를 사 먹었다.") },
      { text: "기업의 보상금을 받고 땅을 넘긴다", lock: c => LOCK(c, !has(c, "forest") && !has(c, "pastoral"), "넘길 땅이 없다"),
        effect: c => R(Math.round(c.money * 0.5), -5, -35, "보상금은 시세의 10분의 1이었다. 숲과 함께 삶의 방식을 잃었다.") },
    ] },

  // ---------- 16 식량값 폭등 뒤 도시 폭동 ----------
  { id: 16, title: "식량값 폭등 뒤 도시 폭동", where: "전 세계 대도시", image: "images/disaster_16.png",
    story: "빵값이 세 배로 오르자 거리에서 시위가 시작됐고 곧 약탈로 번졌다. 경찰이 거리를 막고 상점이 문을 닫았다.",
    situation: c => has(c, "nightalone") ? "엄마는 야간 근무 중이다. 너는 혼자 집에 있고 창밖에서 소리가 난다."
      : has(c, "camp") ? "캠프로 오던 배급 트럭이 끊겼다."
      : c.id === 1 ? "저택에는 경비원이 있다. 식량 창고도 가득하다."
      : c.money >= 100 ? "문을 잠그고 집에 있으면 된다. 먹을 것은 넉넉하다."
      : "집에 먹을 것이 하루치뿐이다.",
    options: [
      { text: "집에 머문다", lock: () => null,
        effect: c => has(c, "nightalone") ? R(0, -5, -25, "혼자 밤새 떨며 소리를 들었다. 창문이 깨졌다.")
          : has(c, "camp") ? R(0, -20, -15, "배급이 끊겨 이틀을 굶었다.")
          : c.money >= 100 ? R(-10, 0, 0, "집에서 안전하게 지냈다.")
          : R(0, -15, -10, "먹을 것이 떨어져 배를 곯았다.") },
      { text: "줄을 서서 배급 식량을 받는다", lock: () => null,
        effect: c => c.viol >= 3 ? R(0, -15, -20, "줄에서 밀려 넘어지고 식량을 빼앗겼다.")
          : has(c, "elderly") || has(c, "disability") ? R(0, -20, -10, "몇 시간을 서 있다가 빈손으로 돌아왔다.")
          : has(c, "child") ? R(0, -10, -15, "어른들 틈에서 밀려 조금밖에 못 받았다.")
          : R(0, -5, -5, "식량을 조금 받았다.") },
      { text: "안전한 지역으로 피한다", lock: c => LOCK(c, c.money < 50 && c.mob < 2, "갈 수단도 돈도 없다"),
        effect: c => c.id === 1 ? R(-50, 0, 0, "경비가 있는 저택이지만 가족을 교외 별장으로 보냈다.")
          : R(-50, 0, 0, "교외 호텔에서 며칠 지냈다.") },
    ] },

  // ---------- 17 재난으로 학교가 1년 문을 닫음 ----------
  { id: 17, title: "재난으로 학교가 1년 문을 닫음", where: "피해 지역 전체", image: "images/disaster_17.png",
    story: "교실이 대피소로 쓰이고 교사들이 떠났다. 학교는 1년 동안 문을 닫는다. 온라인 수업이 대안이라고 한다.",
    situation: c => c.net ? "너에게는 태블릿과 인터넷이 있다. 온라인 수업을 들을 수 있다."
      : has(c, "female") && has(c, "child") ? "학교가 없어지자 어른들이 '이참에 결혼시키자'고 말하기 시작했다."
      : has(c, "child") ? "학교 대신 일터로 가라는 말을 듣는다."
      : "너는 이미 학교를 졸업했다. 동네 아이들이 걱정이다.",
    options: [
      { text: "온라인 수업을 듣는다", lock: c => LOCK(c, !c.net, "인터넷도 태블릿도 없다"),
        effect: c => R(-5, 0, 0, "집에서 온라인 수업을 이어 갔다.") },
      { text: "일을 해서 가족을 돕는다", lock: () => null,
        effect: c => has(c, "child") && has(c, "outdoor") ? R(5, -20, -10, "공사장에서 일했다. 손을 다쳤다.")
          : has(c, "child") ? R(3, -10, -15, "어린 나이에 일을 시작했다. 공부는 멀어졌다.")
          : has(c, "elderly") ? R(5, -5, 0, "은퇴했지만 동네 아이들을 가르치고 수고비를 받았다. 몸은 조금 고됐다.")
          : R(5, -5, 0, "아르바이트를 했다.") },
      { text: "학교가 열릴 때까지 기다린다", lock: () => null,
        effect: c => has(c, "female") && has(c, "child") && c.viol >= 3 ? R(0, -5, -30, "조혼 압박이 시작됐다. 매일 불안하다.")
          : has(c, "child") && !c.net ? R(0, 0, -20, "1년 동안 아무것도 배우지 못했다.")
          : R(0, 0, -5, "지루했지만 다른 방법으로 공부했다.") },
    ] },

  // ---------- 18 복구 지원금 신청 ----------
  { id: 18, title: "복구 지원금 신청", where: "홍수 피해 지역", image: "images/disaster_18.png",
    story: "정부가 홍수 피해 지원금을 준다고 발표했다. 신청은 온라인으로만, 집 소유 증명서와 피해 사진이 필요하다.",
    situation: c => c.ins ? "보험사가 알아서 서류를 처리해 준다."
      : has(c, "renter") ? "너의 집은 임대주택이다. 집주인만 지원 대상이다."
      : !c.net ? "온라인 신청을 할 줄 모르고 할 기기도 없다."
      : has(c, "camp") || has(c, "novisa") ? "너는 시민권이 없어 신청 자격이 없다."
      : "서류를 갖춰 신청할 수 있다.",
    options: [
      { text: "직접 서류를 내서 신청한다", lock: c => LOCK(c, !c.net, "온라인 신청을 할 기기가 없다"),
        effect: c => has(c, "renter") ? R(0, 0, -15, "임대주택이라 지원 대상이 아니라는 답을 받았다.")
          : c.ins ? R(40, 0, 5, "보험과 지원금을 모두 받았다.")
          : R(25, 0, 5, "지원금을 받았다.") },
      { text: "대행 업체에 수수료를 내고 맡긴다", lock: c => LOCK(c, c.money < 10, "수수료를 낼 돈이 없다"),
        effect: c => has(c, "camp") || has(c, "novisa") || has(c, "renter") ? R(-10, 0, -15, "수수료만 떼이고 자격이 없다는 답을 받았다.")
          : c.ins || c.money >= 100 ? R(30, 0, 0, "수수료를 빼고도 지원금을 받았다.")
          : R(10, 0, -5, "수수료를 많이 떼였지만 조금은 받았다.") },
      { text: "포기한다", lock: () => null,
        effect: c => c.ins ? R(30, 0, 0, "포기했지만 보험사가 알아서 처리해 돈이 들어왔다.")
          : R(0, 0, -10, "아무것도 받지 못했다.") },
    ] },

  // ---------- 19 폭염과 병해로 농사를 망침 ----------
  { id: 19, title: "폭염과 병해로 농사를 망침", where: "한국 농촌 · 네팔 산간", image: "images/disaster_19.png",
    story: "폭염에 비닐하우스 작물이 타 버리고 새로운 병이 밭에 번졌다. 올해 수확은 없다.",
    situation: c => has(c, "farmer") ? "밭과 비닐하우스가 전 재산이다. 올해 수입이 사라졌다."
      : has(c, "pastoral") ? "가축에게 먹일 풀도 말라 버렸다."
      : "채소값이 올랐다. 그뿐이다.",
    options: [
      { text: "농작물 재해 보험금을 받는다", lock: c => LOCK(c, !c.ins, "보험에 들지 않았다"),
        effect: c => R(20, 0, 0, "보험금으로 손해를 메웠다.") },
      { text: "빚을 내어 다시 심는다", lock: c => LOCK(c, !has(c, "farmer") ? true : has(c, "elderly") && poorish(c), !has(c, "farmer") ? "농사를 짓지 않아 해당 없다" : "82세라 대출이 거절됐다"),
        effect: c => R(-Math.round(c.money * 0.5), -10, -15, "빚을 냈지만 다음 수확까지 버틸 수 있을지 모른다.") },
      { text: "농사를 접는다", lock: () => null,
        effect: c => has(c, "farmer") ? R(-Math.round(c.money * 0.7), -10, -30, "평생 하던 농사를 접었다. 수입이 없어졌다.")
          : has(c, "pastoral") ? R(-Math.round(c.money * 0.5), -10, -20, "가축을 헐값에 팔았다.")
          : R(-5, 0, 0, "채소를 조금 비싸게 샀다.") },
    ] },

  // ---------- 20 기후 피해 보상 회의 ----------
  { id: 20, title: "기후 피해 보상 회의", where: "국제회의장", image: "images/disaster_20.png",
    story: "세계 각국 대표가 모여 기후 피해를 입은 나라에 줄 기금을 정한다. 발언 시간은 나라의 힘에 따라 다르다.",
    situation: c => has(c, "wealthy") ? "너의 나라 대표는 회의에서 발언권이 크다. 기금의 조건을 정하는 쪽이다."
      : has(c, "island") || has(c, "forest") || has(c, "mountain") ? "너의 마을은 피해가 가장 크지만, 회의장에 너의 목소리를 전할 사람이 없다."
      : has(c, "camp") ? "너는 나라가 없다. 어느 대표도 너를 대신하지 않는다."
      : "너의 나라도 피해를 입었지만 발언 시간은 짧다.",
    options: [
      { text: "우리 마을의 피해를 알리는 편지를 보낸다", lock: () => null,
        effect: c => has(c, "wealthy") ? R(0, 0, 5, "편지가 뉴스에 소개됐다.")
          : has(c, "island") || has(c, "forest") || has(c, "mountain") || has(c, "camp") ? R(0, 0, -20, "답장은 오지 않았다. 기금은 큰 나라들 몫으로 먼저 정해졌다.")
          : R(0, 0, -5, "형식적인 답장만 왔다.") },
      { text: "시위에 참여한다", lock: () => null,
        effect: c => c.viol >= 3 ? R(0, -15, -15, "시위 현장에서 밀려 다쳤다.")
          : has(c, "wealthy") ? R(0, 0, 5, "안전한 시위에 참여하고 집에 돌아왔다.")
          : R(0, -5, 0, "목소리를 냈다. 바뀐 것은 아직 없다.") },
      { text: "결과를 기다린다", lock: () => null,
        effect: c => has(c, "wealthy") ? R(20, 0, 0, "너의 나라는 기금 운영을 맡아 이익까지 얻었다.")
          : c.aid >= 2 ? R(10, 0, 0, "약간의 지원이 왔다.")
          : R(0, 0, -15, "지원은 오지 않았다.") },
    ] },

  // ---------- 21 (희귀) 부유층을 향한 분노의 습격 ----------
  //   rare: 한 판에 이 라운드가 끼어들 확률(0.1 = 열 판에 한 번꼴). 끼어들면 8라운드 이후에만 나온다.
  //   fatal(c): 이 라운드를 겪으면 남은 게이지와 상관없이 죽는 캐릭터와 그 이유 (부유층만)
  //   의도: 돈이 많으면 재난에서 거의 죽지 않는다는 인상을 유지하되, 아주 드물게 부자도 무너질 수 있음을 보여 준다.
  { id: 21, title: "부유층을 향한 분노의 습격", where: "전 세계 대도시 부자 동네", image: "images/disaster_21.png", rare: 0.1,
    fatal: c => has(c, "wealthy") ? "성난 군중이 저택 담을 넘어 들이닥쳐" : null,
    story: "잇단 재난으로 집과 가족을 잃은 사람들이 거리로 쏟아져 나왔다. 분노는 '재난 속에서도 멀쩡했던' 부자 동네로 향했다. 경비원들이 먼저 달아났다.",
    situation: c => has(c, "wealthy") ? "너의 집은 이 도시에서 가장 눈에 띄는 집이다. 군중이 대문 앞까지 왔다."
      : c.money >= 100 ? "너의 동네까지는 오지 않았다. 창밖으로 연기가 보인다."
      : "너도 군중 속에 있다. 모두가 화가 나 있다.",
    options: [
      { text: "경비를 더 고용하고 집에 숨는다", lock: c => LOCK(c, c.money < 100, "경비를 고용할 돈이 없다"),
        effect: c => has(c, "wealthy") ? R(-100, -50, -30, "경비를 더 세웠지만 경비원들도 군중 편이었다. 담은 금방 넘어왔다.")
          : R(-60, 0, -5, "돈을 쓰고 집에 숨어 지냈다.") },
      { text: "거리로 나가 사람들과 함께 선다", lock: () => null,
        effect: c => has(c, "wealthy") ? R(-50, -50, -30, "거리에서 너를 알아본 사람들이 몰려들었다.")
          : c.viol >= 3 ? R(0, -15, 5, "밀려 넘어져 다쳤지만, 처음으로 목소리가 들리는 기분이었다.")
          : R(0, -5, 10, "같은 처지의 사람들과 함께 섰다. 혼자가 아니었다.") },
      { text: "집에서 조용히 지낸다", lock: () => null,
        effect: c => has(c, "wealthy") ? R(-80, -50, -30, "불을 끄고 숨었지만 군중은 이 집을 알고 있었다.")
          : c.money >= 100 ? R(-10, 0, -10, "집에서 숨죽이고 지냈다. 다음은 우리 동네일까 불안했다.")
          : R(0, -5, 0, "집에서 조용히 지냈다.") },
    ] },
];

// ------------------------------------------------------------
// 4. 디브리핑 질문
// ------------------------------------------------------------
const DEBRIEF_QUESTIONS = [
  "내가 다른 캐릭터와 달랐던 점은 무엇인가요?",
  "내가 가장 기억에 남는 라운드는 무엇인가요?",
  "그 때 느낀 감정이나 생각을 적어 보세요.",
  "기후 위기가 오면 어떤 사람들이 더 피해를 보게 되나요?",
];

if (typeof module !== "undefined") {
  module.exports = { CHARACTERS, SCENARIOS, DEBRIEF_QUESTIONS };
}
if (typeof window !== "undefined") {
  window.CHARACTERS = CHARACTERS; window.SCENARIOS = SCENARIOS; window.DEBRIEF_QUESTIONS = DEBRIEF_QUESTIONS;
}
