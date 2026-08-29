import { addressToBytes32 } from '@layerzerolabs/lz-v2-utilities'
import { oft } from '@layerzerolabs/oft-v2-solana-sdk'
import { findAssociatedTokenPda, mplToolbox } from '@metaplex-foundation/mpl-toolbox'
import { createSignerFromKeypair, publicKey, signerIdentity } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { fromWeb3JsPublicKey, toWeb3JsInstruction } from '@metaplex-foundation/umi-web3js-adapters'
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from 'solana-web3-latest'
import type { CanonicalMmnRouteState } from './routeAuthority'
import { assertMarcoRouteExecutable } from './executionGate'
import type { MarcoBridgeQuoteRequest } from './service'
import { MarcoBridgeError, type MarcoBridgeQuote } from './types'
import { parseBridgeAmount } from './validation'
import { MARCO_WAVE1_NETWORKS } from './wave1Registry'

const SOLANA_PROGRAM = 'Gti4f873FUw5jpMa4wnRVcZDjr5YwonZ1FcY8vXu2Wnm'
const SOLANA_ESCROW = 'Cd1H2o5kcb2ZcpxcEJfiypPQvDKc2jA164bhmm51iS5'
const SOLANA_ALT = 'AokBxha6VMLLgf97B5VYHEtqztamWmYERBmmFvjuTzJB'
const SOLANA_RPC = process.env.SOLANA_RPC_URL || process.env.RPC_URL_SOLANA || 'https://api.mainnet-beta.solana.com'

export type SolanaBuildResult = {
  quote: MarcoBridgeQuote
  versionedTxBase64: string
  blockhash: string
  lastValidBlockHeight: number
  serializedBytes: number
}

