import { formatUnits } from '@ethersproject/units'
import { isRouteExecutable } from './executableRoutes'
import type { CanonicalMmnRouteState } from './routeAuthority'
import {
  LAYERZERO_SOLANA_V2_MAINNET_ALT,
  SOLANA_OFT_PROGRAM,
  SOLANA_OFT_STORE,
  assertCanonicalSolanaHubRequest,
  assertLiveSolanaStoreSnapshot,
  createSolanaOftSendParam,
  isEmptySolanaOptions,
  quoteExpiresAt,
  solanaQuoteIdentity,
  type SolanaOftProtocol,
} from './solanaOftProtocol'
import { MarcoBridgeError, type MarcoBridgeQuote } from './types'
import { formatBridgeAmount, isValidMarcoDestination, parseBridgeAmount } from './validation'
import { MARCO_WAVE1_NETWORKS } from './wave1Registry'

export type SolanaQuoteInput = {
  from: 'solana'
  to: 'bnb'
  amount: string
  sourceWallet: string
  destinationWallet: string
}

export async function readOnlySolanaMarcoBridgeQuote(
  input: SolanaQuoteInput,
  authority: CanonicalMmnRouteState,
  protocol: SolanaOftProtocol,
  quotedAt = new Date().toISOString(),
): Promise<MarcoBridgeQuote> {
  if (input.from !== 'solana' || input.to !== 'bnb') {
    throw new MarcoBridgeError('UNSUPPORTED_ROUTE', 'Only the certified Solana → BNB route is publicly activated.')
  }
  const solanaNetwork = authority.networks.find((network) => network.id === 'solana')
  if (solanaNetwork?.paused) {
    throw new MarcoBridgeError('SOLANA_PAUSED', 'Solana OFT store is paused.')
  }
  if (!isRouteExecutable('solana', 'bnb', authority)) {
    throw new MarcoBridgeError('PUBLIC_ACTIVATION_REQUIRED', 'Solana → BNB is not publicly executable.')
  }
  if (!isValidMarcoDestination(input.sourceWallet, 'solana')) {
    throw new MarcoBridgeError('QUOTE_FAILED', 'A valid Solana source wallet is required for a live quote.')
  }
  if (!isValidMarcoDestination(input.destinationWallet, 'evm')) {
    throw new MarcoBridgeError('INVALID_DESTINATION', 'Enter a valid BNB Smart Chain destination wallet.')
  }

  const { amountLD, toBytes32 } = assertCanonicalSolanaHubRequest(input)
  const parsed = parseBridgeAmount(input.amount, MARCO_WAVE1_NETWORKS.solana.tokenDecimals)
  if (!parsed) {
    throw new MarcoBridgeError('QUOTE_FAILED', 'Enter a dust-free MARCO amount with no more than 6 decimal places.')
  }

  const store = await protocol.fetchStore({ store: SOLANA_OFT_STORE, programId: SOLANA_OFT_PROGRAM })
  assertLiveSolanaStoreSnapshot(store)
  const owner = await protocol.fetchOwnerAccounts({ owner: input.sourceWallet, mint: store.tokenMint })
  if (BigInt(owner.tokenBalanceLd) < BigInt(amountLD)) {
    throw new MarcoBridgeError('INSUFFICIENT_MARCO', 'Insufficient MARCO balance.')
  }
  const enforced = await protocol.getEnforcedOptions({
    store: SOLANA_OFT_STORE,
    dstEid: 30102,
    programId: SOLANA_OFT_PROGRAM,
  })
  if (isEmptySolanaOptions(enforced.sendHex)) {
    throw new MarcoBridgeError('QUOTE_FAILED', 'Solana OFT enforced options for BNB are missing.')
  }

  const sendParam = createSolanaOftSendParam({
    amountLD,
    destinationWallet: input.destinationWallet,
    optionsHex: enforced.sendHex,
  })
  if (sendParam.dstEid !== 30102 || sendParam.toBytes32 !== toBytes32) {
    throw new MarcoBridgeError('CANONICAL_CONFIG_MISSING', 'Solana quote destination encoding is invalid.')
  }

  const quoted = await protocol.quote({
    payer: input.sourceWallet,
    tokenMint: store.tokenMint,
    tokenEscrow: store.tokenEscrow,
    sendParam,
    programId: SOLANA_OFT_PROGRAM,
    lookupTable: LAYERZERO_SOLANA_V2_MAINNET_ALT,
  })

  const expiresAt = quoteExpiresAt(quotedAt)
  const bindingBase = {
    from: 'solana' as const,
    to: 'bnb' as const,
    sourceWallet: input.sourceWallet,
    destinationWallet: input.destinationWallet,
    amount: parsed.normalized,
    amountLD,
    dstEid: sendParam.dstEid,
    toBytes32: sendParam.toBytes32,
    store: SOLANA_OFT_STORE,
    programId: SOLANA_OFT_PROGRAM,
    mint: store.tokenMint,
    escrow: store.tokenEscrow,
    tokenAccount: owner.tokenAccount,
    optionsHex: sendParam.optionsHex,
    nativeFeeWei: quoted.nativeFeeLamports,
    lookupTable: LAYERZERO_SOLANA_V2_MAINNET_ALT,
  }
  const binding = {
    ...bindingBase,
    expiresAt,
    identity: solanaQuoteIdentity(bindingBase),
  }

  return {
    amount: parsed.normalized,
    expectedReceive: formatBridgeAmount(quoted.amountReceivedLd, MARCO_WAVE1_NETWORKS.solana.tokenDecimals),
    nativeFee: formatUnits(quoted.nativeFeeLamports, 9),
    nativeFeeWei: quoted.nativeFeeLamports,
    nativeFeeSymbol: 'SOL',
    routeLabel: 'Solana → BNB',
    quotedAt,
    expiresAt,
    live: true,
    routePaused: false,
    publiclyActive: true,
    executionEnabled: true,
    binding,
  }
}
