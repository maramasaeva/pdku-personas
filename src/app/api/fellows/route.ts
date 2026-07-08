import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  const [resultsRes, profilesRes] = await Promise.all([
    supabase
      .from('persona_results')
      .select('fellow_id, scores, display_name')
      .eq('is_fellow', true)
      .not('fellow_id', 'is', null),
    supabase
      .from('fellow_profiles')
      .select('*'),
  ])

  const results = resultsRes.data || []
  const profiles = profilesRes.data || []

  const profileMap = new Map(profiles.map(p => [p.fellow_id, p]))

  const fellows = results.map(row => {
    const profile = profileMap.get(row.fellow_id)
    return {
      id: row.fellow_id,
      name: row.display_name,
      scores: row.scores,
      profile: profile ? {
        bio: profile.bio,
        socials: profile.socials,
        avatar_url: profile.avatar_url,
      } : null,
    }
  })

  return NextResponse.json({ fellows })
}
