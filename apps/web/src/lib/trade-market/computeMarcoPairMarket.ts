export type MarcoPairMarketInput = {
  marcoReserve: number
  nativeReserve: number
  nativeUsd: number
  totalSupply?: number
}

export type MarcoPairMarket = {
  priceUsd: number
  liquidityUsd: number
  fdvUsd?: number
}

/**
 * Derive MARCO market values only from the selected MARCO/native AMM pair.
 * No unrelated token-price fallback is allowed here.
 */
export function computeMarcoPairMarket(input: MarcoPairMarketInput): MarcoPairMarket | undefined {
  const { marcoReserve, nativeReserve, nativeUsd, totalSupply } = input
  if (
    !Number.isFinite(marcoReserve) ||
    !Number.isFinite(nativeReserve) ||
    !Number.isFinite(nativeUsd) ||
    marcoReserve <= 0 ||
    nativeReserve <= 0 ||
    nativeUsd <= 0
  ) {
    return undefined
  }

  const priceUsd = (nativeReserve * nativeUsd) / marcoReserve
  const liquidityUsd = nativeReserve * nativeUsd * 2
  if (!Number.isFinite(priceUsd) || priceUsd <= 0 || !Number.isFinite(liquidityUsd) || liquidityUsd <= 0) {
    return undefined
  }

  const fdvUsd =
    totalSupply != null && Number.isFinite(totalSupply) && totalSupply > 0 ? priceUsd * totalSupply : undefined

  return {
    priceUsd,
    liquidityUsd,
    fdvUsd: fdvUsd != null && Number.isFinite(fdvUsd) && fdvUsd > 0 ? fdvUsd : undefined,
  }
}
