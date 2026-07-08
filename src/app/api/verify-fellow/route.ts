import { NextResponse } from 'next/server'

const FELLOW_PASSCODE = process.env.FELLOW_PASSCODE || 'pdku2026'

export async function POST(request: Request) {
  const { passcode } = await request.json()

  if (passcode === FELLOW_PASSCODE) {
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: false, error: 'Wrong passcode' }, { status: 401 })
}
