'use client'

import { Question } from '@/lib/types'

const LIKERT_LABELS = ['Strongly\nDisagree', 'Disagree', 'Neutral', 'Agree', 'Strongly\nAgree']

interface QuizCardProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  selectedValue: number | null
  onSelect: (value: number) => void
  animClass: string
}

export default function QuizCard({
  question, questionNumber, totalQuestions, selectedValue, onSelect, animClass,
}: QuizCardProps) {
  return (
    <div className={`glass-card p-8 sm:p-12 max-w-2xl mx-auto ${animClass}`} style={{ transform: 'none' }}>
      <div className="flex items-center justify-between mb-8">
        <span className="font-mono text-xs text-white/30 tracking-wider">
          {questionNumber} / {totalQuestions}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/20">
          {question.axis.replace('_', ' // ')}
        </span>
      </div>

      <p className="text-lg sm:text-xl font-light leading-relaxed text-white/80 mb-12 min-h-[3.5rem]">
        {question.text}
      </p>

      <div className="flex items-center justify-center gap-3 sm:gap-5 mb-6">
        {[1, 2, 3, 4, 5].map(value => (
          <button
            key={value}
            onClick={() => onSelect(value)}
            className={`likert-option ${selectedValue === value ? 'selected' : ''}`}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="flex justify-between text-[10px] text-white/20 font-mono uppercase tracking-wider px-1">
        <span>disagree</span>
        <span>agree</span>
      </div>
    </div>
  )
}
