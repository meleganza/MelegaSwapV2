/**
 * Create Token transaction construction + receipt verification helpers.
 * Success is derived only from the canonical factory receipt and post-deploy reads.
 */

import { ethers } from 'ethers'

import {
  CREATE_TOKEN_CANONICAL_DEPLOYMENT,
  CREATE_TOKEN_FACTORY_CHAIN_ID,
  CREATE_TOKEN_FEE_RECIPIENT,
} from 'config/constants/createTokenFactoryDeployment'
import { MELEGA_FIXED_SUPPLY_TOKEN_ABI, MELEGA_TOKEN_FACTORY_ABI } from './createTokenAbi'

export type CreateTokenUiState =
  | 'FACTORY_NOT_DEPLOYED'
  | 'FACTORY_CONFIGURATION_INVALID'
  | 'EXECUTION_UNAVAILABLE'
  | 'WRONG_CHAIN'
  | 'WALLET_DISCONNECTED'
  | 'INSUFFICIENT_CREATION_FEE'
  | 'READY'
  | 'SUBMITTING'
  | 'CONFIRMING'
  | 'TOKEN_CREATED'
  | 'TRANSACTION_FAILED'
  | 'VERIFICATION_PENDING'

export type CreateTokenDraft = {
  name: string
  symbol: string
  /** Human-readable supply (before decimals scaling). */
  supplyHuman: string
  decimals: number
  owner: string
  logoUrl?: string
  description?: string
  website?: string
  social?: string
  createProjectPage?: boolean
}

export type CreateTokenTxRequest = {
  chainId: number
  factoryAddress: string
  to: string
  data: string
  valueWei: string
  name: string
  symbol: string
  totalSupplyRaw: string
  decimals: number
  owner: string
  feeRecipient: string
  creationFeeWei: string
}

export type TokenCreatedEventParsed = {
  creator: string
  token: string
  name: string
  symbol: string
  totalSupply: string
  decimals: number
  owner: string
  creationFee: string
  timestamp: string
}

export type CreateTokenHandoffPayload = {
  chainId: number
  tokenAddress: string
  creatorWallet: string
  ownerWallet: string
  name: string
  symbol: string
  decimals: number
  totalSupply: string
  creationTx: string
  factoryAddress: string
  creationTimestamp: string
  verificationStatus: 'pending' | 'verified' | 'unknown'
}

const MAX_NAME = 64
const MAX_SYMBOL = 16
const MAX_SUPPLY_RAW = 10n ** 36n

export function resolveCreateTokenUiState(input: {
  factoryAddress: string | null
  creationFeeWei: string | null
  feeRecipient: string | null
  chainId: number | null
  account: string | null
  walletBalanceWei?: string | null
}): CreateTokenUiState {
  if (!input.factoryAddress) return 'FACTORY_NOT_DEPLOYED'
  if (
    !input.creationFeeWei ||
    !input.feeRecipient ||
    input.feeRecipient.toLowerCase() !== CREATE_TOKEN_FEE_RECIPIENT.toLowerCase()
  ) {
    return 'FACTORY_CONFIGURATION_INVALID'
  }
  if (input.chainId == null) return 'WALLET_DISCONNECTED'
  if (input.chainId !== CREATE_TOKEN_FACTORY_CHAIN_ID) return 'WRONG_CHAIN'
  if (!input.account) return 'WALLET_DISCONNECTED'
  if (input.walletBalanceWei != null) {
    try {
      if (BigInt(input.walletBalanceWei) < BigInt(input.creationFeeWei)) {
        return 'INSUFFICIENT_CREATION_FEE'
      }
    } catch {
      return 'FACTORY_CONFIGURATION_INVALID'
    }
  }
  return 'READY'
}

export function validateCreateTokenDraft(draft: CreateTokenDraft): string[] {
  const errors: string[] = []
  const name = (draft.name || '').trim()
  const symbol = (draft.symbol || '').trim()
  if (!name) errors.push('Token name is required')
  if (name.length > MAX_NAME) errors.push(`Token name must be ≤ ${MAX_NAME} bytes`)
  if (!symbol) errors.push('Token symbol is required')
  if (symbol.length > MAX_SYMBOL) errors.push(`Token symbol must be ≤ ${MAX_SYMBOL} characters`)
  if (!Number.isInteger(draft.decimals) || draft.decimals < 0 || draft.decimals > 18) {
    errors.push('Decimals must be an integer from 0 to 18')
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(draft.owner || '')) {
    errors.push('Owner wallet must be a valid 0x address')
  }
  try {
    const raw = humanSupplyToRaw(draft.supplyHuman, draft.decimals)
    if (raw <= 0n) errors.push('Total supply must be greater than zero')
    if (raw > MAX_SUPPLY_RAW) errors.push('Total supply exceeds factory maximum')
  } catch {
    errors.push('Total supply is invalid')
  }
  return errors
}

