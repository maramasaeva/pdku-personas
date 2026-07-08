@AGENTS.md

## pdku:personas

Personality quiz site for plzdontkillus. Same visual system as pdku-arena.

### Stack
- Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Turbopack
- Supabase (shared instance with pdku-arena, project ref: djwejegjbhsusqludzyv)
- Deployed: Vercel (pdku-personas)

### Conventions
- Em dashes replaced with `//` site-wide (from pdku-arena)
- `* { margin:0; padding:0 }` reset MUST be inside `@layer base {}` (Tailwind v4)
- `.page-container` for layout (max-width 1400px, clamp padding)
- Profile photos in `public/avatars/` (copied from pdku-arena)
- `useSearchParams()` needs `<Suspense>` wrapper for static generation

### Architecture
- 84 total questions across 7 axes (Big Five + doomer/accel + chaos/order)
- Fellows get all 84 questions, public gets 49 (curated subset)
- Quiz is one-question-at-a-time with keyboard shortcuts (1-5, arrow keys)
- Results stored in Supabase `persona_results` table
- Fellow results used as comparison targets for public quiz takers
- Fellows access via `/quiz?fellow=THEIR_FELLOW_ID`

### Supabase table: persona_results
```sql
create table persona_results (
  id uuid primary key,
  display_name text not null default 'Anonymous',
  scores jsonb not null,
  answers jsonb,
  is_fellow boolean default false,
  fellow_id text,
  created_at timestamptz default now()
);
```
