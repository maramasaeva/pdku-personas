import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const fellowId = formData.get('fellow_id') as string | null

  if (!file || !fellowId) {
    return NextResponse.json({ error: 'Missing file or fellow_id' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${fellowId}.${ext}`

  const buffer = await file.arrayBuffer()

  const { error } = await supabase.storage
    .from('persona-avatars')
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }

  const { data: urlData } = supabase.storage
    .from('persona-avatars')
    .getPublicUrl(path)

  return NextResponse.json({ url: urlData.publicUrl })
}
