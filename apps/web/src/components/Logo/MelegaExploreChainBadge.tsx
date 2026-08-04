/**
 * Compact chain badge for Farm / Pool / Project cards (top-right).
 * Icon-first; accessible name uses full chain label. Never HelpIcon ambiguity.
 */
import Image from 'next/image'
import { memo } from 'react'
import styled from 'styled-components'

export const MELEGA_EXPLORE_CHAIN_LABELS: Record<number, string> = {
  56: 'BNB',
  97: 'BNB',
  1: 'Ethereum',
  137: 'Polygon',
  8453: 'Base',
  43114: 'Avalanche',
  42161: 'Arbitrum',
}

export const MELEGA_CHAIN_A11Y_LABELS: Record<number, string> = {
  56: 'BNB Smart Chain',
  97: 'BNB Smart Chain',
  1: 'Ethereum',
  137: 'Polygon',
  8453: 'Base',
  43114: 'Avalanche',
  42161: 'Arbitrum',
}

function chainLogoSrc(chainId: number): string {
  const logoId = chainId === 97 ? 56 : chainId
  if ([42161, 8453, 324, 10].includes(logoId)) return `/images/chains/${logoId}-1.png`
  return `/images/chains/${logoId}.png`
}

const Badge = styled.span<{ $compact?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ $compact }) => ($compact ? '0' : '5px')};
  height: ${({ $compact }) => ($compact ? '22px' : '22px')};
  width: ${({ $compact }) => ($compact ? '22px' : 'auto')};
  padding: ${({ $compact }) => ($compact ? '0' : '0 8px 0 6px')};
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.88);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  white-space: nowrap;
  flex-shrink: 0;
`

export const MelegaExploreChainBadge = memo(function MelegaExploreChainBadge({
  chainId,
  size = 12,
  /** Icon-only compact badge (default for card corners). */
  compact = true,
}: {
  chainId: number | null | undefined
  size?: number
  compact?: boolean
}) {
  const id = chainId ?? 56
  const short = MELEGA_EXPLORE_CHAIN_LABELS[id] ?? `Chain ${id}`
  const a11y = MELEGA_CHAIN_A11Y_LABELS[id] ?? short
  return (
    <Badge
      data-testid="melega-explore-chain-badge"
      data-chain-id={id}
      title={a11y}
      aria-label={a11y}
      $compact={compact}
    >
      <Image alt="" src={chainLogoSrc(id)} width={size} height={size} unoptimized />
      {compact ? null : short}
    </Badge>
  )
})

export default MelegaExploreChainBadge
