import { Question, Axis, PersonalityScores } from './types'

const AXES: Axis[] = [
  'openness', 'conscientiousness', 'extraversion',
  'agreeableness', 'stability', 'doomer_accel', 'chaos_order',
]

export function calculateScores(
  answers: Record<string, number>,
  questions: Question[]
): PersonalityScores {
  const sums: Record<Axis, number[]> = {
    openness: [], conscientiousness: [], extraversion: [],
    agreeableness: [], stability: [], doomer_accel: [], chaos_order: [],
  }

  for (const q of questions) {
    const raw = answers[q.id]
    if (raw == null) continue
    const value = q.reverse ? (6 - raw) : raw
    sums[q.axis].push(value)
  }

  const scores = {} as PersonalityScores
  for (const axis of AXES) {
    const vals = sums[axis]
    if (vals.length === 0) {
      scores[axis] = 50
      continue
    }
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length
    scores[axis] = Math.round(((mean - 1) / 4) * 100)
  }

  return scores
}

export function findClosestFellow(
  scores: PersonalityScores,
  fellows: Array<{ id: string; scores: PersonalityScores }>
): { id: string; distance: number } | null {
  if (fellows.length === 0) return null

  let closest = { id: '', distance: Infinity }

  for (const fellow of fellows) {
    let sum = 0
    for (const axis of AXES) {
      const diff = scores[axis] - fellow.scores[axis]
      sum += diff * diff
    }
    const distance = Math.sqrt(sum)
    if (distance < closest.distance) {
      closest = { id: fellow.id, distance }
    }
  }

  return closest
}

export function similarityPercent(distance: number): number {
  const maxDistance = Math.sqrt(7 * 100 * 100)
  return Math.round((1 - distance / maxDistance) * 100)
}