export function humanSupplyToRaw(supplyHuman: string, decimals: number): bigint {
  const cleaned = (supplyHuman || '').trim().replace(/_/g, '')
  if (!/^\d+(\.\d+)?$/.test(cleaned)) throw new Error('invalid supply')
  const [whole, frac = ''] = cleaned.split('.')
  if (frac.length > decimals) throw new Error('too many fractional digits')
  const padded = frac.padEnd(decimals, '0')
  const raw = BigInt(whole || '0') * 10n ** BigInt(decimals) + BigInt(padded || '0')
  return raw
}

/**
 * Encode createToken calldata without broadcasting.
 * Uses ethers-compatible ABI encoding via manual selector + abi-encoded args when viem/ethers available;
 * for unit tests we expose the structural request builder.
 */
export function buildCreateTokenRequest(input: {
  draft: CreateTokenDraft
  factoryAddress: string
  creationFeeWei: string
  encodedCalldata: string
}): CreateTokenTxRequest {
  const errors = validateCreateTokenDraft(input.draft)
  if (errors.length) throw new Error(errors.join('; '))
  if (!input.factoryAddress) throw new Error('FACTORY_NOT_DEPLOYED')
  const totalSupplyRaw = humanSupplyToRaw(input.draft.supplyHuman, input.draft.decimals).toString()
  return {
    chainId: CREATE_TOKEN_FACTORY_CHAIN_ID,
    factoryAddress: input.factoryAddress,
    to: input.factoryAddress,
    data: input.encodedCalldata,
    valueWei: input.creationFeeWei,
    name: input.draft.name.trim(),
    symbol: input.draft.symbol.trim(),
    totalSupplyRaw,
    decimals: input.draft.decimals,
    owner: input.draft.owner,
    feeRecipient: CREATE_TOKEN_FEE_RECIPIENT,
    creationFeeWei: input.creationFeeWei,
  }
}

export function buildReviewFacts(draft: CreateTokenDraft) {
  const dep = CREATE_TOKEN_CANONICAL_DEPLOYMENT
  return {
    network: 'BNB Smart Chain (56)',
    factoryAddress: dep.factoryAddress,
    tokenName: draft.name.trim(),
    symbol: draft.symbol.trim(),
    totalSupply: draft.supplyHuman,
    decimals: draft.decimals,
    owner: draft.owner,
    fixedSupply: true,
    mintability: 'No future minting',
    tax: 'None',
    blacklist: 'None',
    pause: 'None',
    creationFeeWei: dep.creationFeeWei,
    feeRecipient: dep.feeRecipient,
    estimatedGas: 'Measured at wallet confirmation',
  }
}

export function buildHandoffPayload(input: {
  event: TokenCreatedEventParsed
  creationTx: string
  factoryAddress: string
  verificationStatus?: CreateTokenHandoffPayload['verificationStatus']
}): CreateTokenHandoffPayload {
  return {
    chainId: CREATE_TOKEN_FACTORY_CHAIN_ID,
    tokenAddress: input.event.token,
    creatorWallet: input.event.creator,
    ownerWallet: input.event.owner,
    name: input.event.name,
    symbol: input.event.symbol,
    decimals: input.event.decimals,
    totalSupply: input.event.totalSupply,
    creationTx: input.creationTx,
    factoryAddress: input.factoryAddress,
    creationTimestamp: input.event.timestamp,
    verificationStatus: input.verificationStatus || 'pending',
  }
}

/** TokenCreated(address,address,string,string,uint256,uint8,address,uint256,uint256) */
export const TOKEN_CREATED_TOPIC0 = '0x916d6c0a2cf2249386bfca0950c2f07d7ea93b1371a949ca4ca7a9a3607a131c'

export function encodeCreateTokenCalldata(draft: CreateTokenDraft): string {
  const errors = validateCreateTokenDraft(draft)
  if (errors.length) throw new Error(errors.join('; '))
  const iface = new ethers.utils.Interface(MELEGA_TOKEN_FACTORY_ABI as any)
  return iface.encodeFunctionData('createToken', [
    draft.name.trim(),
    draft.symbol.trim(),
    humanSupplyToRaw(draft.supplyHuman, draft.decimals).toString(),
    draft.decimals,
    draft.owner,
  ])
}

