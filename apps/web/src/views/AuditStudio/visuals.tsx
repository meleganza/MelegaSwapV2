import React from 'react'
import styled from 'styled-components'
import { ac, toneColor } from './auditTokens'

const Svg = styled.svg`
  display: block;
  margin: 0 auto;
`

const GaugeGlow = styled.circle`
  @media (prefers-reduced-motion: no-preference) {
    animation: gaugeBreath 5.5s ease-in-out infinite;
  }
  @keyframes gaugeBreath {
    0%,
    100% {
      opacity: 0.35;
    }
    50% {
      opacity: 0.7;
    }
  }
`

export function ScoreGauge({
  value,
  size = 220,
  animate = false,
}: {
  value: number
  size?: number
  /** Subtle CSS-only motion — score value remains factual/static. */
  animate?: boolean
}) {
  const clamped = Math.max(0, Math.min(100, value))
  const r = 84
  const c = 2 * Math.PI * r
  const filled = (clamped / 100) * c * 0.75
  const gap = c - filled
  const tone = clamped >= 85 ? 'ok' : clamped >= 60 ? 'warn' : 'bad'
  return (
    <Svg width={size} height={size} viewBox="0 0 220 220" aria-hidden data-testid="audit-score-gauge">
      <circle cx="110" cy="110" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
      {animate ? (
        <GaugeGlow cx="110" cy="110" r={r + 6} fill="none" stroke={ac.goldLine} strokeWidth="1.5" />
      ) : null}
      <circle
        cx="110"
        cy="110"
        r={r}
        fill="none"
        stroke={toneColor(tone)}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${gap}`}
        transform="rotate(135 110 110)"
      />
      <circle cx="110" cy="110" r="62" fill="rgba(0,0,0,0.35)" stroke={ac.goldLine} strokeWidth="1" />
    </Svg>
  )
}

export function DonutRing({
  segments,
  size = 120,
}: {
  segments: Array<{ value: number; color: string }>
  size?: number
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const r = 42
  const c = 2 * Math.PI * r
  let offset = 0
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" aria-hidden data-testid="audit-donut">
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
      {segments.map((seg, i) => {
        const len = (seg.value / total) * c
        const node = (
          <circle
            key={i}
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="12"
            strokeDasharray={`${len} ${c - len}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 60 60)"
          />
        )
        offset += len
        return node
      })}
      <circle cx="60" cy="60" r="28" fill="#0a0a0a" />
    </Svg>
  )
}

export function MiniSpark({ values, tone = 'ok' }: { values: number[]; tone?: 'ok' | 'warn' | 'bad' | 'mute' }) {
  if (values.length < 2) {
    return (
      <svg width="100%" height="28" viewBox="0 0 100 28" aria-hidden data-testid="audit-spark-stub">
        <path d="M2 18 Q 30 16 50 14 T 98 12" fill="none" stroke="rgba(221,185,47,0.28)" strokeWidth="1.4" />
      </svg>
    )
  }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100
      const y = 24 - ((v - min) / span) * 18
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg width="100%" height="28" viewBox="0 0 100 28" aria-hidden data-testid="audit-spark">
      <polyline points={pts} fill="none" stroke={toneColor(tone)} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

export function ThermometerBar({ value, tone }: { value: number | null; tone: 'ok' | 'warn' | 'bad' | 'mute' }) {
  const pct = value == null ? 0 : Math.max(0, Math.min(100, value))
  return (
    <div
      style={{
        height: 6,
        borderRadius: 999,
        background: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}
      data-testid="audit-thermo"
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          borderRadius: 999,
          background: toneColor(tone),
          transition: 'width 400ms ease',
        }}
      />
    </div>
  )
}

/** Simple activity heatmap — intensity from 0..1 cells (no invented events). */
export function Heatmap({ cells }: { cells: number[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(14, 1fr)',
        gap: 3,
      }}
      data-testid="audit-heatmap"
    >
      {cells.map((v, i) => (
        <div
          key={i}
          style={{
            aspectRatio: '1',
            borderRadius: 3,
            background: `rgba(221, 185, 47, ${0.08 + v * 0.55})`,
            border: '1px solid rgba(255,255,255,0.04)',
          }}
        />
      ))}
    </div>
  )
}
