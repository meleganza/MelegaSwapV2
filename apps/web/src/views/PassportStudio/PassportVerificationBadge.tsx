import React from 'react'
import styled from 'styled-components'
import { passportOne } from './passportTokens'
import type { PassportVerificationState } from './passportHeroIdentityTypes'

const Badge = styled.div<{ $tone: 'gold' | 'warn' | 'neutral' }>`
  width: 112px;
  height: 44px;
  box-sizing: border-box;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 8px;
  flex-shrink: 0;
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'gold'
        ? 'rgba(221, 185, 47, 0.45)'
        : $tone === 'warn'
          ? 'rgba(244, 185, 66, 0.4)'
          : 'rgba(255, 255, 255, 0.12)'};
  background: ${({ $tone }) =>
    $tone === 'gold'
      ? 'rgba(221, 185, 47, 0.1)'
      : $tone === 'warn'
        ? 'rgba(244, 185, 66, 0.08)'
        : 'rgba(255, 255, 255, 0.03)'};
  color: ${({ $tone }) =>
    $tone === 'gold' ? passportOne.gold : $tone === 'warn' ? passportOne.warning : passportOne.secondary};
  font-size: 9px;
  line-height: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 767px) {
    max-width: 104px;
    width: auto;
    min-width: 0;
  }
`

const Icon = styled.span`
  display: inline-flex;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
`

function toneFor(state: PassportVerificationState): 'gold' | 'warn' | 'neutral' {
  if (state === 'verified') return 'gold'
  if (state === 'pending' || state === 'review_required') return 'warn'
  return 'neutral'
}

function IconFor({ state }: { state: PassportVerificationState }) {
  if (state === 'verified') {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path
          d="M7 1.2 11.5 3v3.4c0 2.7-1.8 4.5-4.5 5.4C4.3 10.9 2.5 9.1 2.5 6.4V3L7 1.2Z"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path d="M4.6 7.1 6.2 8.6 9.4 5.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    )
  }
  if (state === 'pending' || state === 'review_required') {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="5.2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M7 4.2v3.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="7" cy="9.6" r="0.7" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 5l4 4M9 5l-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export const PassportVerificationBadge: React.FC<{
  state: PassportVerificationState
  label: string
}> = ({ state, label }) => (
  <Badge
    $tone={toneFor(state)}
    data-testid="passport-verification-badge"
    data-verification-state={state}
    role="status"
    aria-label={`Verification status: ${label}`}
  >
    <Icon>
      <IconFor state={state} />
    </Icon>
    <span>{label}</span>
  </Badge>
)

export default PassportVerificationBadge
