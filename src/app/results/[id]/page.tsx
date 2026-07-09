'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import RadarChart from '@/components/RadarChart'
import { PersonalityScores, Axis, AXIS_LABELS, AXIS_COLORS } from '@/lib/types'
import { FELLOWS } from '@/lib/fellows'
import { findTopFellows, similarityPercent } from '@/lib/scoring'

const AXES: Axis[] = [
  'openness', 'conscientiousness', 'extraversion',
  'agreeableness', 'stability', 'doomer_accel', 'chaos_order',
]

const SOCIAL_META: Record<string, { label: string; urlPrefix: string; icon: string }> = {
  twitter: { label: 'X', urlPrefix: 'https://x.com/', icon: '𝕏' },
  instagram: { label: 'IG', urlPrefix: 'https://instagram.com/', icon: '◎' },
  youtube: { label: 'YT', urlPrefix: '', icon: '▶' },
  website: { label: 'Web', urlPrefix: '', icon: '◇' },
  substack: { label: 'Substack', urlPrefix: '', icon: '✎' },
  tiktok: { label: 'TikTok', urlPrefix: 'https://tiktok.com/@', icon: '♪' },
  bandcamp: { label: 'Music', urlPrefix: '', icon: '♫' },
  music: { label: 'Music', urlPrefix: '', icon: '♫' },
}

function SocialLinks({ socials }: { socials: Record<string, string | undefined> }) {
  const entries = Object.entries(socials).filter(([, v]) => v)
  if (entries.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {entries.map(([key, value]) => {
        const meta = SOCIAL_META[key]
        if (!meta || !value) return null
        const href = value.startsWith('http') ? value : `${meta.urlPrefix}${value}`
        return (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all text-xs font-mono"
          >
            <span>{meta.icon}</span>
            <span>{meta.label}</span>
          </a>
        )
      })}
    </div>
  )
}

