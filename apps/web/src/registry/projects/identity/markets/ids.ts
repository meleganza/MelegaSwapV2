import { fingerprint } from '../evidence/evidenceId'
import { normalizeEvmAddress, toCaip2ChainId } from '../caip'
import type { MarketType } from './schema'

/**
 * Canonical unordered AMM V2 pair key — lower address first to collapse token order.
 */
export function canonicalizeAmmV2PairKey(
  chainId: number,
  tokenA: string,
  tokenB: string,
): { token0: string; token1: string; pairKey: string } | null {
  const a = normalizeEvmAddress(tokenA)
  const b = normalizeEvmAddress(tokenB)
  if (!a || !b || a === b) return null
  const [token0, token1] = a < b ? [a, b] : [b, a]
  return {
    token0,
    token1,
    pairKey: `${toCaip2ChainId(chainId)}/amm-v2/${token0}/${token1}`,
  }
}

export function buildMarketId(parts: {
  projectId: string
  marketType: MarketType
  chainId: number
  venue: string
  pairOrPoolContract: string
  tokenA: string
  tokenB: string
}): string | null {
  const pair = canonicalizeAmmV2PairKey(parts.chainId, parts.tokenA, parts.tokenB)
  const contract = normalizeEvmAddress(parts.pairOrPoolContract)
  if (!pair || !contract) return null
  return `mkt_${fingerprint(
    [
      parts.projectId,
      parts.marketType,
      pair.pairKey,
      parts.venue,
      contract,
    ].join('\u001f'),
  )}`
}

export function buildDestinationId(parts: {
  projectId: string
  marketId: string | null
  chainId: number
  inputParam: string
  outputParam: string
  direction: 'BUY' | 'SELL' | 'OPEN'
}): string {
  return `dst_${fingerprint(
    [
      parts.projectId,
      parts.marketId ?? 'none',
      String(parts.chainId),
      parts.direction,
      parts.inputParam.toLowerCase(),
      parts.outputParam.toLowerCase(),
    ].join('\u001f'),
  )}`
}

export function buildMarketRevision(parts: string[]): string {
  return fingerprint(parts.slice().sort().join('|'))
}

/** Extract 0x address from token://chain/address or CAIP-19 / UAI-ish refs. */
export function addressFromAssetRef(ref: string | null | undefined): string | null {
  if (!ref) return null
  const trimmed = ref.trim()
  const tokenMatch = /^token:\/\/(\d+)\/(0x[a-fA-F0-9]{40})$/i.exec(trimmed)
  if (tokenMatch) return normalizeEvmAddress(tokenMatch[2])
  const caip19 = /^eip155:\d+\/(?:erc20:)?(0x[a-fA-F0-9]{40})$/i.exec(trimmed)
  if (caip19) return normalizeEvmAddress(caip19[1])
  const uai = /\/(\d+)\/(0x[a-fA-F0-9]{40})@/i.exec(trimmed)
  if (uai) return normalizeEvmAddress(uai[2])
  return normalizeEvmAddress(trimmed)
}
