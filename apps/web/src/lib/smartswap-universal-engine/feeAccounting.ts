/**
 * Integer-safe protocol fee. Floor division never charges above sealed bps.
 */

export function protocolFeeFloor(amountRaw: string, feeBps: number): { feeRaw: string; netRaw: string; dustRaw: '0' } {
  if (!/^\d+$/.test(amountRaw)) throw new Error('INVALID_FEE_BASE_AMOUNT')
  if (feeBps < 0 || feeBps > 10_000) throw new Error('INVALID_FEE_BPS')
  const amount = BigInt(amountRaw)
  const fee = (amount * BigInt(feeBps)) / 10_000n
  return { feeRaw: fee.toString(), netRaw: (amount - fee).toString(), dustRaw: '0' }
}

/** Sealed fee is the authorized ceiling. Floor remainder stays in venue input, not treasury. */
export const FEE_ROUNDING = {
  mode: 'FLOOR' as const,
  neverChargeAboveSealedBps: true,
  dust: 'Unrounded remainder remains in net venue input (user swap), never added to protocol fee.',
}

export const DECIMAL_CASES = [6, 8, 9, 18] as const

export function unitsForDecimals(display: string, decimals: number): string {
  const [whole, frac = ''] = display.split('.')
  const padded = (frac + '0'.repeat(decimals)).slice(0, decimals)
  return (BigInt(whole) * 10n ** BigInt(decimals) + BigInt(padded || '0')).toString()
}
