/**
 * RC skeleton / error polish helpers for monetization cards.
 */
import React from 'react'
import styled, { keyframes } from 'styled-components'
import { RC_COPY } from 'lib/monetization/copy'

const pulse = keyframes`
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.7; }
`

const SkeletonBlock = styled.div<{ $h?: number }>`
  height: ${({ $h }) => $h ?? 14}px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  animation: ${pulse} 1.2s ease-in-out infinite;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const ErrBox = styled.div`
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 120, 120, 0.35);
  background: rgba(60, 16, 16, 0.4);
  color: #ffb4b4;
  font-size: 12px;
  line-height: 1.4;
`

const Empty = styled.div`
  padding: 14px 12px;
  border-radius: 10px;
  border: 1px dashed rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.55);
  font-size: 12px;
  text-align: center;
`

export const MonetizationSkeleton: React.FC<{ rows?: number; testId?: string }> = ({
  rows = 3,
  testId = 'monetization-skeleton',
}) => (
  <div data-testid={testId} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    {Array.from({ length: rows }).map((_, i) => (
      // eslint-disable-next-line react/no-array-index-key
      <SkeletonBlock key={i} $h={i === 0 ? 20 : 14} />
    ))}
  </div>
)

export const MonetizationError: React.FC<{ message?: string; testId?: string }> = ({
  message,
  testId = 'monetization-error',
}) => (
  <ErrBox data-testid={testId} role="alert">
    {message || RC_COPY.errorRetry}
  </ErrBox>
)

export const MonetizationEmpty: React.FC<{ message?: string; testId?: string }> = ({
  message,
  testId = 'monetization-empty',
}) => <Empty data-testid={testId}>{message || RC_COPY.noResults}</Empty>

export default MonetizationSkeleton
