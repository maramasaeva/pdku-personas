import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  const fellowId = request.nextUrl.searchParams.get('id')
  if (!fellowId) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const { data } = await supabase
    .from('fellow_profiles')
    .select('*')
    .eq('fellow_id', fellowId)
    .single()

  return NextResponse.json({ profile: data })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { fellow_id, display_name, bio, socials, avatar_url } = body

  if (!fellow_id) {
    return NextResponse.json({ error: 'Missing fellow_id' }, { status: 400 })
  }

  const { error } = await supabase
    .from('fellow_profiles')
    .upsert({
      fellow_id,
      display_name,
      bio,
      socials,
      avatar_url,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'fellow_id' })

  if (error) {
    console.error('Profile save error:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
