import React from 'react'

const localMarks: Record<string, string> = {
  WBNB: '/tokens/bnb.png',
  BNB: '/tokens/bnb.png',
  MARCO: '/tokens/marco.png',
}

export function TokenMark({ symbol, size = 28 }: { symbol: string; size?: number }) {
  const source = localMarks[symbol.toUpperCase()]
  if (source) return <img className="token-mark" src={source} alt="" width={size} height={size} />
  const stable = symbol.toUpperCase() === 'USDT' ? '₮' : symbol.toUpperCase() === 'USDC' ? '$' : symbol.slice(0, 1)
  return <span className={`token-mark token-mark-${symbol.toLowerCase()}`} style={{ width: size, height: size }} aria-hidden="true">{stable}</span>
}
