import { resolveMerchantPayRail } from './merchantRails'

export const MARCO_PAY_CHAIN_ID = 56 as const
const ERC20_TRANSFER_SELECTOR = '0xa9059cbb'
const MARCO_AMOUNT_DECIMALS = 2

export type MarcoPayWalletTransfer = {
  chainId: number
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
  const scale = BigInt('1' + '0'.repeat(tokenDecimals - MARCO_AMOUNT_DECIMALS))
  return (BigInt(marcoAmountMinor) * scale).toString()
}

export function buildMarcoPayWalletTransfer(input: {
  marcoAmountMinor: string
  destinationWallet?: string | null
  chainId?: number | null
  tokenAddress?: string | null
}): MarcoPayWalletTransfer {
  const rail = resolveMerchantPayRail({ chainId: input.chainId ?? MARCO_PAY_CHAIN_ID })
  if (rail.family !== 'evm' || rail.chainId == null || !rail.settlementWallet) throw new Error('CHAIN_NOT_EXECUTABLE')
  const destination = (input.destinationWallet || rail.settlementWallet).trim()
  if (destination.toLowerCase() !== rail.settlementWallet.toLowerCase()) {
    throw new Error('SETTLEMENT_WALLET_NOT_TREASURY')
  }
  const expected = rail.token
  if (!expected) throw new Error('MARCO_TOKEN_MISSING')
  const provided = input.tokenAddress?.trim()
  if (provided && provided.toLowerCase() !== expected.toLowerCase()) {
    throw new Error('MARCO_TOKEN_MISMATCH')
  }
  const tokenAmountRaw = marcoMinorToTokenRaw(input.marcoAmountMinor, rail.tokenDecimals)
  return {
    chainId: rail.chainId,
    tokenAddress: expected,
    destination: rail.settlementWallet,
    marcoAmountMinor: input.marcoAmountMinor.trim(),
    tokenAmountRaw,
    to: expected,
    data: `${ERC20_TRANSFER_SELECTOR}${padAddress(rail.settlementWallet)}${padUint256(tokenAmountRaw)}`,
    value: '0x0',
  }
}