export async function buildSolanaMarcoSend(
  request: MarcoBridgeQuoteRequest,
  authority: CanonicalMmnRouteState,
): Promise<SolanaBuildResult> {
  if (request.from !== 'solana' || request.to !== 'bnb') {
    throw new MarcoBridgeError('UNSUPPORTED_ROUTE', 'The Solana transaction builder only permits Solana → BNB.')
  }
  assertMarcoRouteExecutable(authority, request.from, request.to)
  const canonical = authority.networks.find((network) => network.id === 'solana')
  const source = MARCO_WAVE1_NETWORKS.solana
  const destination = MARCO_WAVE1_NETWORKS.bnb
  if (
    !canonical ||
    canonical.paused ||
    canonical.endpoint_contract !== source.endpointContract ||
    canonical.token !== source.marcoIdentity
  ) {
    throw new MarcoBridgeError('CANONICAL_CONFIG_MISSING', 'Canonical Solana OFT is paused or mismatched.')
  }

  const amount = parseBridgeAmount(request.amount, source.tokenDecimals)
  if (!amount) throw new MarcoBridgeError('QUOTE_FAILED', 'The MARCO amount is invalid.')
  const amountLd = BigInt(amount.amountLD.toString())
  const connection = new Connection(SOLANA_RPC, 'confirmed')
  const payer = new PublicKey(request.sourceWallet)
  const umi = createUmi(SOLANA_RPC).use(mplToolbox())
  const ephemeral = Keypair.generate()
  umi.use(signerIdentity(createSignerFromKeypair(umi, umi.eddsa.createKeypairFromSecretKey(ephemeral.secretKey))))

  const storePda = publicKey(source.endpointContract)
  const programId = publicKey(SOLANA_PROGRAM)
  const store = await oft.accounts.fetchOFTStore({ rpc: umi.rpc }, storePda)
  if (store.paused !== false || String(store.tokenMint) !== source.marcoIdentity) {
    throw new MarcoBridgeError('PUBLIC_ACTIVATION_REQUIRED', 'The canonical Solana OFT Store is paused or mismatched.')
  }
  const tokenAccount = findAssociatedTokenPda(umi, {
    mint: fromWeb3JsPublicKey(new PublicKey(source.marcoIdentity)),
    owner: fromWeb3JsPublicKey(payer),
  })
  const tokenAccountKey = new PublicKey(tokenAccount[0].toString())
  const [tokenInfo, payerBalance] = await Promise.all([
    connection.getTokenAccountBalance(tokenAccountKey, 'confirmed').catch(() => null),
    connection.getBalance(payer, 'confirmed'),
  ])
  if (!tokenInfo || BigInt(tokenInfo.value.amount) < amountLd) {
    throw new MarcoBridgeError('INSUFFICIENT_MARCO', 'The connected Solana wallet has insufficient MARCO.')
  }

  const sendParam = {
    dstEid: destination.layerZeroEid,
    to: Buffer.from(addressToBytes32(request.destinationWallet)),
    amountLd,
    minAmountLd: amountLd,
  }
  const lookup = [publicKey(SOLANA_ALT)]
  const q = await oft.quote(
    umi.rpc,
    {
      payer: fromWeb3JsPublicKey(payer),
      tokenMint: fromWeb3JsPublicKey(new PublicKey(source.marcoIdentity)),
      tokenEscrow: fromWeb3JsPublicKey(new PublicKey(SOLANA_ESCROW)),
    },
    { payInLzToken: false, ...sendParam },
    { oft: programId },
    [],
    lookup,
  )
  const nativeFee = BigInt(q.nativeFee.toString())
  if (BigInt(payerBalance) <= nativeFee + BigInt(1_000_000)) {
    throw new MarcoBridgeError(
      'INSUFFICIENT_GAS',
      'The connected Solana wallet has insufficient SOL for LayerZero fees.',
    )
  }
  const payerSigner = {
    publicKey: fromWeb3JsPublicKey(payer),
    signMessage: async () => {
      throw new Error('Wallet signature is required in the browser.')
    },
    signTransaction: async () => {
      throw new Error('Wallet signature is required in the browser.')
    },
    signAllTransactions: async () => {
      throw new Error('Wallet signature is required in the browser.')
    },
  }
  const builder = await oft.send(
    umi.rpc,
    {
      payer: payerSigner,
      tokenMint: fromWeb3JsPublicKey(new PublicKey(source.marcoIdentity)),
      tokenEscrow: fromWeb3JsPublicKey(new PublicKey(SOLANA_ESCROW)),
      tokenSource: tokenAccount[0],
    },
    { nativeFee, ...sendParam },
    { oft: programId },
  )
  const instructions = [
    ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50_000 }),
  ]
  instructions.push(toWeb3JsInstruction(builder.instruction))
  const { value: lookupTable } = await connection.getAddressLookupTable(new PublicKey(SOLANA_ALT))
  if (!lookupTable) throw new MarcoBridgeError('CANONICAL_CONFIG_MISSING', 'Canonical Solana lookup table is missing.')
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
  const message = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message([lookupTable])
  const transaction = new VersionedTransaction(message)
  const serialized = Buffer.from(transaction.serialize())
  if (serialized.length > 1232) throw new MarcoBridgeError('QUOTE_FAILED', 'Solana OFT transaction exceeds 1232 bytes.')
  const simulation = await connection.simulateTransaction(transaction, {
    sigVerify: false,
    replaceRecentBlockhash: true,
  })
  if (simulation.value.err) {
    throw new MarcoBridgeError('QUOTE_FAILED', `Solana OFT simulation failed: ${JSON.stringify(simulation.value.err)}`)
  }
  const canonicalRoute = assertMarcoRouteExecutable(authority, request.from, request.to)
  return {
    quote: {
      amount: amount.normalized,
      expectedReceive: amount.normalized,
      nativeFee: (Number(nativeFee) / 1e9).toFixed(9).replace(/0+$/, '').replace(/\.$/, ''),
      nativeFeeSymbol: 'SOL',
      routeLabel: 'Solana → BNB',
      quotedAt: new Date().toISOString(),
      live: true,
      routePaused: canonicalRoute.paused,
      publiclyActive: canonicalRoute.publicly_active,
      executionEnabled: authority.global_execution_enabled && canonicalRoute.execution_enabled,
    },
    versionedTxBase64: serialized.toString('base64'),
    blockhash,
    lastValidBlockHeight,
    serializedBytes: serialized.length,
  }
}
