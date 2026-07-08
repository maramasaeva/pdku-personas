'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import RadarChart from '@/components/RadarChart'
import { FELLOWS } from '@/lib/fellows'
import { PersonalityScores, Axis, AXIS_LABELS, AXIS_COLORS } from '@/lib/types'

const AXES: Axis[] = [
  'openness', 'conscientiousness', 'extraversion',
  'agreeableness', 'stability', 'doomer_accel', 'chaos_order',
]

interface FellowWithScores {
  id: string
  name: string
  scores: PersonalityScores
}

export default function FellowsPage() {
  const [fellowScores, setFellowScores] = useState<FellowWithScores[]>([])
  const [selectedFellow, setSelectedFellow] = useState<FellowWithScores | null>(null)
  const [loading, setLoading] = useState(true)
  const [failedImgs, setFailedImgs] = useState<Set<string>>(new Set())
  const onImgError = useCallback((id: string) => {
    setFailedImgs(prev => new Set(prev).add(id))
  }, [])

  useEffect(() => {
    fetch('/api/fellows')
      .then(res => res.json())
      .then(data => {
        if (data.fellows) setFellowScores(data.fellows)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const fellowsWithData = FELLOWS.map(f => ({
    ...f,
    hasScores: fellowScores.some(fs => fs.id === f.id),
    scores: fellowScores.find(fs => fs.id === f.id)?.scores,
  }))

  const completedCount = fellowsWithData.filter(f => f.hasScores).length

  return (
    <div className="min-h-screen py-20">
      <div className="text-center mb-16">
        <div className="font-mono text-xs tracking-[0.25em] uppercase text-neon-teal/60 mb-4">
          plzdontkillus fellows
        </div>
        <h1 className="font-display font-bold text-[clamp(2.5rem,8vw,5rem)] leading-tight neon-cyan mb-3">
          the cast
        </h1>
        <p className="text-sm text-white/40 max-w-md mx-auto mb-4">
          {FELLOWS.length} fellows. {completedCount > 0 ? `${completedCount} have taken the quiz.` : 'Waiting for quiz results.'}
        </p>
        {completedCount === 0 && (
          <p className="text-xs text-white/25 font-mono">
            fellows // take the quiz at /quiz?fellow=YOUR_ID
          </p>
        )}
      </div>

      {/* Selected fellow detail */}
      {selectedFellow && (
        <div className="max-w-lg mx-auto mb-16 fade-in-up">
          <div className="glass-card p-8 text-center" style={{ borderColor: 'rgba(31,196,255,0.15)' }}>
            <button
              onClick={() => setSelectedFellow(null)}
              className="absolute top-4 right-4 text-white/30 hover:text-white text-lg"
            >
              &times;
            </button>
            <h3 className="font-display font-bold text-xl neon-cyan mb-4">
              {FELLOWS.find(f => f.id === selectedFellow.id)?.name}
            </h3>
            <RadarChart scores={selectedFellow.scores} size={280} />
            <div className="grid grid-cols-2 gap-2 mt-6">
              {AXES.map(axis => (
                <div key={axis} className="flex items-center justify-between text-xs px-2 py-1">
                  <span className="font-mono text-white/30">{AXIS_LABELS[axis][1]}</span>
                  <span className="font-mono font-bold" style={{ color: AXIS_COLORS[axis] }}>
                    {selectedFellow.scores[axis]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fellows grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        {fellowsWithData.map(f => (
          <button
            key={f.id}
            onClick={() => {
              if (f.scores) {
                setSelectedFellow({ id: f.id, name: f.name, scores: f.scores })
              }
            }}
            className={`glass-card p-4 text-center group text-left ${f.hasScores ? 'cursor-pointer' : 'cursor-default opacity-50'}`}
            disabled={!f.hasScores}
          >
            <div className="w-14 h-14 mx-auto rounded-lg overflow-hidden border-2 border-white/10 group-hover:border-neon-cyan/40 transition-colors bg-white/5 mb-3">
              {f.photo_url && !failedImgs.has(f.id) ? (
                <img src={f.photo_url} alt={f.name} className="w-full h-full object-cover" onError={() => onImgError(f.id)} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white/15 font-mono">
                  {f.name.charAt(0)}
                </div>
              )}
            </div>
            <h3 className="font-bold text-xs leading-tight mb-1 text-center">{f.name}</h3>
            {f.hasScores ? (
              <p className="text-[10px] text-neon-cyan/50 text-center font-mono">quiz taken</p>
            ) : (
              <p className="text-[10px] text-white/20 text-center font-mono">pending</p>
            )}
          </button>
        ))}
      </div>

      <div className="neon-divider mt-16 mb-8" />

      <div className="text-center">
        <Link href="/quiz" className="glow-btn">
          Take the Quiz
        </Link>
      </div>
    </div>
  )
}
