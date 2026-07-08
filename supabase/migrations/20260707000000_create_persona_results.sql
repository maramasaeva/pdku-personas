create table if not exists persona_results (
  id uuid primary key,
  display_name text not null default 'Anonymous',
  scores jsonb not null,
  answers jsonb,
  is_fellow boolean default false,
  fellow_id text,
  created_at timestamptz default now()
);

alter table persona_results enable row level security;

create policy "persona_read_all" on persona_results for select using (true);
create policy "persona_insert_all" on persona_results for insert with check (true);
