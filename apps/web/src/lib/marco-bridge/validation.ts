import type { MarcoWalletFamily } from './types'

const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/
const SOLANA_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

export function isValidMarcoDestination(address: string, family: MarcoWalletFamily): boolean {
  const value = address.trim()
  return family === 'evm' ? EVM_ADDRESS.test(value) : SOLANA_ADDRESS.test(value)
}

export function requiresExplicitDestination(source: MarcoWalletFamily, destination: MarcoWalletFamily): boolean {
  return source !== destination
}

export function validateBridgeAmount(amount: string): boolean {
  const parsed = Number(amount)
  return Number.isFinite(parsed) && parsed > 0
}
