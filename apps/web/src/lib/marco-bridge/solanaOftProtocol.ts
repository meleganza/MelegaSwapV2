import { getAddress } from '@ethersproject/address'
import { hexZeroPad } from '@ethersproject/bytes'
import { SOLANA_OFT_ESCROW, SOLANA_OFT_PROGRAM_ID } from './solanaUnpause'
import {
  MarcoBridgeError,
  type MarcoBridgeNetworkId,
  type MarcoBridgeQuote,
  type MarcoBridgeQuoteBinding,
} from './types'
import { destinationToBytes32, parseBridgeAmount } from './validation'
import { MARCO_WAVE1_NETWORKS } from './wave1Registry'

/** Official LayerZero default ALT for Solana V2 mainnet (devtools sendSolana.ts). */
export const LAYERZERO_SOLANA_V2_MAINNET_ALT = 'AokBxha6VMLLgf97B5VYHEtqztamWmYERBmmFvjuTzJB'

export const SOLANA_OFT_PROGRAM = SOLANA_OFT_PROGRAM_ID
export const SOLANA_OFT_STORE = MARCO_WAVE1_NETWORKS.solana.endpointContract
export const SOLANA_OFT_MINT = MARCO_WAVE1_NETWORKS.solana.marcoIdentity
export const CANONICAL_SOLANA_BNB_DST_EID = MARCO_WAVE1_NETWORKS.bnb.layerZeroEid
export const SOLANA_TX_FEE_RESERVE_LAMPORTS = '500000'
export const SOLANA_SPL_TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'

export type SolanaOftStoreSnapshot = {
  store: string
  programId: string
  tokenMint: string
  tokenEscrow: string
  paused: boolean
  decimals: number
}

export type SolanaOftOwnerSnapshot = {
  owner: string
  tokenAccount: string
  tokenBalanceLd: string
  solLamports: string
}

export type SolanaOftSendParam = {
  dstEid: number
  toBytes32: string
  amountLd: string
  minAmountLd: string
  optionsHex: string
  payInLzToken: false
}

export type SolanaOftQuoteResult = {
  nativeFeeLamports: string
  amountSentLd: string
  amountReceivedLd: string
}

export type SolanaOftBuiltSend = {
  serializedTransaction: string
  feePayer: string
  tokenSource: string
  sendParam: SolanaOftSendParam
  nativeFeeLamports: string
  store: string
  programId: string
  mint: string
  escrow: string
  lookupTable: string
}

export type SolanaOftQuoteAccounts = {
  payer: string
  tokenMint: string
  tokenEscrow: string
  sendParam: SolanaOftSendParam
  programId: string
  lookupTable: string
}

export type SolanaOftSendAccounts = SolanaOftQuoteAccounts & {
  tokenSource: string
  nativeFeeLamports: string
}

export interface SolanaOftProtocol {
  fetchStore(input: { store: string; programId: string }): Promise<SolanaOftStoreSnapshot>
  fetchOwnerAccounts(input: { owner: string; mint: string }): Promise<SolanaOftOwnerSnapshot>
  getEnforcedOptions(input: { store: string; dstEid: number; programId: string }): Promise<{ sendHex: string }>
  quote(input: SolanaOftQuoteAccounts): Promise<SolanaOftQuoteResult>
  buildSend(input: SolanaOftSendAccounts): Promise<SolanaOftBuiltSend>
}

export type { MarcoBridgeQuoteBinding }

export function evmDestinationToBytes32(address: string): string {
  return hexZeroPad(getAddress(address.trim()), 32)
}

export function solanaQuoteIdentity(input: Omit<MarcoBridgeQuoteBinding, 'expiresAt' | 'identity'>): string {
  return [
    input.from,
    input.to,
    input.sourceWallet,
    input.destinationWallet,
    input.amount,
    input.amountLD,
    String(input.dstEid),
    input.toBytes32.toLowerCase(),
    input.store,
    input.programId,
    input.mint,
    input.escrow,
    input.tokenAccount,
    input.optionsHex.toLowerCase(),
    input.enforcedOptionsHex.toLowerCase(),
    input.nativeFeeWei,
    input.lookupTable,
  ].join('|')
}

