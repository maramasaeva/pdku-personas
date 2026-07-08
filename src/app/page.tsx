'use client'

import Link from 'next/link'
import { AXIS_LABELS, AXIS_COLORS, Axis } from '@/lib/types'
import { PUBLIC_QUESTIONS } from '@/lib/questions'

const AXES: Axis[] = [
  'openness', 'conscientiousness', 'extraversion',
  'agreeableness', 'stability', 'doomer_accel', 'chaos_order',
]

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center text-center py-28">
        <div className="font-mono text-xs tracking-[0.25em] uppercase text-neon-teal/60 mb-8">
          plzdontkillus // berkeley, july 2026
        </div>

        <h1 className="font-display font-bold text-[clamp(3.5rem,12vw,10rem)] leading-[0.95] tracking-tighter mb-8">
          <span className="neon-cyan">pdku</span>
          <span className="neon-pink">:</span>
          <br className="sm:hidden" />
          <span className="neon-purple">personas</span>
        </h1>

        <p className="text-[clamp(1rem,2vw,1.3rem)] font-light max-w-lg leading-relaxed text-white/50 mb-6">
          {PUBLIC_QUESTIONS.length} questions. 7 axes. One truth.
          <br />
          Find out which <strong className="font-semibold text-neon-cyan">PDKU fellow</strong> you are.
        </p>

        <div className="font-mono text-xs tracking-[0.15em] uppercase text-neon-green/50 mb-12">
          big five <span className="mx-3 opacity-30">/</span>
          doomer ↔ accel <span className="mx-3 opacity-30">/</span>
          chaos ↔ order
        </div>

        <div className="flex gap-5 flex-wrap justify-center">
          <Link href="/quiz" className="glow-btn text-lg !py-5 !px-14">
            Take the Quiz
          </Link>
          <Link href="/quiz/fellow" className="glow-btn glow-btn-pink text-lg !py-5 !px-14">
            I&apos;m a Fellow
          </Link>
        </div>
      </section>

      <div className="neon-divider" />

      {/* Axes */}
      <section className="py-24">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-white/30 mb-4">
          The Axes
        </div>
        <h2 className="font-display font-bold text-[clamp(2rem,5vw,3.5rem)] leading-tight neon-cyan mb-3">
          7 dimensions of you
        </h2>
        <p className="text-sm text-white/40 max-w-md mb-14 leading-relaxed">
          Big Five personality traits plus two axes that matter at PDKU.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {AXES.map(axis => {
            const [low, high] = AXIS_LABELS[axis]
            return (
              <div key={axis} className="glass-card p-6" style={{ borderColor: `${AXIS_COLORS[axis]}15` }}>
                <div
                  className="text-xs font-mono font-bold uppercase tracking-[0.2em] mb-3"
                  style={{ color: AXIS_COLORS[axis] }}
                >
                  {axis.replace('_', ' // ')}
                </div>
                <div className="flex items-center justify-between text-sm text-white/40">
                  <span>{low}</span>
                  <div className="flex-1 mx-3 h-[2px] rounded" style={{ background: `linear-gradient(90deg, ${AXIS_COLORS[axis]}40, ${AXIS_COLORS[axis]})` }} />
                  <span>{high}</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div className="neon-divider" />

      {/* How it works */}
      <section className="py-24">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-white/30 mb-4">
          How It Works
        </div>
        <h2 className="font-display font-bold text-[clamp(2rem,5vw,3.5rem)] leading-tight neon-yellow mb-12">
          three steps
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          {[
            { title: 'Answer honestly', desc: 'Rate 49 statements from strongly disagree to strongly agree. No right answers, just you.' },
            { title: 'See your shape', desc: 'Get your 7-axis radar chart and personality breakdown. Every person has a unique fingerprint.' },
            { title: 'Find your match', desc: 'See which PDKU fellow you\'re most similar to and compare your personality shapes.' },
          ].map((step, i) => (
            <div key={i} className="glass-card p-7 pt-14 relative mt-4">
              <div className="absolute -top-5 left-7 font-mono font-extrabold text-4xl neon-cyan">
                {i + 1}
              </div>
              <h3 className="font-bold text-base mb-3">{step.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="neon-divider" />

      {/* CTA */}
      <section className="py-28 text-center">
        <h2 className="font-display font-bold text-[clamp(2.5rem,6vw,5rem)] leading-tight neon-pink mb-8">
          who are you?
        </h2>
        <div className="flex gap-5 flex-wrap justify-center">
          <Link href="/quiz" className="glow-btn text-lg !py-5 !px-14">
            Find Out
          </Link>
          <Link href="/quiz/fellow" className="glow-btn glow-btn-pink">
            I&apos;m a PDKU Fellow
          </Link>
        </div>
      </section>
    </div>
  )
}
