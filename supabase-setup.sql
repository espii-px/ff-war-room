-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New query).

-- 1. Create the user_data table
create table if not exists user_data (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  key        text not null,
  value      text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique (user_id, key)
);

-- 2. Enable Row Level Security so each user can only access their own rows
alter table user_data enable row level security;

create policy "Users can read their own data"
  on user_data for select
  using (auth.uid() = user_id);

create policy "Users can insert their own data"
  on user_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own data"
  on user_data for update
  using (auth.uid() = user_id);

create policy "Users can delete their own data"
  on user_data for delete
  using (auth.uid() = user_id);

-- 3. Auto-update the updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger user_data_updated_at
  before update on user_data
  for each row
  execute function update_updated_at();
