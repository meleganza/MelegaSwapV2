/**
 * Founder-facing LB amount formatting — never surface raw wei in product UI.
 */
import { formatUnits } from '@ethersproject/units'

const WEI_LIKE = /^\d+$/

/** Trim trailing zeros from a decimal string without scientific notation. */
function trimDecimal(value: string): string {
  if (!value.includes('.')) return value
  return value.replace(/\.?0+$/, '')
}

/**
 * Format an on-chain token amount for product display.
 * - Integer wei strings → human units (e.g. 1e18 → "1 MARCO")
 * - Already-human values → pass through with symbol
 */
export function formatLbTokenAmount(
  raw: string | null | undefined,
  decimals: number,
  symbol?: string | null,
): string | null {
  if (raw == null || raw === '') return null
  const trimmed = String(raw).trim()
  if (!trimmed || trimmed === '—') return trimmed === '—' ? trimmed : null

  let human = trimmed
  if (WEI_LIKE.test(trimmed) && trimmed.length > 10) {
    try {
      human = trimDecimal(formatUnits(trimmed, decimals))
    } catch {
      human = trimmed
    }
  } else if (
    WEI_LIKE.test(trimmed) &&
    BigInt(trimmed) >= BigInt(10) ** BigInt(Math.max(0, decimals - 2))
  ) {
    // Mid-size integers that look like wei at 18 decimals (e.g. 1e18)
    try {
      const asUnits = formatUnits(trimmed, decimals)
      if (Number(asUnits) > 0 && Number(asUnits) < 1e12) {
        human = trimDecimal(asUnits)
      }
    } catch {
      // keep human
    }
  }

  // Prefer compact founder display: 1 → 1.00 when whole, else trim
  const num = Number(human)
  if (Number.isFinite(num)) {
    if (num === 0) human = '0'
    else if (Number.isInteger(num) || Math.abs(num - Math.round(num)) < 1e-9) {
      human = String(Math.round(num))
    } else {
      human = trimDecimal(num.toFixed(6))
    }
  }

  const sym = symbol?.trim()
  return sym ? `${human} ${sym}` : human
}

/** True when a string looks like raw wei (long integer). */
export function looksLikeRawWei(value: string | null | undefined): boolean {
  if (!value) return false
  const t = value.trim()
  return WEI_LIKE.test(t) && t.length >= 16
}
