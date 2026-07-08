'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FELLOWS } from '@/lib/fellows'
import { FELLOW_QUESTIONS } from '@/lib/questions'
import { calculateScores } from '@/lib/scoring'
import QuizCard from '@/components/QuizCard'
import type { Fellow, Question } from '@/lib/types'

const SOCIAL_FIELDS = [
  { key: 'twitter', label: 'X / Twitter', placeholder: 'handle (without @)' },
  { key: 'instagram', label: 'Instagram', placeholder: 'handle' },
  { key: 'youtube', label: 'YouTube', placeholder: 'channel URL' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'handle' },
  { key: 'website', label: 'Website', placeholder: 'https://...' },
  { key: 'substack', label: 'Substack', placeholder: 'URL' },
  { key: 'bandcamp', label: 'Bandcamp / Music', placeholder: 'URL' },
]

type Stage = 'select' | 'profile' | 'quiz' | 'submitting'

export default function FellowQuizPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [stage, setStage] = useState<Stage>('select')
  const [selectedFellow, setSelectedFellow] = useState<Fellow | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [failedImgs, setFailedImgs] = useState<Set<string>>(new Set())
  const onImgError = useCallback((id: string) => {
    setFailedImgs(prev => new Set(prev).add(id))
  }, [])

  // Profile fields
  const [bio, setBio] = useState('')
  const [socials, setSocials] = useState<Record<string, string>>({})
  const [profileLoaded, setProfileLoaded] = useState(false)

  // Quiz state
  const questions: Question[] = FELLOW_QUESTIONS
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [animClass, setAnimClass] = useState('quiz-card-enter')

  const currentQuestion = questions[currentIndex]
  const progress = (currentIndex / questions.length) * 100
  const allAnswered = questions.every(q => answers[q.id] != null)
  const isLastQuestion = currentIndex === questions.length - 1

  // Load existing profile from DB when fellow is selected
  useEffect(() => {
    if (!selectedFellow || profileLoaded) return

    // Pre-fill from static data
    setBio(selectedFellow.bio || '')
    const staticSocials: Record<string, string> = {}
    for (const [k, v] of Object.entries(selectedFellow.socials)) {
      if (v) staticSocials[k] = v
    }
    setSocials(staticSocials)

    // Then check if they have a saved profile that overrides
    fetch(`/api/fellow-profile?id=${selectedFellow.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.profile) {
          if (data.profile.bio) setBio(data.profile.bio)
          if (data.profile.socials) {
            setSocials(prev => ({ ...prev, ...data.profile.socials }))
          }
          if (data.profile.avatar_url) setAvatarPreview(data.profile.avatar_url)
        }
        setProfileLoaded(true)
      })
      .catch(() => setProfileLoaded(true))
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

    // Upload photo if changed
    if (avatarFile) {
      const formData = new FormData()
      formData.append('file', avatarFile)
      formData.append('fellow_id', selectedFellow.id)
      try {
        const res = await fetch('/api/upload-avatar', { method: 'POST', body: formData })
        const data = await res.json()
        if (data.url) avatarUrl = data.url
      } catch {
        // continue anyway
      }
    }

    // Save profile
    try {
      await fetch('/api/fellow-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fellow_id: selectedFellow.id,
          display_name: selectedFellow.name,
          bio,
          socials,
          avatar_url: avatarUrl || avatarPreview || selectedFellow.photo_url || null,
        }),
      })
    } catch {
      // continue anyway
    }

    setUploading(false)
    setStage('quiz')
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
          display_name: selectedFellow.name,
          scores,
          answers,
          is_fellow: true,
          fellow_id: selectedFellow.id,
        }),
      })
    } catch {
      // fallback
    }

    localStorage.setItem(`pdku-result-${resultId}`, JSON.stringify({
      id: resultId,
      display_name: selectedFellow.name,
      scores,
      is_fellow: true,
      fellow_id: selectedFellow.id,
    }))

    router.push(`/results/${resultId}`)
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
            hey, {selectedFellow.name}
          </h2>
          <p className="text-xs text-white/40 mb-8">
            review your profile before taking the quiz. edit anything you want // this is what people see when they match with you.
          </p>

          {/* Photo */}
          <div className="flex items-center gap-5 mb-8">
            <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-neon-cyan/30 bg-white/5 relative group shrink-0">
              {displayPhoto ? (
                <img src={displayPhoto} alt={selectedFellow.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white/15 font-mono">
                  {selectedFellow.name.charAt(0)}
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
              <div className="font-bold text-sm mb-1">{selectedFellow.name}</div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-mono uppercase tracking-wider text-neon-pink/60 hover:text-neon-pink transition-colors"
              >
                {displayPhoto ? 'upload different photo' : 'upload a photo'}
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

          {/* Bio */}
          <div className="mb-6">
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
            disabled={uploading}
            className="glow-btn w-full !block text-center"
          >
            {uploading ? 'Saving...' : 'Save & Start Quiz'}
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
          fellow quiz // {selectedFellow?.name}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-2xl mb-12">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-mono text-white/20">
          <span>{currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Question card */}
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

      {/* Navigation */}
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
