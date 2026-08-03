/**
 * Explicit chain badge for Farm / Pool explore cards.
 * Always maps known chainIds to label + icon — never HelpIcon ambiguity.
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

function chainLogoSrc(chainId: number): string {
  const logoId = chainId === 97 ? 56 : chainId
  if ([42161, 8453, 324, 10].includes(logoId)) return `/images/chains/${logoId}-1.png`
  return `/images/chains/${logoId}.png`
}

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 22px;
  padding: 0 8px 0 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.88);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  white-space: nowrap;
`

export const MelegaExploreChainBadge = memo(function MelegaExploreChainBadge({
  chainId,
  size = 12,
}: {
  chainId: number | null | undefined
  size?: number
}) {
  const id = chainId ?? 56
  const label = MELEGA_EXPLORE_CHAIN_LABELS[id] ?? `Chain ${id}`
  return (
    <Badge data-testid="melega-explore-chain-badge" data-chain-id={id} aria-label={`Chain ${label}`}>
      <Image alt="" src={chainLogoSrc(id)} width={size} height={size} unoptimized />
      {label}
    </Badge>
  )
})

export default MelegaExploreChainBadge
