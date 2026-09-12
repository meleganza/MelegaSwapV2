import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { hexlify, hexZeroPad } from '@ethersproject/bytes'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { PublicKey } from '@solana/web3.js'
import type { MarcoWalletFamily } from './types'

export const MARCO_SHARED_DECIMALS = 6 as const
export const MINIMUM_DUST_FREE_MARCO = '0.000001'

const DECIMAL_AMOUNT = /^(0|[1-9][0-9]*)(?:\.([0-9]+))?$/

export type ParsedBridgeAmount = {
  normalized: string
  amountLD: BigNumber
  tokenDecimals: 9 | 18
  sharedDecimals: 6
}

export function normalizeBridgeAmount(amount: string): string | null {
  const value = amount.trim()
  const match = DECIMAL_AMOUNT.exec(value)
  if (!match) return null
  const integer = match[1]
  const fraction = (match[2] ?? '').replace(/0+$/, '')
  if (fraction.length > MARCO_SHARED_DECIMALS) return null
  const normalized = fraction ? `${integer}.${fraction}` : integer
  return normalized === '0' ? null : normalized
}

export function parseBridgeAmount(amount: string, tokenDecimals: 9 | 18): ParsedBridgeAmount | null {
  const normalized = normalizeBridgeAmount(amount)
  if (!normalized) return null
  try {
    const amountLD = parseUnits(normalized, tokenDecimals)
    const dustUnit = BigNumber.from(10).pow(tokenDecimals - MARCO_SHARED_DECIMALS)
    if (amountLD.lt(dustUnit) || !amountLD.mod(dustUnit).isZero()) return null
    return { normalized, amountLD, tokenDecimals, sharedDecimals: MARCO_SHARED_DECIMALS }
  } catch {
    return null
  }
}

export function formatBridgeAmount(amountLD: BigNumber | string, tokenDecimals: 9 | 18): string {
  const formatted = formatUnits(amountLD, tokenDecimals)
  return formatted.includes('.') ? formatted.replace(/0+$/, '').replace(/\.$/, '') : formatted
}

export function isValidEvmDestination(address: string): boolean {
  try {
    getAddress(address.trim())
    return true
  } catch {
    return false
  }
}

export function parseSolanaDestination(address: string): PublicKey | null {
  try {
    const value = address.trim()
    const publicKey = new PublicKey(value)
    const decoded = publicKey.toBytes()
    if (decoded.length !== 32 || publicKey.toBase58() !== value) return null
    return publicKey
  } catch {
    return null
  }
}

export function isValidMarcoDestination(address: string, family: MarcoWalletFamily): boolean {
  return family === 'evm' ? isValidEvmDestination(address) : Boolean(parseSolanaDestination(address))
}

export function destinationToBytes32(address: string, family: MarcoWalletFamily): string {
  if (family === 'evm') return hexZeroPad(getAddress(address.trim()), 32)
  const publicKey = parseSolanaDestination(address)
  if (!publicKey) throw new Error('Invalid Solana destination.')
  return hexlify(publicKey.toBytes())
}

export function requiresExplicitDestination(source: MarcoWalletFamily, destination: MarcoWalletFamily): boolean {
  return source !== destination
}

/** Same-family routes may autofill the connected source wallet when the user has not typed a recipient. */
export function resolveDisplayedMarcoDestination(
  destination: string,
  sameFamily: boolean,
  sourceWallet: string,
): string {
  return destination || (sameFamily ? sourceWallet : '')
}

/**
 * Destination is editable whenever the source transfer is not in-flight.
 * Same-family autofill must not lock the field — that blocked the mobile keyboard.
 */
export function destinationWalletInputReadOnly(sourceLocked: boolean): boolean {
  return sourceLocked
}

/** Text-capable, address-safe attributes. Do not use numeric inputMode. */
export const DESTINATION_WALLET_TEXT_INPUT_ATTRS = {
  type: 'text',
  inputMode: 'text',
  autoComplete: 'off',
  autoCorrect: 'off',
  autoCapitalize: 'none',
  spellCheck: false,
} as const

export function validateBridgeAmount(amount: string, tokenDecimals: 9 | 18 = 18): boolean {
  return Boolean(parseBridgeAmount(amount, tokenDecimals))
}

export function decimalAmountGte(left: string, right: string, decimals: 9 | 18): boolean {
  try {
    return parseUnits(left.trim(), decimals).gte(parseUnits(right.trim(), decimals))
  } catch {
    return false
  }
}
