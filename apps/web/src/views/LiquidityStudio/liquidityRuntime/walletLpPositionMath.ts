/**
 * Integer-safe LP share / underlying amount helpers for wallet-held positions.
 * Ownership identity: chainId + normalized pairAddress + walletAddress.
 */

export const OWNERSHIP_SOURCE_DIRECT_WALLET_LP = 'DIRECT_WALLET_LP' as const

export type WalletLpOwnershipSource = typeof OWNERSHIP_SOURCE_DIRECT_WALLET_LP

export function positionIdentityKey(chainId: number, pairAddress: string, walletAddress: string): string {
  return `${chainId}:${pairAddress.toLowerCase()}:${walletAddress.toLowerCase()}`
}

/** underlying = reserve * walletLp / totalSupply (floor division). */
export function computeUnderlyingAmount(reserveRaw: bigint, walletLpRaw: bigint, totalSupplyRaw: bigint): bigint {
  if (totalSupplyRaw <= BigInt(0) || walletLpRaw <= BigInt(0) || reserveRaw <= BigInt(0)) return BigInt(0)
  return (reserveRaw * walletLpRaw) / totalSupplyRaw
}

/** Integer-safe proportional amount used by the selected-position removal path. */
export function computeProRataAmountRaw(amountRaw: string, numeratorRaw: string, denominatorRaw: string): string {
  try {
    const amount = BigInt(amountRaw)
    const numerator = BigInt(numeratorRaw)
    const denominator = BigInt(denominatorRaw)
    if (amount <= BigInt(0) || numerator <= BigInt(0) || denominator <= BigInt(0)) return '0'
    return ((amount * numerator) / denominator).toString()
  } catch {
    return '0'
  }
}

export function resolveRemoveLiquidityMethod(opts: {
  tokenAIsNative: boolean
  tokenBIsNative: boolean
}): 'removeLiquidity' | 'removeLiquidityETH' {
  if (opts.tokenAIsNative || opts.tokenBIsNative) return 'removeLiquidityETH'
  return 'removeLiquidity'
}

export function shouldAutoSelectOwnedPosition(ownedCount: number): boolean {
  return ownedCount === 1
}

export function removeLiquidityDefaultPairIds(ownedCount: number): {
  currencyIdA?: string
  currencyIdB?: string
  forceNativeMarcoDefault: boolean
} {
  // Never force BNB/MARCO when scanning wallet LP ownership.
  if (ownedCount >= 0) {
    return { forceNativeMarcoDefault: false }
  }
  return { forceNativeMarcoDefault: false }
}
