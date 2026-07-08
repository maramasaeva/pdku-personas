'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FELLOWS } from '@/lib/fellows'
import { FELLOW_QUESTIONS } from '@/lib/questions'
import { calculateScores } from '@/lib/scoring'
import RadarChart from '@/components/RadarChart'
import QuizCard from '@/components/QuizCard'
import type { Fellow, Question, PersonalityScores, Axis } from '@/lib/types'
import { AXIS_LABELS, AXIS_COLORS } from '@/lib/types'

const SOCIAL_FIELDS = [
  { key: 'twitter', label: 'X / Twitter', placeholder: 'handle (without @)' },
  { key: 'instagram', label: 'Instagram', placeholder: 'handle' },
  { key: 'youtube', label: 'YouTube', placeholder: 'channel URL' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'handle' },
  { key: 'website', label: 'Website', placeholder: 'https://...' },
  { key: 'substack', label: 'Substack', placeholder: 'URL' },
  { key: 'bandcamp', label: 'Bandcamp / Music', placeholder: 'URL' },
]

const AXES: Axis[] = [
  'openness', 'conscientiousness', 'extraversion',
  'agreeableness', 'stability', 'doomer_accel', 'chaos_order',
]

type Stage = 'passcode' | 'select' | 'profile' | 'quiz' | 'submitting' | 'existing'

interface ExistingResult {
  id: string
  scores: PersonalityScores
  created_at: string
}

