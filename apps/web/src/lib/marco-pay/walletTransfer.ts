import { type MarcoPayNetworkId } from './networks'
import { assertMarcoPayNetworkSettlement } from './settlement'

export const MARCO_PAY_CHAIN_ID = 56 as const
const ERC20_TRANSFER_SELECTOR = '0xa9059cbb'
const MARCO_AMOUNT_DECIMALS = 2

export type MarcoPayWalletTransfer = {
  family: 'evm'
  networkId: Exclude<MarcoPayNetworkId, 'solana'>
  chainId: number
  tokenAddress: string
  destination: string
  marcoAmountMinor: string
  tokenAmountRaw: string
  to: string
  data: string
  value: '0x0'
}

export type MarcoPaySolanaTransferTarget = {
  family: 'solana'
  networkId: 'solana'
  chainId: null
  tokenAddress: string
  destination: string
  marcoAmountMinor: string
  tokenAmountRaw: string
  approvalRequired: true
}

export type MarcoPayTransferTarget = MarcoPayWalletTransfer | MarcoPaySolanaTransferTarget

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
  networkId?: MarcoPayNetworkId | null
  tokenAddress?: string | null
}): MarcoPayTransferTarget {
  const selected = assertMarcoPayNetworkSettlement({
    networkId: input.networkId ?? (input.chainId == null ? 'bnb' : undefined),
    chainId: input.chainId ?? undefined,
    wallet: input.destinationWallet,
  })
  const destination = selected.treasuryWallet
  const expected = selected.tokenAddress
  if (!expected) throw new Error('MARCO_TOKEN_MISSING')
  const provided = input.tokenAddress?.trim()
  if (provided && provided.toLowerCase() !== expected.toLowerCase()) {
    throw new Error('MARCO_TOKEN_MISMATCH')
  }
  const tokenAmountRaw = marcoMinorToTokenRaw(input.marcoAmountMinor, selected.tokenDecimals)
  if (selected.walletFamily === 'solana') {
    return {
      family: 'solana',
      networkId: 'solana',
      chainId: null,
      tokenAddress: expected,
      destination,
      marcoAmountMinor: input.marcoAmountMinor.trim(),
      tokenAmountRaw,
      approvalRequired: true,
    }
  }
  if (selected.chainId == null) throw new Error('CHAIN_MISMATCH')
  return {
    family: 'evm',
    networkId: selected.id as Exclude<MarcoPayNetworkId, 'solana'>,
    chainId: selected.chainId,
    tokenAddress: expected,
    destination,
    marcoAmountMinor: input.marcoAmountMinor.trim(),
    tokenAmountRaw,
    to: expected,
    data: `${ERC20_TRANSFER_SELECTOR}${padAddress(destination)}${padUint256(tokenAmountRaw)}`,
    value: '0x0',
  }
}
