import React, { useEffect, useState } from 'react'
import styled, { css, keyframes } from 'styled-components'

const needleEnter = keyframes`
  from { transform: rotate(-90deg); }
  to { transform: rotate(var(--needle-angle, 0deg)); }
`

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 118px;
  min-width: 118px;
`

const Svg = styled.svg`
  width: 118px;
  height: 76px;
  overflow: visible;
`

const Needle = styled.g<{ $angle: number; $animate: boolean }>`
  transform-origin: 59px 64px;
  transform: rotate(${({ $angle, $animate }) => ($animate ? $angle : -90)}deg);
  ${({ $animate }) =>
    $animate &&
    css`
      animation: ${needleEnter} 700ms ease-out forwards;
      --needle-angle: ${({ $angle }: { $angle: number }) => `${$angle}deg`};
    `}
`

const Value = styled.div`
  margin-top: 4px;
  font-size: 32px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
`

const Label = styled.div`
  margin-top: 2px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #707070;
`

const Caption = styled.div`
  margin-top: 2px;
  font-size: 11px;
  color: #9e9e9e;
  text-align: center;
  line-height: 1.25;
`

const SkeletonArc = styled.div`
  width: 118px;
  height: 59px;
  border-radius: 118px 118px 0 0;
  border: 8px solid rgba(255, 255, 255, 0.06);
  border-bottom: none;
  box-sizing: border-box;
  opacity: 0.5;
`

export interface FearGreedGaugeProps {
  value?: string
  classification?: string
}

export const FearGreedGauge: React.FC<FearGreedGaugeProps> = ({ value, classification }) => {
  const [animated, setAnimated] = useState(false)
  const numeric = value != null ? Number(value) : NaN
  const hasValue = Number.isFinite(numeric) && numeric >= 0 && numeric <= 100

  useEffect(() => {
    if (!hasValue) return undefined
    const t = window.setTimeout(() => setAnimated(true), 50)
    return () => window.clearTimeout(t)
  }, [hasValue, value])

  if (!hasValue) {
    return (
      <Shell data-fear-greed-gauge aria-label="Fear and Greed Index indexing">
        <SkeletonArc />
        <Label>Fear & Greed</Label>
        <Caption>Indexing</Caption>
      </Shell>
    )
  }

  const angle = -90 + (numeric / 100) * 180
  const caption =
    classification ||
    (numeric <= 25 ? 'Extreme Fear' : numeric <= 50 ? 'Fear' : numeric <= 75 ? 'Greed' : 'Extreme Greed')

  return (
    <Shell data-fear-greed-gauge aria-label={hasValue ? `Fear and Greed Index ${numeric}` : 'Fear and Greed Index indexing'}>
      <Svg viewBox="0 0 118 76" aria-hidden>
        <path d="M 12 64 A 47 47 0 0 1 106 64" fill="none" stroke="#EF4444" strokeWidth="8" strokeLinecap="round" />
        <path d="M 12 64 A 47 47 0 0 1 106 64" fill="none" stroke="#D4AF37" strokeWidth="8" strokeLinecap="round" strokeDasharray="29.5 118" strokeDashoffset="-29.5" />
        <path d="M 12 64 A 47 47 0 0 1 106 64" fill="none" stroke="#22C55E" strokeWidth="8" strokeLinecap="round" strokeDasharray="29.5 118" strokeDashoffset="-59" />
        <path d="M 12 64 A 47 47 0 0 1 106 64" fill="none" stroke="#00E676" strokeWidth="8" strokeLinecap="round" strokeDasharray="29.5 118" strokeDashoffset="-88.5" />
        <Needle $angle={angle} $animate={animated}>
          <line x1="59" y1="64" x2="59" y2="26" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        </Needle>
        <circle cx="59" cy="64" r="4" fill="#ffffff" />
      </Svg>
      <Value>{Math.round(numeric)}</Value>
      <Label>Fear & Greed</Label>
      <Caption>{caption}</Caption>
    </Shell>
  )
}

export default FearGreedGauge
