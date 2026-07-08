import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from('persona_results')
    .select('fellow_id, scores, display_name')
    .eq('is_fellow', true)
    .not('fellow_id', 'is', null)

  if (error) {
    console.error('Failed to fetch fellow scores:', error)
    return NextResponse.json({ fellows: [] })
  }

  const fellows = (data || []).map(row => ({
    id: row.fellow_id,
    name: row.display_name,
    scores: row.scores,
  }))

  return NextResponse.json({ fellows })
}
