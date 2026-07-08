'use client'

import { PersonalityScores, Axis, AXIS_LABELS, AXIS_COLORS } from '@/lib/types'

const AXES: Axis[] = [
  'openness', 'conscientiousness', 'extraversion',
  'agreeableness', 'stability', 'doomer_accel', 'chaos_order',
]

interface RadarChartProps {
  scores: PersonalityScores
  compareScores?: PersonalityScores
  compareName?: string
  size?: number
}

export default function RadarChart({ scores, compareScores, compareName, size = 300 }: RadarChartProps) {
  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.38
  const n = AXES.length

  function pointOnAxis(index: number, value: number): [number, number] {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2
    const r = (value / 100) * radius
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
  }

  function polygon(values: PersonalityScores): string {
    return AXES.map((axis, i) => {
      const [x, y] = pointOnAxis(i, values[axis])
      return `${x},${y}`
    }).join(' ')
  }

  const rings = [25, 50, 75, 100]

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-md mx-auto">
      {/* Grid rings */}
      {rings.map(ring => (
        <polygon
          key={ring}
          points={AXES.map((_, i) => {
            const [x, y] = pointOnAxis(i, ring)
            return `${x},${y}`
          }).join(' ')}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {AXES.map((_, i) => {
        const [x, y] = pointOnAxis(i, 100)
        return (
          <line
            key={i}
            x1={cx} y1={cy} x2={x} y2={y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        )
      })}

      {/* Compare polygon (if provided) */}
      {compareScores && (
        <polygon
          points={polygon(compareScores)}
          fill="rgba(255,31,184,0.08)"
          stroke="#ff1fb8"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
      )}

      {/* Main polygon */}
      <polygon
        points={polygon(scores)}
        fill="rgba(31,196,255,0.12)"
        stroke="#1fc4ff"
        strokeWidth="2"
      />

      {/* Data points */}
      {AXES.map((axis, i) => {
        const [x, y] = pointOnAxis(i, scores[axis])
        return (
          <circle
            key={axis}
            cx={x} cy={y} r="4"
            fill={AXIS_COLORS[axis]}
            stroke="#0a0a0f"
            strokeWidth="2"
          />
        )
      })}

      {/* Labels */}
      {AXES.map((axis, i) => {
        const [x, y] = pointOnAxis(i, 118)
        const labels = AXIS_LABELS[axis]
        return (
          <text
            key={axis}
            x={x} y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={AXIS_COLORS[axis]}
            fontSize="9"
            fontWeight="600"
            fontFamily="'Sora', sans-serif"
          >
            {labels[1]}
          </text>
        )
      })}

      {/* Legend */}
      {compareScores && compareName && (
        <g>
          <rect x={size - 120} y={size - 40} width="10" height="10" fill="rgba(31,196,255,0.5)" stroke="#1fc4ff" strokeWidth="1" rx="2" />
          <text x={size - 106} y={size - 31} fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="'Sora', sans-serif">You</text>
          <rect x={size - 120} y={size - 24} width="10" height="10" fill="rgba(255,31,184,0.3)" stroke="#ff1fb8" strokeWidth="1" rx="2" />
          <text x={size - 106} y={size - 15} fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="'Sora', sans-serif">{compareName}</text>
        </g>
      )}
    </svg>
  )
}
