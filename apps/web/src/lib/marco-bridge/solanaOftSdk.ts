import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import {
  createNoopSigner,
  publicKey,
  signerIdentity,
  transactionBuilder,
  type Umi,
} from '@metaplex-foundation/umi'
import {
  fetchAddressLookupTable,
  fetchMint,
  fetchToken,
  findAssociatedTokenPda,
  mplToolbox,
  setComputeUnitLimit,
  setComputeUnitPrice,
} from '@metaplex-foundation/mpl-toolbox'
import { toWeb3JsTransaction } from '@metaplex-foundation/umi-web3js-adapters'
import { oft } from '@layerzerolabs/oft-v2-solana-sdk'
import { SOLANA_STORE_RPC_FALLBACK, SOLANA_STORE_RPC_PRIMARY } from './solanaStoreRead'
import {
  LAYERZERO_SOLANA_V2_MAINNET_ALT,
  SOLANA_OFT_PROGRAM,
  SOLANA_OFT_STORE,
  type SolanaOftBuiltSend,
  type SolanaOftOwnerSnapshot,
  type SolanaOftProtocol,
  type SolanaOftQuoteAccounts,
  type SolanaOftQuoteResult,
  type SolanaOftSendAccounts,
  type SolanaOftSendParam,
  type SolanaOftStoreSnapshot,
} from './solanaOftProtocol'
import { MarcoBridgeError } from './types'

const SEND_COMPUTE_UNITS = 253_000
const SEND_COMPUTE_UNIT_PRICE = 50_000

