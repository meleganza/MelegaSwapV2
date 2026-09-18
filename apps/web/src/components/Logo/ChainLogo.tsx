import Image from 'next/image'
import { HelpIcon } from '@pancakeswap/uikit'
import { isChainSupported } from 'utils/wagmi'
import { memo } from 'react'
import { ARC_CHAIN_ID } from 'lib/marco-bridge/arcChain'
import { ROBINHOOD_CHAIN_ID } from 'lib/marco-bridge/robinhoodChain'

/** Known Melega product chains — always render logo (even if wagmi CHAINS omits Avalanche). */
const KNOWN_CHAIN_LOGOS = new Set([
  1,
  56,
  97,
  137,
  8453,
  43114,
  42161,
  10,
  324,
  ROBINHOOD_CHAIN_ID, // 4663 — official Robinhood Chain feather, not a placeholder
  ARC_CHAIN_ID, // 5042 — official Circle Arc mark, never Ark
])

const DASHED_CHAIN_LOGO_IDS = [42161, 8453, 324, 10]

export function resolveChainLogoSrc(chainId: number): string | null {
  if (!(isChainSupported(chainId) || KNOWN_CHAIN_LOGOS.has(chainId))) {
    return null
  }
  const logoChainId = chainId === 97 ? 56 : chainId
  const fileName = DASHED_CHAIN_LOGO_IDS.includes(logoChainId) ? `${logoChainId}-1` : `${logoChainId}`
  return `/images/chains/${fileName}.png`
}

export const ChainLogo = memo(
  ({ chainId, width = 24, height = 24 }: { chainId: number; width?: number; height?: number }) => {
    const src = resolveChainLogoSrc(chainId)
    if (src) {
      return (
        <Image
          alt={`chain-${chainId}`}
          style={{ maxHeight: `${height}px` }}
          src={src}
          width={width}
          height={height}
          unoptimized
        />
      )
    }

    return <HelpIcon width={width} height={height} />
  },
)
