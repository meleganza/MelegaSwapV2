import React from 'react'
import { getAddress } from '@ethersproject/address'
import { getTokenLogoURLByAddress } from '../../web/src/utils/getTokenLogoURL'

const localMarks: Record<string, string> = {
  WBNB: '/tokens/bnb.png',
  BNB: '/tokens/bnb.png',
  MARCO: '/tokens/marco.png',
}

export function TokenMark({ symbol, address, logoURI, chainId = 56, size = 28, allowSymbolMark = true }: { symbol: string; address?: string; logoURI?: string; chainId?: number; size?: number; allowSymbolMark?: boolean }) {
  const identity = `${chainId}:${address ?? symbol}`
  const [failure, setFailure] = React.useState({ identity: '', index: 0 })
  const checksum = address && /^0x[0-9a-f]{40}$/i.test(address) ? getAddress(address.toLowerCase()) : null
  const canonical = chainId === 56 && checksum && ['0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', '0x963556de0eb8138e97a85f0a86ee0acd159d210b'].includes(checksum.toLowerCase())
  const sources = [
    (canonical || (!address && allowSymbolMark)) && localMarks[symbol.toUpperCase()],
    checksum && `https://www.melega.finance/images/${chainId}/tokens/${checksum}.png`,
    checksum && logoURI,
    checksum && getTokenLogoURLByAddress(checksum, chainId),
  ].filter(Boolean) as string[]
  const index = failure.identity === identity ? failure.index : 0
  const source = sources[index]
  if (source) return <img key={source} className="token-mark" src={source} alt="" width={size} height={size} loading="lazy" onError={() => setFailure({ identity, index: index + 1 })} />
  return <span className={`token-mark token-mark-${symbol.toLowerCase()}`} style={{ width: size, height: size }} aria-hidden="true">{symbol.slice(0, 1)}</span>
}
