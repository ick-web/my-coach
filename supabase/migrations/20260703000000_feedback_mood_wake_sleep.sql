-- 저녁 회고 무드 기록 + 온보딩 기상/취침 시간 영속화
alter table public.feedbacks
  add column mood text check (mood in ('bad', 'meh', 'okay', 'good', 'great'));

alter table public.goals
  add column wake_time  text not null default '07:00',
  add column sleep_time text not null default '23:00';
