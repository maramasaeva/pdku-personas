'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FELLOWS } from '@/lib/fellows'
import { FELLOW_QUESTIONS } from '@/lib/questions'
import { calculateScores } from '@/lib/scoring'
import QuizCard from '@/components/QuizCard'
import type { Fellow, Question } from '@/lib/types'

type Stage = 'select' | 'photo' | 'quiz' | 'submitting'

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

  // Quiz state
  const questions: Question[] = FELLOW_QUESTIONS
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [animClass, setAnimClass] = useState('quiz-card-enter')

  const currentQuestion = questions[currentIndex]
  const progress = (currentIndex / questions.length) * 100
  const allAnswered = questions.every(q => answers[q.id] != null)
  const isLastQuestion = currentIndex === questions.length - 1

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const url = URL.createObjectURL(file)
    setAvatarPreview(url)
  }

  async function handlePhotoConfirm() {
    if (avatarFile && selectedFellow) {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', avatarFile)
      formData.append('fellow_id', selectedFellow.id)
      try {
        await fetch('/api/upload-avatar', { method: 'POST', body: formData })
      } catch {
        // continue anyway, photo upload is optional
      }
      setUploading(false)
    }
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
            Select yourself from the grid below. You&apos;ll take the extended quiz ({FELLOW_QUESTIONS.length} questions) so we can map your personality.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {FELLOWS.map(f => (
            <button
              key={f.id}
              onClick={() => {
                setSelectedFellow(f)
                setStage('photo')
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

  // ── Stage: Photo review/upload ──
  if (stage === 'photo' && selectedFellow) {
    const displayPhoto = avatarPreview || (selectedFellow.photo_url && !failedImgs.has(selectedFellow.id) ? selectedFellow.photo_url : null)

    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="glass-card p-8 sm:p-12 max-w-md w-full text-center fade-in-up">
          <h2 className="font-display font-bold text-2xl neon-cyan mb-2">
            hey, {selectedFellow.name}
          </h2>
          <p className="text-sm text-white/40 mb-8">
            This is your current photo. You can upload a new one or keep it.
          </p>

          <div className="w-32 h-32 mx-auto rounded-xl overflow-hidden border-2 border-neon-cyan/30 bg-white/5 mb-6 relative group">
            {displayPhoto ? (
              <img src={displayPhoto} alt={selectedFellow.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white/15 font-mono">
                {selectedFellow.name.charAt(0)}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-mono text-white/70 uppercase tracking-wider"
            >
              {displayPhoto ? 'change' : 'upload'}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-mono uppercase tracking-wider text-neon-pink/60 hover:text-neon-pink transition-colors"
            >
              {displayPhoto ? 'upload a different photo' : 'upload a photo'}
            </button>

            <button
              onClick={handlePhotoConfirm}
              disabled={uploading}
              className="glow-btn w-full !block text-center mt-4"
            >
              {uploading ? 'Uploading...' : avatarFile ? 'Save & Start Quiz' : 'Start Quiz'}
            </button>

            <button
              onClick={() => { setStage('select'); setAvatarPreview(null); setAvatarFile(null) }}
              className="text-xs font-mono text-white/20 hover:text-white/40 transition-colors"
            >
              ← that&apos;s not me
            </button>
          </div>
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