function hexToBytes(hex: string): Uint8Array {
  const value = hex.startsWith('0x') || hex.startsWith('0X') ? hex.slice(2) : hex
  if (!value) return new Uint8Array()
  if (value.length % 2 !== 0) throw new MarcoBridgeError('QUOTE_FAILED', 'Solana OFT options encoding is invalid.')
  const bytes = new Uint8Array(value.length / 2)
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(value.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

function bytesToHex(bytes: Uint8Array | undefined | null): string {
  if (!bytes || bytes.length === 0) return '0x'
  return `0x${Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')}`
}

function asBase58(value: { toString(): string } | string): string {
  return typeof value === 'string' ? value : value.toString()
}

function createReadOnlyUmi(rpcUrl: string): Umi {
  const umi = createUmi(rpcUrl).use(mplToolbox())
  const payer = createNoopSigner(publicKey('11111111111111111111111111111111'))
  umi.use(signerIdentity(payer, true))
  return umi
}

async function withRpcFallback<T>(run: (umi: Umi, rpcUrl: string) => Promise<T>): Promise<T> {
  const endpoints = [SOLANA_STORE_RPC_PRIMARY, SOLANA_STORE_RPC_FALLBACK]
  let lastError: unknown
  for (const rpcUrl of endpoints) {
    try {
      return await run(createReadOnlyUmi(rpcUrl), rpcUrl)
    } catch (cause) {
      lastError = cause
      if (cause instanceof MarcoBridgeError) throw cause
    }
  }
  throw lastError instanceof Error
    ? new MarcoBridgeError('QUOTE_FAILED', lastError.message)
    : new MarcoBridgeError('QUOTE_FAILED', 'Solana OFT RPC is unavailable.')
}

function sendParamBytes(sendParam: SolanaOftSendParam) {
  return {
    dstEid: sendParam.dstEid,
    to: hexToBytes(sendParam.toBytes32),
    amountLd: BigInt(sendParam.amountLd),
    minAmountLd: BigInt(sendParam.minAmountLd),
    options: hexToBytes(sendParam.optionsHex),
    payInLzToken: false as const,
  }
}

export function createOfficialSolanaOftProtocol(): SolanaOftProtocol {
  return {
    async fetchStore(input): Promise<SolanaOftStoreSnapshot> {
      return withRpcFallback(async (umi) => {
        const storePda = publicKey(input.store)
        const storeAccount = await oft.accounts.fetchOFTStore(umi, storePda)
        const tokenMint = asBase58(storeAccount.tokenMint)
        const mint = await fetchMint(umi, publicKey(tokenMint))
        return {
          store: input.store,
          programId: input.programId || SOLANA_OFT_PROGRAM,
          tokenMint,
          tokenEscrow: asBase58(storeAccount.tokenEscrow),
          paused: Boolean(storeAccount.paused),
          decimals: mint.decimals,
        }
      })
    },

    async fetchOwnerAccounts(input): Promise<SolanaOftOwnerSnapshot> {
      return withRpcFallback(async (umi) => {
        const owner = publicKey(input.owner)
        const mint = publicKey(input.mint)
        const tokenAccount = findAssociatedTokenPda(umi, { mint, owner })
        if (!tokenAccount?.[0]) {
          throw new MarcoBridgeError('INSUFFICIENT_MARCO', 'No MARCO token account was found for the connected Solana wallet.')
        }
        const tokenPda = tokenAccount[0]
        let token
        try {
          token = await fetchToken(umi, tokenPda)
        } catch {
          throw new MarcoBridgeError('INSUFFICIENT_MARCO', 'No MARCO token account was found for the connected Solana wallet.')
        }
        const sol = await umi.rpc.getBalance(owner)
        return {
          owner: input.owner,
          tokenAccount: asBase58(tokenPda),
          tokenBalanceLd: token.amount.toString(),
          solLamports: sol.basisPoints.toString(),
        }
      })
    },

    async getEnforcedOptions(input) {
      return withRpcFallback(async (umi) => {
        const enforced = await oft.getEnforcedOptions(
          umi.rpc,
          publicKey(input.store),
          input.dstEid,
          publicKey(input.programId),
        )
        return { sendHex: bytesToHex(enforced.send) }
      })
    },

    async quote(input: SolanaOftQuoteAccounts): Promise<SolanaOftQuoteResult> {
      return withRpcFallback(async (umi) => {
        const params = sendParamBytes(input.sendParam)
        const accounts = {
          payer: publicKey(input.payer),
          tokenMint: publicKey(input.tokenMint),
          tokenEscrow: publicKey(input.tokenEscrow),
        }
        const programs = { oft: publicKey(input.programId) }
        const lookup = publicKey(input.lookupTable || LAYERZERO_SOLANA_V2_MAINNET_ALT)
        const [fee, oftReceipt] = await Promise.all([
          oft.quote(umi.rpc, accounts, params, programs, [], [lookup]),
          oft.quoteOft(umi.rpc, accounts, params, publicKey(input.programId)),
        ])
        return {
          nativeFeeLamports: fee.nativeFee.toString(),
          amountSentLd: oftReceipt.oftReceipt.amountSentLd.toString(),
          amountReceivedLd: oftReceipt.oftReceipt.amountReceivedLd.toString(),
        }
      })
    },

    async buildSend(input: SolanaOftSendAccounts): Promise<SolanaOftBuiltSend> {
      return withRpcFallback(async (umi) => {
        const payer = createNoopSigner(publicKey(input.payer))
        umi.use(signerIdentity(payer, true))
        const params = sendParamBytes(input.sendParam)
        const ix = await oft.send(
          umi.rpc,
          {
            payer,
            tokenMint: publicKey(input.tokenMint),
            tokenEscrow: publicKey(input.tokenEscrow),
            tokenSource: publicKey(input.tokenSource),
          },
          {
            ...params,
            nativeFee: BigInt(input.nativeFeeLamports),
          },
          { oft: publicKey(input.programId) },
        )
        const lookupTable = publicKey(input.lookupTable || LAYERZERO_SOLANA_V2_MAINNET_ALT)
        const lookupTableInput = await fetchAddressLookupTable(umi, lookupTable)
        if (!lookupTableInput) {
          throw new MarcoBridgeError('QUOTE_FAILED', 'The LayerZero Solana address lookup table could not be loaded.')
        }
        const built = await transactionBuilder()
          .add(setComputeUnitPrice(umi, { microLamports: SEND_COMPUTE_UNIT_PRICE }))
          .add(setComputeUnitLimit(umi, { units: SEND_COMPUTE_UNITS }))
          .setAddressLookupTables([lookupTableInput])
          .add(ix)
          .buildWithLatestBlockhash(umi)
        const web3Tx = toWeb3JsTransaction(built)
        return {
          serializedTransaction: Buffer.from(web3Tx.serialize()).toString('base64'),
          feePayer: input.payer,
          tokenSource: input.tokenSource,
          sendParam: input.sendParam,
          nativeFeeLamports: input.nativeFeeLamports,
          store: SOLANA_OFT_STORE,
          programId: input.programId,
          mint: input.tokenMint,
          escrow: input.tokenEscrow,
          lookupTable: asBase58(lookupTable),
        }
      })
    },
  }
}
