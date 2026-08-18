import { FEATURED_PAYMENT_TOKENS } from 'lib/featured-placement/constants'
import { isCanonicalMarcoPaySettlementWallet, MARCO_PAY_SETTLEMENT_WALLET } from './settlement'

export const MARCO_PAY_CHAIN_ID = 56 as const
const ERC20_TRANSFER_SELECTOR = '0xa9059cbb'
const MARCO_AMOUNT_DECIMALS = 2

export type MarcoPayWalletTransfer = {
  chainId: typeof MARCO_PAY_CHAIN_ID
  tokenAddress: string
  destination: string
  marcoAmountMinor: string
  tokenAmountRaw: string
  to: string
  data: string
  value: '0x0'
}

function padAddress(addr: string): string {
  return addr.replace(/^0x/i, '').toLowerCase().padStart(64, '0')
}

function padUint256(raw: string): string {
  return BigInt(raw).toString(16).padStart(64, '0')
}

export function marcoMinorToTokenRaw(marcoAmountMinor: string, tokenDecimals = 18): string {
  if (!/^\d+$/.test(marcoAmountMinor) || marcoAmountMinor === '0') {
    throw new Error('MARCO_AMOUNT_INVALID')
  }
  if (tokenDecimals < MARCO_AMOUNT_DECIMALS) throw new Error('MARCO_DECIMALS_INVALID')
  const scale = 10n ** BigInt(tokenDecimals - MARCO_AMOUNT_DECIMALS)
  return (BigInt(marcoAmountMinor) * scale).toString()
}

export function buildMarcoPayWalletTransfer(input: {
  marcoAmountMinor: string
  destinationWallet?: string | null
  chainId?: number | null
  tokenAddress?: string | null
}): MarcoPayWalletTransfer {
  const destination = (input.destinationWallet || MARCO_PAY_SETTLEMENT_WALLET).trim()
  if (!isCanonicalMarcoPaySettlementWallet(destination)) {
    throw new Error('SETTLEMENT_WALLET_NOT_TREASURY')
  }
  if (input.chainId != null && input.chainId !== MARCO_PAY_CHAIN_ID) {
    throw new Error('CHAIN_MISMATCH')
  }
  const token = FEATURED_PAYMENT_TOKENS.MARCO
  const expected = token.address
  if (!expected) throw new Error('MARCO_TOKEN_MISSING')
  const provided = input.tokenAddress?.trim()
  if (provided && provided.toLowerCase() !== expected.toLowerCase()) {
    throw new Error('MARCO_TOKEN_MISMATCH')
  }
  const tokenAmountRaw = marcoMinorToTokenRaw(input.marcoAmountMinor, token.decimals)
  return {
    chainId: MARCO_PAY_CHAIN_ID,
    tokenAddress: expected,
    destination: MARCO_PAY_SETTLEMENT_WALLET,
    marcoAmountMinor: input.marcoAmountMinor.trim(),
    tokenAmountRaw,
    to: expected,
    data: `${ERC20_TRANSFER_SELECTOR}${padAddress(MARCO_PAY_SETTLEMENT_WALLET)}${padUint256(tokenAmountRaw)}`,
    value: '0x0',
  }
}
