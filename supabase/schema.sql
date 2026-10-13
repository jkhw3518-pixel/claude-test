-- Supabase 대시보드 > SQL Editor 에서 한 번 실행하세요.

create table if not exists public.contacts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 100),
  phone       text not null check (char_length(phone) between 1 and 30),
  email       text,
  group_name  text,
  memo        text,
  favorite    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists contacts_user_id_idx on public.contacts (user_id);

-- updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists contacts_set_updated_at on public.contacts;
create trigger contacts_set_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

-- Row Level Security: 로그인한 사용자는 자기 연락처만 보고 수정할 수 있습니다.
alter table public.contacts enable row level security;

drop policy if exists "contacts_select_own" on public.contacts;
drop policy if exists "contacts_insert_own" on public.contacts;
drop policy if exists "contacts_update_own" on public.contacts;
drop policy if exists "contacts_delete_own" on public.contacts;

create policy "contacts_select_own" on public.contacts
  for select to authenticated using (auth.uid() = user_id);
create policy "contacts_insert_own" on public.contacts
  for insert to authenticated with check (auth.uid() = user_id);
create policy "contacts_update_own" on public.contacts
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "contacts_delete_own" on public.contacts
  for delete to authenticated using (auth.uid() = user_id);
