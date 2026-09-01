import type { MarcoBridgeQuoteRequest } from './service'
import {
  LAYERZERO_SOLANA_V2_MAINNET_ALT,
  SOLANA_OFT_PROGRAM,
  SOLANA_OFT_STORE,
  type SolanaOftBuiltSend,
  type SolanaOftProtocol,
} from './solanaOftProtocol'
import { readSolanaOwnerAccounts } from './solanaWalletAccounts'
import { MarcoBridgeError, type MarcoBridgeQuote } from './types'

type BuildFetcher = (
  request: MarcoBridgeQuoteRequest,
  quote: MarcoBridgeQuote,
) => Promise<{ serializedTransaction?: string; tokenAccount?: string }>

async function defaultBuildFetcher(
  request: MarcoBridgeQuoteRequest,
  quote: MarcoBridgeQuote,
): Promise<{ serializedTransaction?: string; tokenAccount?: string }> {
  const response = await fetch('/api/marco-bridge/build', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...request, quote }),
  })
  const payload = (await response.json()) as {
    message?: string
    transactions?: Array<{
      family?: string
      serializedTransaction?: string
      tokenAccount?: string
    }>
  }
  if (!response.ok) {
    throw new MarcoBridgeError('QUOTE_FAILED', payload.message || 'Solana OFT send construction failed.')
  }
  const send = payload.transactions?.find((tx) => tx.family === 'solana')
  if (!send?.serializedTransaction) {
    throw new MarcoBridgeError('SOURCE_FAILED', 'The official Solana OFT SDK did not produce a signable transaction.')
  }
  return send
}

export function createBrowserSolanaOftProtocol(
  input: {
    quote: MarcoBridgeQuote
    request: MarcoBridgeQuoteRequest
    build?: BuildFetcher
    readOwner?: typeof readSolanaOwnerAccounts
  } & Partial<Pick<SolanaOftProtocol, 'fetchStore' | 'getEnforcedOptions'>>,
): SolanaOftProtocol {
  const build = input.build ?? defaultBuildFetcher
  const readOwner = input.readOwner ?? readSolanaOwnerAccounts
  return {
    fetchStore:
      input.fetchStore ??
      (async () => {
        throw new MarcoBridgeError('QUOTE_FAILED', 'Solana OFT store reads use the live quote API.')
      }),
    getEnforcedOptions:
      input.getEnforcedOptions ??
      (async () => {
        throw new MarcoBridgeError('QUOTE_FAILED', 'Solana OFT option reads use the live quote API.')
      }),
    quote: input.quote
      ? async () => ({
          nativeFeeLamports: input.quote.nativeFeeWei,
          amountSentLd: input.quote.binding?.amountLD ?? '0',
          amountReceivedLd: input.quote.binding?.amountLD ?? '0',
        })
      : async () => {
          throw new MarcoBridgeError('QUOTE_FAILED', 'Solana OFT quotes use the live quote API.')
        },
    async fetchOwnerAccounts({ owner, mint }) {
      return readOwner({ owner, mint })
    },
    async buildSend(accounts): Promise<SolanaOftBuiltSend> {
      const built = await build(input.request, input.quote)
      return {
        serializedTransaction: built.serializedTransaction ?? '',
        feePayer: accounts.payer,
        tokenSource: accounts.tokenSource,
        sendParam: accounts.sendParam,
        nativeFeeLamports: accounts.nativeFeeLamports,
        store: SOLANA_OFT_STORE,
        programId: accounts.programId || SOLANA_OFT_PROGRAM,
        mint: accounts.tokenMint,
        escrow: accounts.tokenEscrow,
        lookupTable: accounts.lookupTable || LAYERZERO_SOLANA_V2_MAINNET_ALT,
      }
    },
  }
}