export function parseTokenCreatedReceipt(
  receipt: ethers.providers.TransactionReceipt,
  expectedFactoryAddress: string,
): TokenCreatedEventParsed {
  if (receipt.status !== 1) throw new Error('Source transaction failed')
  if (!receipt.to || receipt.to.toLowerCase() !== expectedFactoryAddress.toLowerCase()) {
    throw new Error('Receipt does not target the canonical factory')
  }
  const iface = new ethers.utils.Interface(MELEGA_TOKEN_FACTORY_ABI as any)
  const log = receipt.logs.find(
    (candidate) =>
      candidate.address.toLowerCase() === expectedFactoryAddress.toLowerCase() &&
      candidate.topics[0]?.toLowerCase() === TOKEN_CREATED_TOPIC0,
  )
  if (!log) throw new Error('Canonical TokenCreated event not found')
  const parsed = iface.parseLog(log)
  return {
    creator: ethers.utils.getAddress(parsed.args.creator),
    token: ethers.utils.getAddress(parsed.args.token),
    name: String(parsed.args.name),
    symbol: String(parsed.args.symbol),
    totalSupply: parsed.args.totalSupply.toString(),
    decimals: Number(parsed.args.decimals),
    owner: ethers.utils.getAddress(parsed.args.owner),
    creationFee: parsed.args.creationFee.toString(),
    timestamp: parsed.args.timestamp.toString(),
  }
}

export function assertTokenCreatedEvent(input: {
  event: TokenCreatedEventParsed
  draft: CreateTokenDraft
  creator: string
  creationFeeWei: string
}): string[] {
  const { event, draft } = input
  const issues: string[] = []
  const expectedSupply = humanSupplyToRaw(draft.supplyHuman, draft.decimals).toString()
  if (event.creator.toLowerCase() !== input.creator.toLowerCase()) issues.push('Creator wallet mismatch')
  if (event.owner.toLowerCase() !== draft.owner.toLowerCase()) issues.push('Owner wallet mismatch')
  if (event.name !== draft.name.trim()) issues.push('Token name mismatch')
  if (event.symbol !== draft.symbol.trim()) issues.push('Token symbol mismatch')
  if (event.totalSupply !== expectedSupply) issues.push('Total supply mismatch')
  if (event.decimals !== draft.decimals) issues.push('Token decimals mismatch')
  if (event.creationFee !== input.creationFeeWei) issues.push('Creation fee mismatch')
  if (!ethers.utils.isAddress(event.token) || event.token === ethers.constants.AddressZero) {
    issues.push('Invalid deployed token address')
  }
  return issues
}

export async function verifyDeployedToken(input: {
  provider: ethers.providers.Provider
  event: TokenCreatedEventParsed
  factoryAddress: string
  draft: CreateTokenDraft
}): Promise<string[]> {
  const code = await input.provider.getCode(input.event.token)
  if (!code || code === '0x') return ['Created token has no deployed bytecode']
  const token = new ethers.Contract(input.event.token, MELEGA_FIXED_SUPPLY_TOKEN_ABI as any, input.provider)
  const [name, symbol, decimals, totalSupply, ownerBalance, factoryTokenBalance] = await Promise.all([
    token.name(),
    token.symbol(),
    token.decimals(),
    token.totalSupply(),
    token.balanceOf(input.event.owner),
    token.balanceOf(input.factoryAddress),
  ])
  const issues = assertPostCreateInvariants({
    name: String(name),
    symbol: String(symbol),
    decimals: Number(decimals),
    totalSupply: totalSupply.toString(),
    ownerBalance: ownerBalance.toString(),
    factoryTokenBalance: factoryTokenBalance.toString(),
  })
  if (String(name) !== input.draft.name.trim()) issues.push('On-chain token name mismatch')
  if (String(symbol) !== input.draft.symbol.trim()) issues.push('On-chain token symbol mismatch')
  if (Number(decimals) !== input.draft.decimals) issues.push('On-chain token decimals mismatch')
  if (totalSupply.toString() !== input.event.totalSupply) issues.push('On-chain total supply mismatch')
  return issues
}

export function assertPostCreateInvariants(input: {
  name: string
  symbol: string
  decimals: number
  totalSupply: string
  ownerBalance: string
  factoryTokenBalance: string
}): string[] {
  const issues: string[] = []
  if (input.ownerBalance !== input.totalSupply) {
    issues.push('Owner balance must equal total supply')
  }
  if (input.factoryTokenBalance !== '0') {
    issues.push('Factory must hold zero token supply')
  }
  if (!input.name || !input.symbol) issues.push('Missing name/symbol')
  if (input.decimals < 0 || input.decimals > 18) issues.push('Invalid decimals')
  return issues
}