export default function FellowQuizPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [stage, setStage] = useState<Stage>('passcode')
  const [passcode, setPasscode] = useState('')
  const [passcodeError, setPasscodeError] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const [selectedFellow, setSelectedFellow] = useState<Fellow | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [failedImgs, setFailedImgs] = useState<Set<string>>(new Set())
  const onImgError = useCallback((id: string) => {
    setFailedImgs(prev => new Set(prev).add(id))
  }, [])

  // Profile fields
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [socials, setSocials] = useState<Record<string, string>>({})
  const [profileLoaded, setProfileLoaded] = useState(false)

  // Existing result
  const [existingResult, setExistingResult] = useState<ExistingResult | null>(null)

  // Quiz state
  const questions: Question[] = FELLOW_QUESTIONS
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [animClass, setAnimClass] = useState('quiz-card-enter')

  const currentQuestion = questions[currentIndex]
  const progress = (currentIndex / questions.length) * 100
  const allAnswered = questions.every(q => answers[q.id] != null)
  const isLastQuestion = currentIndex === questions.length - 1

  // Check sessionStorage for existing passcode verification
  useEffect(() => {
    if (sessionStorage.getItem('pdku-fellow-verified') === 'true') {
      setStage('select')
    }
  }, [])

  async function handlePasscode(e: React.FormEvent) {
    e.preventDefault()
    setVerifying(true)
    setPasscodeError(false)
    try {
      const res = await fetch('/api/verify-fellow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      })
      const data = await res.json()
      if (data.ok) {
        sessionStorage.setItem('pdku-fellow-verified', 'true')
        setStage('select')
      } else {
        setPasscodeError(true)
      }
    } catch {
      setPasscodeError(true)
    }
    setVerifying(false)
  }

  // Load existing profile + check for existing quiz result
  useEffect(() => {
    if (!selectedFellow || profileLoaded) return

    setDisplayName(selectedFellow.name)
    setBio(selectedFellow.bio || '')
    const staticSocials: Record<string, string> = {}
    for (const [k, v] of Object.entries(selectedFellow.socials)) {
      if (v) staticSocials[k] = v
    }
    setSocials(staticSocials)

    // Check saved profile
    fetch(`/api/fellow-profile?id=${selectedFellow.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.profile) {
          if (data.profile.display_name) setDisplayName(data.profile.display_name)
          if (data.profile.bio) setBio(data.profile.bio)
          if (data.profile.socials) {
            setSocials(prev => ({ ...prev, ...data.profile.socials }))
          }
          if (data.profile.avatar_url) setAvatarPreview(data.profile.avatar_url)
        }
        setProfileLoaded(true)
      })
      .catch(() => setProfileLoaded(true))

    // Check for existing quiz result
    fetch(`/api/fellows`)
      .then(res => res.json())
      .then(data => {
        const existing = data.fellows?.find((f: { id: string }) => f.id === selectedFellow.id)
        if (existing?.scores) {
          setExistingResult({ id: existing.id, scores: existing.scores, created_at: '' })
        }
      })
      .catch(() => {})
  }, [selectedFellow, profileLoaded])

  function updateSocial(key: string, value: string) {
    setSocials(prev => {
      const next = { ...prev }
      if (value.trim()) {
        next[key] = value.trim()
      } else {
        delete next[key]
      }
      return next
    })
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleProfileConfirm() {
    if (!selectedFellow) return
    setUploading(true)

    let avatarUrl: string | undefined

    if (avatarFile) {
      const formData = new FormData()
      formData.append('file', avatarFile)
      formData.append('fellow_id', selectedFellow.id)
      try {
        const res = await fetch('/api/upload-avatar', { method: 'POST', body: formData })
        const data = await res.json()
        if (data.url) avatarUrl = data.url
      } catch {}
    }

    try {
      await fetch('/api/fellow-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fellow_id: selectedFellow.id,
          display_name: displayName,
          bio,
          socials,
          avatar_url: avatarUrl || avatarPreview || selectedFellow.photo_url || null,
        }),
      })
    } catch {}

    setUploading(false)

    if (existingResult) {
      setStage('existing')
    } else {
      setStage('quiz')
    }
  }

  const goToNext = useCallback((questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    if (currentIndex < questions.length - 1) {
      setAnimClass('quiz-card-exit')
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1)
        setAnimClass('quiz-card-enter')
      }, 250)
    }
  }, [currentIndex, questions.length])

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setAnimClass('quiz-card-exit')
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1)
        setAnimClass('quiz-card-enter')
      }, 250)
    }
  }, [currentIndex])

  async function handleSubmit() {
    if (!selectedFellow) return
    setStage('submitting')
    const scores = calculateScores(answers, questions)
    const resultId = crypto.randomUUID()

    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resultId,
          display_name: displayName,
          scores,
          answers,
          is_fellow: true,
          fellow_id: selectedFellow.id,
        }),
      })
    } catch {}

    localStorage.setItem(`pdku-result-${resultId}`, JSON.stringify({
      id: resultId,
      display_name: displayName,
      scores,
      is_fellow: true,
      fellow_id: selectedFellow.id,
    }))

    router.push(`/results/${resultId}`)
  }

  // ── Stage: Passcode ──
  if (stage === 'passcode') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <form onSubmit={handlePasscode} className="glass-card p-8 sm:p-12 max-w-sm w-full text-center fade-in-up">
          <h2 className="font-display font-bold text-3xl neon-pink mb-2">
            fellows only
          </h2>
          <p className="text-xs text-white/40 mb-8">
            enter the passcode to access the fellow quiz
          </p>

          <input
            type="text"
            value={passcode}
            onChange={e => { setPasscode(e.target.value); setPasscodeError(false) }}
            placeholder="passcode"
            autoFocus
            className={`w-full px-4 py-3 bg-white/[0.04] border rounded-xl text-white text-sm font-mono text-center tracking-widest placeholder:text-white/20 focus:outline-none transition-all mb-4 ${
              passcodeError ? 'border-red-500/50 focus:border-red-500/80' : 'border-white/10 focus:border-neon-cyan/50 focus:shadow-[0_0_15px_rgba(31,196,255,0.1)]'
            }`}
          />

          {passcodeError && (
            <p className="text-xs text-red-400 mb-4">wrong passcode</p>
          )}

          <button type="submit" disabled={verifying || !passcode.trim()} className="glow-btn w-full !block text-center">
            {verifying ? 'Checking...' : 'Enter'}
          </button>
        </form>
      </div>
    )
  }

  // ── Stage: Select yourself ──
  if (stage === 'select') {
    return (
      <div className="min-h-screen py-20">
        <div className="text-center mb-12">
          <div className="font-mono text-xs tracking-[0.25em] uppercase text-neon-teal/60 mb-4">
            fellow quiz
          </div>
          <h1 className="font-display font-bold text-[clamp(2.5rem,8vw,5rem)] leading-tight neon-cyan mb-3">
            who are you?
          </h1>
          <p className="text-sm text-white/40 max-w-md mx-auto">
            Select yourself from the grid below. You&apos;ll review your profile, then take the extended quiz ({FELLOW_QUESTIONS.length} questions).
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {FELLOWS.map(f => (
            <button
              key={f.id}
              onClick={() => {
                setSelectedFellow(f)
                setProfileLoaded(false)
                setExistingResult(null)
                setStage('profile')
              }}
              className="glass-card p-4 text-center group cursor-pointer text-left hover:!border-neon-cyan/40"
            >
              <div className="w-16 h-16 mx-auto rounded-lg overflow-hidden border-2 border-white/10 group-hover:border-neon-cyan/40 transition-colors bg-white/5 mb-3">
                {f.photo_url && !failedImgs.has(f.id) ? (
                  <img src={f.photo_url} alt={f.name} className="w-full h-full object-cover" onError={() => onImgError(f.id)} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white/15 font-mono">
                    {f.name.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="font-bold text-xs leading-tight text-center">{f.name}</h3>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Stage: Profile review + edit ──
  if (stage === 'profile' && selectedFellow) {
    const displayPhoto = avatarPreview || (selectedFellow.photo_url && !failedImgs.has(selectedFellow.id) ? selectedFellow.photo_url : null)

    return (
      <div className="min-h-[80vh] flex items-center justify-center py-20">
        <div className="glass-card p-8 sm:p-10 max-w-lg w-full fade-in-up">
          <h2 className="font-display font-bold text-2xl neon-cyan mb-1">
            hey, {displayName}
          </h2>
          <p className="text-xs text-white/40 mb-8">
            review your profile // this is what people see when they match with you. edit anything you want.
          </p>

          {/* Photo + name */}
          <div className="flex items-center gap-5 mb-6">
            <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-neon-cyan/30 bg-white/5 relative group shrink-0">
              {displayPhoto ? (
                <img src={displayPhoto} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white/15 font-mono">
                  {displayName.charAt(0)}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-mono text-white/70 uppercase tracking-wider"
              >
                change
              </button>
            </div>
            <div className="flex-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-mono uppercase tracking-wider text-neon-pink/60 hover:text-neon-pink transition-colors"
              >
                {displayPhoto ? 'change photo' : 'upload a photo'}
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Screen name */}
          <div className="mb-5">
            <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 mb-2">
              screen name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="your display name"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm font-light placeholder:text-white/20 focus:outline-none focus:border-neon-cyan/50 focus:shadow-[0_0_15px_rgba(31,196,255,0.1)] transition-all"
            />
          </div>

          {/* Bio */}
          <div className="mb-5">
            <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 mb-2">
              your intro
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="a short bio that shows up on your profile"
              rows={3}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm font-light placeholder:text-white/20 focus:outline-none focus:border-neon-cyan/50 focus:shadow-[0_0_15px_rgba(31,196,255,0.1)] transition-all resize-none"
            />
          </div>

          {/* Socials */}
          <div className="mb-8">
            <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 mb-3">
              socials
            </label>
            <div className="grid gap-3">
              {SOCIAL_FIELDS.map(field => (
                <div key={field.key} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-white/40 w-20 shrink-0 text-right">
                    {field.label}
                  </span>
                  <input
                    type="text"
                    value={socials[field.key] || ''}
                    onChange={e => updateSocial(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/10 rounded-lg text-white text-xs font-light placeholder:text-white/15 focus:outline-none focus:border-neon-cyan/50 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={handleProfileConfirm}
            disabled={uploading || !displayName.trim()}
            className="glow-btn w-full !block text-center"
          >
            {uploading ? 'Saving...' : 'Save Profile & Continue'}
          </button>

          <button
            onClick={() => {
              setStage('select')
              setAvatarPreview(null)
              setAvatarFile(null)
              setProfileLoaded(false)
            }}
            className="text-xs font-mono text-white/20 hover:text-white/40 transition-colors mt-4 w-full text-center block"
          >
            ← that&apos;s not me
          </button>
        </div>
      </div>
    )
  }

  // ── Stage: Existing result ──
  if (stage === 'existing' && existingResult && selectedFellow) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-20">
        <div className="max-w-lg w-full fade-in-up">
          <div className="text-center mb-8">
            <div className="font-mono text-xs tracking-[0.25em] uppercase text-neon-teal/60 mb-4">
              welcome back
            </div>
            <h2 className="font-display font-bold text-3xl neon-cyan mb-2">
              {displayName}
            </h2>
            <p className="text-sm text-white/40">
              you&apos;ve already taken the quiz // here are your results
            </p>
          </div>

          <div className="glass-card p-8 mb-8">
            <RadarChart scores={existingResult.scores} size={300} />
            <div className="grid grid-cols-2 gap-3 mt-6">
              {AXES.map(axis => {
                const score = existingResult.scores[axis]
                return (
                  <div key={axis} className="flex items-center justify-between text-xs px-2 py-1.5">
                    <span className="font-mono text-white/30">{AXIS_LABELS[axis][1]}</span>
                    <span className="font-mono font-bold" style={{ color: AXIS_COLORS[axis] }}>
                      {score}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 items-center">
            <button
              onClick={() => {
                setExistingResult(null)
                setStage('quiz')
              }}
              className="glow-btn glow-btn-pink"
            >
              Retake the Quiz
            </button>
            <button
              onClick={() => {
                setStage('profile')
              }}
              className="text-xs font-mono uppercase tracking-wider text-white/30 hover:text-neon-cyan transition-colors"
            >
              ← edit profile
            </button>
          </div>

          <p className="text-[10px] font-mono text-white/15 mt-6 text-center">
            profile changes are saved // retaking overwrites your previous answers
          </p>
        </div>
      </div>
    )
  }

  // ── Stage: Submitting ──
  if (stage === 'submitting') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="font-display font-bold text-3xl neon-cyan mb-4">processing...</div>
          <p className="text-sm text-white/40">calculating your personality shape</p>
        </div>
      </div>
    )
  }

  // ── Stage: Quiz ──
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-20">
      <div className="text-center mb-4">
        <span className="inline-block px-3 py-1 text-[10px] font-mono uppercase tracking-widest bg-neon-pink/10 text-neon-pink border border-neon-pink/20 rounded-full">
          fellow quiz // {displayName}
        </span>
      </div>

      <div className="w-full max-w-2xl mb-12">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-mono text-white/20">
          <span>{currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {currentQuestion && (
        <QuizCard
          key={currentQuestion.id}
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          selectedValue={answers[currentQuestion.id] ?? null}
          onSelect={(value) => goToNext(currentQuestion.id, value)}
          animClass={animClass}
        />
      )}

      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="text-xs font-mono uppercase tracking-wider text-white/30 hover:text-neon-cyan transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
        >
          ← back
        </button>

        {isLastQuestion && allAnswered && (
          <button onClick={handleSubmit} className="glow-btn glow-btn-pink">
            See Results
          </button>
        )}
      </div>

      <p className="text-[10px] font-mono text-white/15 mt-6">
        press 1-5 to answer // ← to go back
      </p>
    </div>
  )
}
