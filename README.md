# 기후 불평등 게임

중학교 도덕 수업용 웹 게임. 교사 전자칠판이 라운드를 진행하고, 학생 32명이 태블릿으로 참가해 같은 기후 재난을 겪는다.
결과 공개 때 교사 화면에 전원의 상황이 한눈에 보이고, 학생 화면에는 본인 상황이 보인다. 마지막에 학생은 소감을 제출하고 교사는 모아서 엑셀·이미지로 내려받는다.

## 파일 구성

| 파일 | 역할 |
| --- | --- |
| `index.html` | 화면 뼈대 (학생 화면 + 교사 화면) |
| `style.css` | 디자인 |
| `app.js` | 화면 흐름 (학생 참가·선택, 교사 진행·보드·소감 목록) |
| `engine.js` | 점수 계산 |
| `data.js` | **캐릭터 16명·시나리오 20개·선택지·피해량** — 문장과 숫자를 고치려면 이 파일만 열면 됨 |
| `store.js` | 저장소 (Supabase / 로컬 테스트 모드 자동 전환) |
| `sound.js` | BGM·효과음 (교사 화면에서만 남) |
| `config.example.js` | 설정 예시 → 복사해서 `config.js` 로 |
| `supabase.sql` | Supabase 테이블 만드는 SQL |
| `images/` | 캐릭터 16장(`char_01~16`), 재난 20장(`disaster_01~20`) |
| `sim.js` | 밸런스 확인용 (`node sim.js`) |
| `build_artifact.py` | (클로드 아티팩트 전용, 배포에는 필요 없음) |

## 1. 내 컴퓨터에서 열어 보기 (테스트 모드)

1. `config.example.js` 를 복사해 `config.js` 로 이름을 바꾼다. (이미 있으면 그대로)
2. `index.html` 을 크롬으로 연다.
3. 탭을 2~3개 열어 하나는 **교사(전자칠판)** → 비밀번호 `1` → 새 수업, 나머지는 **학생으로 참가**로 들어가면 같은 브라우저 안에서 실시간으로 움직인다.
   (테스트 모드는 같은 브라우저의 탭끼리만 공유된다. 다른 기기는 2단계 뒤에 가능)

## 2. Supabase 연결 (다른 기기에서 함께 하려면 필수)

1. Supabase에서 새 프로젝트 생성 (이름 예: `climate-game`)
2. 왼쪽 메뉴 **SQL Editor → New query** → `supabase.sql` 내용 전체를 붙여 넣고 **Run**
3. **Project Settings → API** 에서 `Project URL`, `anon public` 키 복사
4. `config.js` 에 붙여 넣기:

```js
window.CONFIG = {
  TEACHER_PASSWORD: "1",
  SUPABASE_URL: "https://xxxx.supabase.co",
  SUPABASE_ANON_KEY: "eyJ...",
  SUPABASE_TABLE: "docs",
};
```

5. `index.html` 을 다시 열면 시작 화면 아래에 **"Supabase 실시간 저장소"** 라고 뜬다.

> `anon` 키는 브라우저에 공개되는 키라 코드에 들어가도 되지만, 습관대로 `config.js` 는 `.gitignore` 에 넣어 두었다.

## 3. Vercel 배포

1. 깃허브에 **비공개 저장소**를 만들고 이 폴더를 올린다.
2. Vercel → **Add New → Project** → 저장소 선택 → **Deploy**. 빌드 설정 없음(정적 사이트).
3. `config.js` 는 깃허브에 올라가지 않으므로 배포 사이트에서는 테스트 모드로 뜬다. 두 가지 중 하나:
   - (간단) `.gitignore` 에서 `config.js` 줄을 지우고 같이 올린다. anon 키는 공개돼도 되는 키.
   - (원칙대로) Vercel 프로젝트 **Settings → Environment Variables** 에 값을 넣고, 빌드 때 `config.js` 를 만들어 내는 스크립트를 쓴다. Antigravity에 "Vercel 환경변수로 config.js 를 생성하는 빌드 스크립트 만들어 줘"라고 하면 된다.
4. 학생에게 주소를 알려 준다 (QR 추천).

## 4. 수업에서 쓰는 순서

1. 전자칠판: 사이트 열기 → **교사(전자칠판)** → 비밀번호 → **새 수업 만들기** → 4자리 코드가 크게 뜬다.
2. 학생: 사이트 열기 → **학생으로 참가** → 코드·닉네임(실명 금지) → 캐릭터 자동 배정.
3. 전자칠판 **1라운드 시작** → 학생이 각자 선택 → 제출 현황이 n/32 로 차오름 → **결과 공개**.
4. 결과 공개 화면: 많이 잃은 순으로 32명 카드, 맨 위에 가장 많이/적게 잃은 학생 VS. 정렬은 '캐릭터별', '누적 점수순'으로 바꿀 수 있음.
5. 10라운드 뒤 **최종 결과**: 전자칠판은 순위와 조건별 평균, 학생은 본인 순위 + 생각 정리 3문항 + 소감 제출.
6. 전자칠판 **소감** 버튼 → 닉네임 내림차순 목록 → 엑셀/이미지 다운로드.
7. 소리는 교사 화면에서만 난다 (왼쪽 아래 🔊 로 끄기). 혼자 시험할 때는 대기실의 **가상 학생으로 32명 채우기**.

## 5. 수치·문장 고치기

`data.js` 에서 각 선택지의 `R(재산, 몸, 마음, "이유")` 숫자를 바꾸면 된다.
`-Math.round(c.money * 0.5)` 는 "현재 재산의 절반을 잃음". 고친 뒤 `node sim.js` 로 16명 순위가 의도대로 나오는지 확인.

## 6. 저장 구조 (Antigravity에 설명할 때)

`store.js` 가 Firestore 비슷한 아주 작은 인터페이스(`doc().get/set/update/onSnapshot`, `collection().get/onSnapshot/doc`)를 제공하고,
뒤에서 Supabase(`docs` 테이블의 `path`·`data` 열) 또는 로컬 저장소로 전환한다. 경로 구조:

```
sessions/<코드>                      수업 상태 { phase, round, scenarioIds, results }
sessions/<코드>/players/<학생id>     참가자 { nickname, charId, choices }
reflections/<코드>_<학생id>          소감
```

`app.js` 는 저장소가 무엇인지 모르므로, 다른 백엔드로 바꾸려면 `store.js` 만 고치면 된다.
