import React from 'react'
import { getTokenLogoURLByAddress } from '../../web/src/utils/getTokenLogoURL'

const localMarks: Record<string, string> = {
  WBNB: '/tokens/bnb.png',
  BNB: '/tokens/bnb.png',
  MARCO: '/tokens/marco.png',
}

export function TokenMark({ symbol, address, size = 28 }: { symbol: string; address?: string; size?: number }) {
  const [remoteFailed, setRemoteFailed] = React.useState(false)
  const remote = address ? getTokenLogoURLByAddress(address, 56) : null
  const source = !remoteFailed && remote ? remote : localMarks[symbol.toUpperCase()]
  if (source) return <img className="token-mark" src={source} alt="" width={size} height={size} onError={() => setRemoteFailed(true)} />
  return <span className={`token-mark token-mark-${symbol.toLowerCase()}`} style={{ width: size, height: size }} aria-hidden="true">{symbol.slice(0, 1)}</span>
}
