import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 130px;
  min-width: 130px;
  margin-top: 0;
  overflow: visible;
`

const Svg = styled.svg`
  width: 130px;
  height: 72px;
  margin-top: 0;
  overflow: visible;
  flex-shrink: 0;
`

const Needle = styled.g<{ $angle: number; $animate: boolean }>`
  transform-origin: 65px 58px;
  transform: rotate(${({ $angle, $animate }) => ($animate ? $angle : -90)}deg);
  transition: transform 700ms ease-out;
`

const Value = styled.div`
  margin-top: 8px;
  font-size: 30px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
`

const Label = styled.div`
  margin-top: 6px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #707070;
`

const Caption = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: #b3b3b3;
  text-align: center;
  line-height: 1.3;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const SkeletonArc = styled.div`
  width: 130px;
  height: 56px;
  margin-top: 0;
  border-radius: 130px 130px 0 0;
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
        <Label>Fear &amp; Greed</Label>
        <Caption>Indexing</Caption>
      </Shell>
    )
  }

  const angle = -90 + (numeric / 100) * 180
  const caption =
    classification ||
    (numeric <= 25 ? 'Extreme Fear' : numeric <= 50 ? 'Fear' : numeric <= 75 ? 'Greed' : 'Extreme Greed')

  return (
    <Shell data-fear-greed-gauge aria-label={`Fear and Greed Index ${numeric}`}>
      <Svg viewBox="0 0 130 72" aria-hidden>
        <path d="M 14 58 A 51 51 0 0 1 116 58" fill="none" stroke="#EF4444" strokeWidth="8" strokeLinecap="round" />
        <path
          d="M 14 58 A 51 51 0 0 1 116 58"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="32 128"
          strokeDashoffset="-32"
        />
        <path
          d="M 14 58 A 51 51 0 0 1 116 58"
          fill="none"
          stroke="#22C55E"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="32 128"
          strokeDashoffset="-64"
        />
        <path
          d="M 14 58 A 51 51 0 0 1 116 58"
          fill="none"
          stroke="#00E676"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="32 128"
          strokeDashoffset="-96"
        />
        <Needle $angle={angle} $animate={animated}>
          <line x1="65" y1="58" x2="65" y2="22" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        </Needle>
        <circle cx="65" cy="58" r="3" fill="#ffffff" />
      </Svg>
      <Value>{Math.round(numeric)}</Value>
      <Label>Fear &amp; Greed</Label>
      <Caption>{caption}</Caption>
    </Shell>
  )
}

export default FearGreedGauge
