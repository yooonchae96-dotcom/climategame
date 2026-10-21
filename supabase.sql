-- ============================================================
-- 기후 불평등 게임 - Supabase 테이블
-- Supabase → SQL Editor → New query 에 전체를 붙여 넣고 Run
-- ============================================================

-- 게임 데이터 전체를 담는 문서 테이블 (수업, 참가자, 소감이 모두 여기에 저장됨)
create table if not exists docs (
  path text primary key,          -- 예: sessions/1234, sessions/1234/players/p1abc, reflections/1234_p1abc
  data jsonb not null,
  updated_at timestamptz default now()
);

-- 접근 규칙: 수업용으로 단순하게, 누구나 읽고 쓸 수 있게 둔다
alter table docs enable row level security;
drop policy if exists "anyone can read" on docs;
drop policy if exists "anyone can insert" on docs;
drop policy if exists "anyone can update" on docs;
drop policy if exists "anyone can delete" on docs;
create policy "anyone can read"   on docs for select using (true);
create policy "anyone can insert" on docs for insert with check (true);
create policy "anyone can update" on docs for update using (true);
create policy "anyone can delete" on docs for delete using (true);

-- 실시간 알림 켜기 (학생이 제출하면 교사 화면이 바로 바뀌게)
alter publication supabase_realtime add table docs;