const QUOTE_TTL_MS = 60_000

export function quoteExpiresAt(quotedAt: string, ttlMs = QUOTE_TTL_MS): string {
  const start = Date.parse(quotedAt)
  if (!Number.isFinite(start)) throw new MarcoBridgeError('QUOTE_FAILED', 'The live quote timestamp is invalid.')
  return new Date(start + ttlMs).toISOString()
}

export function assertCanonicalSolanaHubRequest(input: {
  from: MarcoBridgeNetworkId
  to: MarcoBridgeNetworkId
  amount: string
  sourceWallet: string
  destinationWallet: string
}): { amountLD: string; toBytes32: string } {
  if (input.from !== 'solana' || input.to !== 'bnb') {
    throw new MarcoBridgeError('UNSUPPORTED_ROUTE', 'Only the certified Solana → BNB route is publicly activated.')
  }
  const parsed = parseBridgeAmount(input.amount, MARCO_WAVE1_NETWORKS.solana.tokenDecimals)
  if (!parsed) {
    throw new MarcoBridgeError('QUOTE_FAILED', 'Enter a dust-free MARCO amount with no more than 6 decimal places.')
  }
  return {
    amountLD: parsed.amountLD.toString(),
    toBytes32: destinationToBytes32(input.destinationWallet, 'evm'),
  }
}

export function assertLiveSolanaStoreSnapshot(store: SolanaOftStoreSnapshot): void {
  if (store.store !== SOLANA_OFT_STORE) {
    throw new MarcoBridgeError(
      'CANONICAL_CONFIG_MISSING',
      'Solana OFT store identity does not match the certified store.',
    )
  }
  if (store.programId !== SOLANA_OFT_PROGRAM) {
    throw new MarcoBridgeError(
      'CANONICAL_CONFIG_MISSING',
      'Solana OFT program identity does not match the certified program.',
    )
  }
  if (store.tokenMint !== SOLANA_OFT_MINT) {
    throw new MarcoBridgeError(
      'CANONICAL_CONFIG_MISSING',
      'Solana OFT store tokenMint does not match the certified MARCO mint.',
    )
  }
  if (store.tokenEscrow !== SOLANA_OFT_ESCROW) {
    throw new MarcoBridgeError(
      'CANONICAL_CONFIG_MISSING',
      'Solana OFT store tokenEscrow does not match the certified escrow.',
    )
  }
  if (store.decimals !== MARCO_WAVE1_NETWORKS.solana.tokenDecimals) {
    throw new MarcoBridgeError('CANONICAL_CONFIG_MISSING', 'Solana MARCO mint decimals do not match the certified OFT.')
  }
  if (store.paused) {
    throw new MarcoBridgeError('SOLANA_PAUSED', 'Solana OFT store is paused.')
  }
}

export function createSolanaOftSendParam(input: {
  amountLD: string
  destinationWallet: string
  optionsHex: string
}): SolanaOftSendParam {
  const toBytes32 = evmDestinationToBytes32(input.destinationWallet)
  if (CANONICAL_SOLANA_BNB_DST_EID !== 30102) {
    throw new MarcoBridgeError('CANONICAL_CONFIG_MISSING', 'Destination EID must remain BNB 30102.')
  }
  return {
    dstEid: CANONICAL_SOLANA_BNB_DST_EID,
    toBytes32,
    amountLd: input.amountLD,
    minAmountLd: input.amountLD,
    optionsHex: input.optionsHex || '0x',
    payInLzToken: false,
  }
}