function MatchCard({ fellow, matchPercent }: { fellow: FellowWithScores; matchPercent: number }) {
  const staticData = FELLOWS.find(f => f.id === fellow.id)
  if (!staticData) return null

  const photo = fellow.profile?.avatar_url || staticData.photo_url
  const displayBio = fellow.profile?.bio || staticData.bio
  const displaySocials = fellow.profile?.socials
    ? { ...staticData.socials, ...fellow.profile.socials }
    : staticData.socials

  return (
    <div className="glass-card p-8 sm:p-10 text-center" style={{ borderColor: 'rgba(255,31,184,0.15)' }}>
      <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden border-2 border-neon-pink/30 bg-white/5 mb-5">
        {photo ? (
          <img src={photo} alt={staticData.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white/15 font-mono">
            {staticData.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="inline-block px-4 py-2 rounded-full bg-neon-pink/10 border border-neon-pink/20 mb-5">
        <span className="font-mono font-bold text-neon-pink text-2xl">{matchPercent}%</span>
        <span className="text-xs text-white/40 ml-2">personality match</span>
      </div>

      <h3 className="font-display font-bold text-2xl neon-pink mb-2">{staticData.name}</h3>
      <p className="text-sm text-white/50 max-w-md mx-auto mb-6 leading-relaxed">
        {displayBio}
      </p>

      <SocialLinks socials={displaySocials} />
    </div>
  )
}

function MiniMatchCard({ fellow, matchPercent, rank }: { fellow: FellowWithScores; matchPercent: number; rank: number }) {
  const staticData = FELLOWS.find(f => f.id === fellow.id)
  if (!staticData) return null

  const photo = fellow.profile?.avatar_url || staticData.photo_url
  const displayBio = fellow.profile?.bio || staticData.bio
  const displaySocials = fellow.profile?.socials
    ? { ...staticData.socials, ...fellow.profile.socials }
    : staticData.socials

  return (
    <div className="glass-card p-5 sm:p-6 flex items-center gap-5" style={{ borderColor: 'rgba(255,31,184,0.08)' }}>
      <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 border-neon-pink/20 bg-white/5">
        {photo ? (
          <img src={photo} alt={staticData.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white/15 font-mono">
            {staticData.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <span className="font-mono text-[10px] text-white/20">#{rank}</span>
          <h3 className="font-display font-bold text-base neon-pink truncate">{staticData.name}</h3>
          <span className="shrink-0 font-mono text-sm font-bold text-neon-pink/70">{matchPercent}%</span>
        </div>
        {displayBio && (
          <p className="text-xs text-white/35 truncate mb-2">{displayBio}</p>
        )}
        <SocialLinks socials={displaySocials} />
      </div>
    </div>
  )
}

interface StoredResult {
  id: string
  display_name: string
  scores: PersonalityScores
  is_fellow: boolean
  fellow_id: string | null
}

interface FellowProfile {
  bio?: string
  socials?: Record<string, string>
  avatar_url?: string
}

interface FellowWithScores {
  id: string
  name: string
  photo_url: string
  scores: PersonalityScores
  profile?: FellowProfile | null
}

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [result, setResult] = useState<StoredResult | null>(null)
  const [fellowScores, setFellowScores] = useState<FellowWithScores[]>([])
  const [selectedFellow, setSelectedFellow] = useState<FellowWithScores | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(`pdku-result-${id}`)
    if (stored) {
      setResult(JSON.parse(stored))
    }

    fetch('/api/fellows')
      .then(res => res.json())
      .then(data => {
        if (data.fellows) {
          setFellowScores(data.fellows.map((f: { id: string; name: string; scores: PersonalityScores; profile?: FellowProfile | null }) => ({
            ...f,
            photo_url: f.profile?.avatar_url || FELLOWS.find(sf => sf.id === f.id)?.photo_url || '',
          })))
        }
      })
      .catch(() => {})

    setLoading(false)
  }, [id])

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="font-mono text-sm text-white/30">loading results...</div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center">
        <h2 className="font-display font-bold text-3xl neon-pink mb-4">result not found</h2>
        <p className="text-sm text-white/40 mb-8">This result may have expired or doesn&apos;t exist.</p>
        <Link href="/quiz" className="glow-btn">Take the Quiz</Link>
      </div>
    )
  }

  const topMatches = fellowScores.length > 0
    ? findTopFellows(result.scores, fellowScores, 3)
    : []
  const topFellows = topMatches
    .map(m => {
      const fellow = fellowScores.find(f => f.id === m.id)
      return fellow ? { fellow, matchPercent: similarityPercent(m.distance) } : null
    })
    .filter(Boolean) as Array<{ fellow: FellowWithScores; matchPercent: number }>

  const primaryMatch = topFellows[0]?.fellow || null
  const compareTarget = selectedFellow || primaryMatch

  return (
    <div className="min-h-screen py-20">
      {/* Header */}
      <div className="text-center mb-16 fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="font-mono text-xs tracking-[0.25em] uppercase text-neon-teal/60 mb-4">
          your personality
        </div>
        <h1 className="font-display font-bold text-[clamp(2.5rem,8vw,5rem)] leading-tight neon-cyan mb-3">
          {result.display_name}
        </h1>
        {result.is_fellow && (
          <span className="inline-block px-3 py-1 text-[10px] font-mono uppercase tracking-widest bg-neon-pink/10 text-neon-pink border border-neon-pink/20 rounded-full">
            pdku fellow
          </span>
        )}
      </div>

      {/* Radar chart */}
      <div className="max-w-lg mx-auto mb-16 fade-in-up" style={{ animationDelay: '0.2s' }}>
        <RadarChart
          scores={result.scores}
          compareScores={compareTarget?.scores}
          compareName={compareTarget?.name}
          size={350}
        />
      </div>

      {/* Score breakdown */}
      <div className="max-w-2xl mx-auto mb-16 fade-in-up" style={{ animationDelay: '0.3s' }}>
        <h2 className="font-display font-bold text-2xl neon-yellow mb-8 text-center">
          your scores
        </h2>
        <div className="grid gap-4">
          {AXES.map(axis => {
            const score = result.scores[axis]
            const [low, high] = AXIS_LABELS[axis]
            const color = AXIS_COLORS[axis]
            return (
              <div key={axis} className="glass-card p-5" style={{ borderColor: `${color}10` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color }}>
                    {axis.replace('_', ' // ')}
                  </span>
                  <span className="text-sm font-mono font-bold" style={{ color }}>
                    {score}
                  </span>
                </div>
                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full rounded-full transition-all duration-1000"
                    style={{ width: `${score}%`, background: color }}
                  />
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] text-white/20 font-mono">
                  <span>{low}</span>
                  <span>{high}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top 3 matches */}
      {topFellows.length > 0 && (
        <div className="max-w-2xl mx-auto mb-16 fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="neon-divider mb-12" />
          <h2 className="font-display font-bold text-2xl neon-pink mb-8 text-center">
            your closest matches
          </h2>

          <div className="space-y-6">
            {topFellows.map(({ fellow, matchPercent }, i) => (
              <div key={fellow.id}>
                {i === 0 ? (
                  <MatchCard fellow={fellow} matchPercent={matchPercent} />
                ) : (
                  <MiniMatchCard fellow={fellow} matchPercent={matchPercent} rank={i + 1} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compare with other fellows */}
      {fellowScores.length > 1 && (
        <div className="max-w-2xl mx-auto mb-16 fade-in-up" style={{ animationDelay: '0.5s' }}>
          <h3 className="font-display font-bold text-xl neon-cyan mb-6 text-center">
            compare with any fellow
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {fellowScores.map(fs => {
              const fellow = FELLOWS.find(f => f.id === fs.id)
              if (!fellow) return null
              const isSelected = selectedFellow?.id === fs.id
              return (
                <button
                  key={fs.id}
                  onClick={() => setSelectedFellow(isSelected ? null : { ...fellow, scores: fs.scores })}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                    isSelected
                      ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/40'
                      : 'bg-white/5 text-white/40 border border-white/10 hover:border-neon-cyan/30 hover:text-neon-cyan'
                  }`}
                >
                  {fellow.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Share + retake */}
      <div className="text-center py-12">
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/quiz" className="glow-btn">
            Retake Quiz
          </Link>
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="glow-btn glow-btn-pink"
          >
            Copy Link
          </button>
        </div>
        <p className="text-[10px] font-mono text-white/15 mt-4">
          share your results // find your people
        </p>
      </div>
    </div>
  )
}
