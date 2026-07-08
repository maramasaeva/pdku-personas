'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { PUBLIC_QUESTIONS, FELLOW_QUESTIONS } from '@/lib/questions'
import { calculateScores } from '@/lib/scoring'
import QuizCard from '@/components/QuizCard'
import type { Question } from '@/lib/types'

function QuizInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isFellow = searchParams.get('fellow') !== null
  const fellowId = searchParams.get('fellow')

  const questions: Question[] = isFellow ? FELLOW_QUESTIONS : PUBLIC_QUESTIONS
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [animClass, setAnimClass] = useState('quiz-card-enter')
  const [displayName, setDisplayName] = useState('')
  const [showNamePrompt, setShowNamePrompt] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex) / questions.length) * 100

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

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (!showNamePrompt) {
        if (e.key >= '1' && e.key <= '5') {
          goToNext(currentQuestion.id, parseInt(e.key))
        }
        if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
          e.preventDefault()
          goToPrev()
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [showNamePrompt, currentQuestion, goToNext, goToPrev])

  async function handleSubmit() {
    setSubmitting(true)
    const scores = calculateScores(answers, questions)
    const resultId = crypto.randomUUID()

    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resultId,
          display_name: displayName || 'Anonymous',
          scores,
          answers,
          is_fellow: isFellow,
          fellow_id: fellowId,
        }),
      })
    } catch {
      // save locally as fallback
    }

    localStorage.setItem(`pdku-result-${resultId}`, JSON.stringify({
      id: resultId,
      display_name: displayName || 'Anonymous',
      scores,
      is_fellow: isFellow,
      fellow_id: fellowId,
    }))

    router.push(`/results/${resultId}`)
  }

  const allAnswered = questions.every(q => answers[q.id] != null)
  const isLastQuestion = currentIndex === questions.length - 1

  if (showNamePrompt) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="glass-card p-8 sm:p-12 max-w-md w-full fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="font-display font-bold text-3xl neon-cyan mb-2">
            {isFellow ? 'fellow check-in' : 'before we start'}
          </h2>
          <p className="text-sm text-white/40 mb-8">
            {isFellow
              ? `You're taking the extended quiz (${FELLOW_QUESTIONS.length} questions). Your results will be visible to other quiz takers.`
              : `${PUBLIC_QUESTIONS.length} questions. Takes about 5 minutes. You can use keyboard shortcuts (1-5) to go fast.`
            }
          </p>

          <label className="block text-xs font-mono uppercase tracking-wider text-white/30 mb-2">
            display name (optional)
          </label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="your name or handle"
            className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm font-light placeholder:text-white/20 focus:outline-none focus:border-neon-cyan/50 focus:shadow-[0_0_15px_rgba(31,196,255,0.1)] transition-all mb-6"
          />

          <button
            onClick={() => setShowNamePrompt(false)}
            className="glow-btn w-full !block text-center"
          >
            Start Quiz
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-20">
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
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="glow-btn glow-btn-pink"
          >
            {submitting ? 'Processing...' : 'See Results'}
          </button>
        )}
      </div>

      <p className="text-[10px] font-mono text-white/15 mt-6">
        press 1-5 to answer // ← to go back
      </p>
    </div>
  )
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="font-mono text-sm text-white/30">loading quiz...</div>
      </div>
    }>
      <QuizInner />
    </Suspense>
  )
}
