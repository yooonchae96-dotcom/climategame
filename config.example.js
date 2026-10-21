// ============================================================
// 설정 파일 예시
// 이 파일을 복사해서 config.js 로 이름을 바꾸고 값을 채우세요.
// config.js 는 .gitignore 에 들어 있어 깃허브에 올라가지 않습니다.
// ============================================================
window.CONFIG = {
  // 교사 화면 비밀번호 (초기값 1)
  TEACHER_PASSWORD: "1",

  // Supabase 연결 정보. 비워 두면 같은 브라우저의 탭끼리만 공유되는 테스트 모드로 돌아갑니다.
  // Supabase 프로젝트 → Project Settings → API 에서 복사
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: "",

  // 게임 데이터를 저장할 테이블 이름 (README 의 SQL 로 만든 이름 그대로)
  SUPABASE_TABLE: "docs",
};