export function assertSendMatchesQuote(input: {
  quote: MarcoBridgeQuote
  request: {
    from: MarcoBridgeNetworkId
    to: MarcoBridgeNetworkId
    amount: string
    sourceWallet: string
    destinationWallet: string
  }
  send: Pick<
    SolanaOftBuiltSend,
    | 'feePayer'
    | 'tokenSource'
    | 'sendParam'
    | 'nativeFeeLamports'
    | 'store'
    | 'programId'
    | 'mint'
    | 'escrow'
    | 'lookupTable'
  >
}): void {
  const binding = input.quote.binding
  if (!binding?.identity) {
    throw new MarcoBridgeError('QUOTE_FAILED', 'The Solana quote is missing a bound send identity.')
  }
  const recomputed = solanaQuoteIdentity({
    from: input.request.from,
    to: input.request.to,
    sourceWallet: input.request.sourceWallet,
    destinationWallet: input.request.destinationWallet,
    amount: input.quote.amount,
    amountLD: binding.amountLD,
    dstEid: binding.dstEid,
    toBytes32: binding.toBytes32,
    store: binding.store,
    programId: binding.programId,
    mint: binding.mint,
    escrow: binding.escrow,
    tokenAccount: binding.tokenAccount,
    optionsHex: binding.optionsHex,
    enforcedOptionsHex: binding.enforcedOptionsHex,
    nativeFeeWei: input.quote.nativeFeeWei,
    lookupTable: binding.lookupTable,
  })
  if (recomputed !== binding.identity) {
    throw new MarcoBridgeError('QUOTE_FAILED', 'The live quote no longer matches this Solana → BNB send.')
  }
  if (binding.from !== 'solana' || binding.to !== 'bnb' || binding.dstEid !== 30102) {
    throw new MarcoBridgeError('UNSUPPORTED_ROUTE', 'The quote is not bound to Solana → BNB.')
  }
  if (binding.sourceWallet !== input.request.sourceWallet) {
    throw new MarcoBridgeError('WALLET_REQUIRED', 'Connected wallet does not match the quoted Solana source wallet.')
  }
  if (binding.destinationWallet.toLowerCase() !== input.request.destinationWallet.toLowerCase()) {
    throw new MarcoBridgeError('INVALID_DESTINATION', 'Destination wallet does not match the quoted BNB address.')
  }
  if (binding.amount !== input.request.amount && binding.amount !== input.quote.amount) {
    throw new MarcoBridgeError('QUOTE_FAILED', 'Quoted amount does not match the send amount.')
  }
  if (input.send.feePayer !== binding.sourceWallet) {
    throw new MarcoBridgeError('WALLET_REQUIRED', 'The Solana fee payer must remain the connected source wallet.')
  }
  if (input.send.tokenSource !== binding.tokenAccount) {
    throw new MarcoBridgeError('QUOTE_FAILED', 'Send token account does not match the quoted MARCO ATA.')
  }
  if (
    input.send.sendParam.dstEid !== binding.dstEid ||
    input.send.sendParam.toBytes32.toLowerCase() !== binding.toBytes32.toLowerCase() ||
    input.send.sendParam.amountLd !== binding.amountLD ||
    input.send.sendParam.minAmountLd !== binding.amountLD ||
    input.send.sendParam.optionsHex.toLowerCase() !== binding.optionsHex.toLowerCase() ||
    input.send.sendParam.payInLzToken !== false
  ) {
    throw new MarcoBridgeError('QUOTE_FAILED', 'Send parameters do not match the quoted Solana OFT send.')
  }
  if (
    input.send.nativeFeeLamports !== binding.nativeFeeWei ||
    input.send.nativeFeeLamports !== input.quote.nativeFeeWei
  ) {
    throw new MarcoBridgeError('QUOTE_FAILED', 'Send native fee does not match the quoted SOL fee.')
  }
  if (
    input.send.store !== binding.store ||
    input.send.programId !== binding.programId ||
    input.send.mint !== binding.mint ||
    input.send.escrow !== binding.escrow ||
    input.send.lookupTable !== binding.lookupTable
  ) {
    throw new MarcoBridgeError('QUOTE_FAILED', 'Send accounts do not match the quoted OFT store configuration.')
  }
}

export function requiredSolLamportsForBridge(nativeFeeLamports: string): string {
  return (BigInt(nativeFeeLamports) + BigInt(SOLANA_TX_FEE_RESERVE_LAMPORTS)).toString()
}

export function isEmptySolanaOptions(optionsHex: string): boolean {
  return !optionsHex || optionsHex === '0x' || optionsHex === '0X'
}
