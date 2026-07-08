create table if not exists fellow_profiles (
  fellow_id text primary key,
  display_name text,
  bio text,
  socials jsonb default '{}'::jsonb,
  avatar_url text,
  updated_at timestamptz default now()
);

alter table fellow_profiles enable row level security;

create policy "Anyone can read fellow profiles" on fellow_profiles for select using (true);
create policy "Anyone can insert fellow profiles" on fellow_profiles for insert with check (true);
create policy "Anyone can update fellow profiles" on fellow_profiles for update using (true);
