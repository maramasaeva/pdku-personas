import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  const body = await request.json()
  const { id, display_name, scores, answers, is_fellow, fellow_id } = body

  if (!id || !scores) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { error } = await supabase
    .from('persona_results')
    .insert({
      id,
      display_name: display_name || 'Anonymous',
      scores,
      answers,
      is_fellow: is_fellow || false,
      fellow_id: fellow_id || null,
    })

  if (error) {
    console.error('Failed to save result:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id })
}
