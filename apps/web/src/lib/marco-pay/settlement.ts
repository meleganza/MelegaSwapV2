import { MELEGA_TREASURY_WALLET_ADDRESS } from 'config/dexEconomicAuthority'

export const MARCO_PAY_SETTLEMENT_WALLET = MELEGA_TREASURY_WALLET_ADDRESS

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const DEAD_ADDRESS = '0x000000000000000000000000000000000000dead'
const SENTINEL_ADDRESS = '0xde00000000000000000000000000000000000001'

const FORBIDDEN_SETTLEMENT_WALLETS = new Set([
  ZERO_ADDRESS,
  DEAD_ADDRESS,
  SENTINEL_ADDRESS,
])

function normalizeWallet(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function isHexAddress(value: string): boolean {
  return /^0x[a-f0-9]{40}$/.test(value)
}

export function isForbiddenSettlementWallet(value: string | null | undefined): boolean {
  const wallet = normalizeWallet(value)
  return !wallet || !isHexAddress(wallet) || FORBIDDEN_SETTLEMENT_WALLETS.has(wallet)
}

export function isCanonicalMarcoPaySettlementWallet(value: string | null | undefined): boolean {
  const wallet = normalizeWallet(value)
  return wallet === normalizeWallet(MARCO_PAY_SETTLEMENT_WALLET)
}

export function resolveMarcoPaySettlementWallet(): {
  ok: boolean
  wallet: string | null
  reason: string | null
} {
  const primary = process.env.MARCO_DEX_RECEIVING_WALLET?.trim() || ''
  const alias = process.env.MARCO_TREASURY_SETTLEMENT_WALLET?.trim() || ''
  if (primary && alias && normalizeWallet(primary) !== normalizeWallet(alias)) {
    return { ok: false, wallet: null, reason: 'SETTLEMENT_WALLET_CONFLICT' }
  }
  const wallet = primary || alias || MARCO_PAY_SETTLEMENT_WALLET
  if (isForbiddenSettlementWallet(wallet)) {
    return { ok: false, wallet: null, reason: 'SETTLEMENT_WALLET_INVALID' }
  }
  if (!isCanonicalMarcoPaySettlementWallet(wallet)) {
    return { ok: false, wallet: null, reason: 'SETTLEMENT_WALLET_NOT_TREASURY' }
  }
  return { ok: true, wallet: MARCO_PAY_SETTLEMENT_WALLET, reason: null }
}

export function assertMarcoPaySettlementWallet(): string {
  const resolved = resolveMarcoPaySettlementWallet()
  if (!resolved.ok || !resolved.wallet) {
    throw new Error(resolved.reason || 'SETTLEMENT_WALLET_INVALID')
  }
  return resolved.wallet
}

function parseDisplayedAmount(label: string | null | undefined): number | null {
  if (!label) return null
  const match = label.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/)
  if (!match) return null
  const value = Number(match[1])
  return Number.isFinite(value) ? value : null
}

export function usdCopiedToMarco(input: {
  usdMinor: string
  marcoMinor?: string | null
  usdLabel?: string | null
  marcoLabel?: string | null
}): boolean {
  const usdMinor = input.usdMinor.trim()
  const marcoMinor = input.marcoMinor?.trim() || ''
  if (usdMinor && marcoMinor && usdMinor === marcoMinor) return true
  const usd = parseDisplayedAmount(input.usdLabel) ?? (usdMinor && /^\d+$/.test(usdMinor) ? Number(usdMinor) / 100 : null)
  const marco = parseDisplayedAmount(input.marcoLabel)
  return usd != null && marco != null && usd === marco
}

export function assertLiveMarcoConversion(input: {
  usdMinor: string
  marcoMinor?: string | null
  usdLabel?: string | null
  marcoLabel?: string | null
}): void {
  if (usdCopiedToMarco(input)) {
    throw new Error('MARCO_CONVERSION_INVALID')
  }
}
