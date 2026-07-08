import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ALL_QUESTIONS, PUBLIC_QUESTIONS } from '@/lib/questions'
import type { Axis } from '@/lib/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const AXES: Axis[] = [
  'openness', 'conscientiousness', 'extraversion',
  'agreeableness', 'stability', 'doomer_accel', 'chaos_order',
]
const QUESTIONS_PER_AXIS = 7
const MIN_FELLOWS_FOR_CURATION = 5

export async function GET() {
  const { data: fellowResults } = await supabase
    .from('persona_results')
    .select('answers')
    .eq('is_fellow', true)

  if (!fellowResults || fellowResults.length < MIN_FELLOWS_FOR_CURATION) {
    return NextResponse.json({
      questions: PUBLIC_QUESTIONS,
      curated: false,
      fellow_count: fellowResults?.length || 0,
    })
  }

  const questionVariances: Array<{ id: string; axis: Axis; variance: number }> = []

  for (const q of ALL_QUESTIONS) {
    const values: number[] = []
    for (const result of fellowResults) {
      const answers = result.answers as Record<string, number> | null
      if (answers && answers[q.id] != null) {
        values.push(answers[q.id])
      }
    }

    if (values.length < 3) continue

    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
    questionVariances.push({ id: q.id, axis: q.axis, variance })
  }

  const selected: string[] = []
  for (const axis of AXES) {
    const axisQuestions = questionVariances
      .filter(qv => qv.axis === axis)
      .sort((a, b) => b.variance - a.variance)
      .slice(0, QUESTIONS_PER_AXIS)
      .map(qv => qv.id)
    selected.push(...axisQuestions)
  }

  const curatedQuestions = ALL_QUESTIONS.filter(q => selected.includes(q.id))

  return NextResponse.json({
    questions: curatedQuestions,
    curated: true,
    fellow_count: fellowResults.length,
  })
}
