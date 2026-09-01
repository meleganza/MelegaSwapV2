import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchCanonicalRouteAuthority } from 'lib/marco-bridge/routeAuthority'
import { createOfficialSolanaOftProtocol, simulateOfficialSolanaSend } from 'lib/marco-bridge/solanaOftSdk'
import {
  LAYERZERO_SOLANA_V2_MAINNET_ALT,
  SOLANA_OFT_PROGRAM,
  assertSendMatchesQuote,
  type SolanaOftProtocol,
} from 'lib/marco-bridge/solanaOftProtocol'
import { assertFreshCanonicalSolanaQuote, readOnlySolanaMarcoBridgeQuote } from 'lib/marco-bridge/solanaQuote'
import { buildMarcoBridgeTransactions } from 'lib/marco-bridge/transactionBuilder'
import { MarcoBridgeError, type MarcoBridgeNetworkId, type MarcoBridgeQuote } from 'lib/marco-bridge/types'
import { MARCO_WAVE1_NETWORKS } from 'lib/marco-bridge/wave1Registry'

const isNetworkId = (value: unknown): value is MarcoBridgeNetworkId =>
  typeof value === 'string' && Object.prototype.hasOwnProperty.call(MARCO_WAVE1_NETWORKS, value)

export type BuildDependencies = {
  fetchAuthority: typeof fetchCanonicalRouteAuthority
  createSolanaProtocol: () => SolanaOftProtocol
  simulateSolanaSend?: typeof simulateOfficialSolanaSend
  now: () => Date
}

const defaultDependencies: BuildDependencies = {
  fetchAuthority: fetchCanonicalRouteAuthority,
  createSolanaProtocol: createOfficialSolanaOftProtocol,
  simulateSolanaSend: simulateOfficialSolanaSend,
  now: () => new Date(),
}

export async function buildMarcoBridgePayload(
  body: Record<string, unknown> | null | undefined,
  dependencies: BuildDependencies = defaultDependencies,
) {
  const { from, to, amount, sourceWallet, destinationWallet, quote, allowanceLD, prepare } = body ?? {}
  if (
    !isNetworkId(from) ||
    !isNetworkId(to) ||
    typeof amount !== 'string' ||
    typeof sourceWallet !== 'string' ||
    typeof destinationWallet !== 'string'
  ) {
    throw new MarcoBridgeError('QUOTE_FAILED', 'Invalid bridge build request.')
  }
  const preparingSolana = prepare === true && from === 'solana' && to === 'bnb'
  if (
    (!preparingSolana && !quote) ||
    (!preparingSolana &&
      (typeof quote !== 'object' ||
        (quote as MarcoBridgeQuote).live !== true ||
        typeof (quote as MarcoBridgeQuote).nativeFeeWei !== 'string'))
  ) {
    throw new MarcoBridgeError('QUOTE_FAILED', 'A fresh live quote is required before building transactions.')
  }

  const authority = await dependencies.fetchAuthority()
  const suppliedQuote = preparingSolana ? null : (quote as MarcoBridgeQuote)
  let authoritativeQuote = suppliedQuote as MarcoBridgeQuote
  let solanaProtocol: SolanaOftProtocol | null = null
  const now = dependencies.now()

  if (from === 'solana') {
    if (to !== 'bnb') {
      throw new MarcoBridgeError('UNSUPPORTED_ROUTE', 'Only the certified Solana → BNB route is publicly activated.')
    }
    solanaProtocol = dependencies.createSolanaProtocol()
    authoritativeQuote = await readOnlySolanaMarcoBridgeQuote(
      { from: 'solana', to: 'bnb', amount, sourceWallet, destinationWallet },
      authority,
      solanaProtocol,
      now.toISOString(),
    )
    if (suppliedQuote) assertFreshCanonicalSolanaQuote(suppliedQuote, authoritativeQuote, now.getTime())
  }

  const built = buildMarcoBridgeTransactions(
    {
      from,
      to,
      amount,
      sourceWallet,
      destinationWallet,
      allowanceLD: typeof allowanceLD === 'string' ? allowanceLD : undefined,
    },
    authoritativeQuote,
    authority,
  )

  if (from === 'solana' && built.executable && authoritativeQuote.binding && solanaProtocol) {
    const binding = authoritativeQuote.binding
    const send = await solanaProtocol.buildSend({
      payer: sourceWallet,
      tokenMint: binding.mint,
      tokenEscrow: binding.escrow,
      tokenSource: binding.tokenAccount,
      sendParam: {
        dstEid: binding.dstEid,
        toBytes32: binding.toBytes32,
        amountLd: binding.amountLD,
        minAmountLd: binding.amountLD,
        optionsHex: binding.optionsHex,
        payInLzToken: false,
      },
      programId: binding.programId || SOLANA_OFT_PROGRAM,
      lookupTable: binding.lookupTable || LAYERZERO_SOLANA_V2_MAINNET_ALT,
      nativeFeeLamports: authoritativeQuote.nativeFeeWei,
    })
    assertSendMatchesQuote({
      quote: authoritativeQuote,
      request: { from, to, amount, sourceWallet, destinationWallet },
      send,
    })
    const solanaTx = built.transactions.find((tx) => tx.family === 'solana')
    if (!solanaTx || solanaTx.family !== 'solana' || !send.serializedTransaction) {
      throw new MarcoBridgeError('SOURCE_FAILED', 'The official Solana OFT SDK did not produce a signable transaction.')
    }
    await (dependencies.simulateSolanaSend ?? simulateOfficialSolanaSend)(send.serializedTransaction)
    solanaTx.serializedTransaction = send.serializedTransaction
    solanaTx.tokenAccount = send.tokenSource
    solanaTx.quoteIdentity = binding.identity
  }

  return preparingSolana ? { ...built, quote: authoritativeQuote } : built
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' })
  }
  try {
    const built = await buildMarcoBridgePayload(req.body)
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json(built)
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Bridge transaction build failed.'
    const code = cause instanceof MarcoBridgeError ? cause.code : 'QUOTE_FAILED'
    return res.status(code === 'INVALID_DESTINATION' ? 400 : 503).json({ error: code, message })
  }
}
