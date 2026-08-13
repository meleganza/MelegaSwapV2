import Image from 'next/image'
import { HelpIcon } from '@pancakeswap/uikit'
import { isChainSupported } from 'utils/wagmi'
import { memo } from 'react'

/** Known Melega product chains — always render logo (even if wagmi CHAINS omits Avalanche). */
const KNOWN_CHAIN_LOGOS = new Set([1, 56, 97, 137, 8453, 43114, 42161, 10, 324])

export const ChainLogo = memo(
  ({ chainId, width = 24, height = 24 }: { chainId: number; width?: number; height?: number }) => {
    if (isChainSupported(chainId) || KNOWN_CHAIN_LOGOS.has(chainId)) {
      const logoChainId = chainId === 97 ? 56 : chainId
      return (
        <Image
          alt={`chain-${chainId}`}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            maxWidth: `${width}px`,
            maxHeight: `${height}px`,
            objectFit: 'contain',
            borderRadius: '50%',
            flexShrink: 0,
          }}
          src={`/images/chains/${[42161, 8453, 324, 10].includes(logoChainId) ? `${logoChainId}-1` : logoChainId}.png`}
          width={width}
          height={height}
          unoptimized
        />
      )
    }

    return <HelpIcon width={width} height={height} />
  },
)
