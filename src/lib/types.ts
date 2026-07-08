export type Axis =
  | 'openness'
  | 'conscientiousness'
  | 'extraversion'
  | 'agreeableness'
  | 'stability'
  | 'doomer_accel'
  | 'chaos_order'

export const AXIS_LABELS: Record<Axis, [string, string]> = {
  openness: ['Conventional', 'Open'],
  conscientiousness: ['Spontaneous', 'Disciplined'],
  extraversion: ['Introverted', 'Extraverted'],
  agreeableness: ['Challenger', 'Harmonizer'],
  stability: ['Turbulent', 'Steady'],
  doomer_accel: ['Doomer', 'Accelerationist'],
  chaos_order: ['Chaos', 'Order'],
}

export const AXIS_COLORS: Record<Axis, string> = {
  openness: '#b026ff',
  conscientiousness: '#fbec14',
  extraversion: '#ff1fb8',
  agreeableness: '#14f0b0',
  stability: '#1fc4ff',
  doomer_accel: '#ff6b35',
  chaos_order: '#ff1f1f',
}

export interface Question {
  id: string
  text: string
  axis: Axis
  reverse: boolean
  fellowOnly: boolean
}

export interface PersonalityScores {
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  stability: number
  doomer_accel: number
  chaos_order: number
}

export interface Fellow {
  id: string
  name: string
  bio: string
  photo_url: string
  socials: Record<string, string | undefined>
  scores?: PersonalityScores
}

export interface QuizResult {
  id: string
  display_name: string
  scores: PersonalityScores
  closest_fellow_id: string | null
  created_at: string
}
