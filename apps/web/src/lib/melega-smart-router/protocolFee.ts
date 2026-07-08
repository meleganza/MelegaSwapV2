import { SWAP_PROTOCOL_FEE_BUY_MARCO_BPS, SWAP_PROTOCOL_FEE_STANDARD_BPS } from 'lib/d87-pricing'
import { isBuyMarcoByAddress } from './marcoRegistry'

export function resolveProtocolFeeBps(input: {
  chainId: number
  inputAddress?: string | null
  outputAddress?: string | null
}): { bps: number; buyMarcoIncentiveApplied: boolean } {
  const { chainId } = input
  const buyMarcoIncentiveApplied = isBuyMarcoByAddress(chainId, input.outputAddress)
  return {
    bps: buyMarcoIncentiveApplied ? SWAP_PROTOCOL_FEE_BUY_MARCO_BPS : SWAP_PROTOCOL_FEE_STANDARD_BPS,
    buyMarcoIncentiveApplied,
  }
}

export function computeProtocolFeeAmounts(grossAmountIn: string, protocolFeeBps: number): {
  feeAmount: string
  netAmountIn: string
} {
  const gross = Number(grossAmountIn)
  if (!Number.isFinite(gross) || gross <= 0) {
    return { feeAmount: '0', netAmountIn: grossAmountIn }
  }
  const fee = (gross * protocolFeeBps) / 10_000
  const net = gross - fee
  return {
    feeAmount: fee.toPrecision(6),
    netAmountIn: net.toPrecision(6),
  }
}
