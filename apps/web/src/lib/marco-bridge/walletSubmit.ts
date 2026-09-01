import { Interface } from '@ethersproject/abi'
import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { VersionedTransaction } from '@solana/web3.js'
import { LIVE_QUOTE_TTL_MS } from './bridgeActionState'
import { assertRouteExecutable } from './executableRoutes'
import {
  evaluateNativeFunds,
  isNativeFundsBlocked,
  readGasPriceWei,
  readNativeBalanceWei,
  requiredNativeGasDecimal,
  requiredNativeWeiForBridge,
  type NativeFundsProvider,
} from './nativeFunds'
import { MARCO_BRIDGE_SUBMITTED_COPY } from './lifecycle'
import { assertMarcoBridgePreflight } from './preflight'
import type { CanonicalMmnRouteState } from './routeAuthority'
import { ensureRobinhoodWalletNetwork } from './robinhoodChain'
import { requestMarcoBridgeQuote, type MarcoBridgeQuoteRequest } from './service'
import { createBrowserSolanaOftProtocol } from './solanaBrowserProtocol'
import {
  LAYERZERO_SOLANA_V2_MAINNET_ALT,
  SOLANA_OFT_PROGRAM,
  assertSendMatchesQuote,
  type SolanaOftProtocol,
} from './solanaOftProtocol'
import {
  ERC20_APPROVE_IFACE,
  assertBuildReady,
  buildMarcoBridgeTransactions,
  type UnsignedEvmBridgeTx,
} from './transactionBuilder'
import { MarcoBridgeError, type MarcoBridgeQuote, type MarcoBridgeTracking } from './types'
import { isValidMarcoDestination } from './validation'
import { MARCO_WAVE1_NETWORKS } from './wave1Registry'

const ERC20_BALANCE_IFACE = new Interface(['function balanceOf(address owner) view returns (uint256)'])

export type WalletSubmitReceipt = {
  status?: number | null
}

export type WalletSubmitSigner = {
  getAddress(): Promise<string>
  sendTransaction(tx: { to: string; data: string; value?: string; chainId?: number }): Promise<{
    hash: string
    wait?: (confirms?: number) => Promise<WalletSubmitReceipt | null>
  }>
  provider?: NativeFundsProvider & {
    call?(tx: { to: string; data: string }): Promise<string>
    waitForTransaction?(hash: string): Promise<WalletSubmitReceipt | null>
  }
}

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

export type SolanaInjectedWallet = {
  publicKey?: { toString(): string; toBase58?: () => string }
  signAndSendTransaction?: (transaction: VersionedTransaction) => Promise<{ signature?: string } | string>
  signTransaction?: (transaction: VersionedTransaction) => Promise<{
    serialize: () => Uint8Array | Buffer | number[]
  }>
}

export type SolanaBroadcastTransport = {
  sendRawTransaction(raw: Uint8Array): Promise<string>
}

export type SolanaSourceConfirmation = (signature: string) => Promise<void>

export async function confirmSolanaSourceBroadcast(
  signature: string,
  fetcher: typeof fetch = fetch,
  attempts = 12,
): Promise<void> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetcher(`/api/marco-bridge/source-status/?sourceTx=${encodeURIComponent(signature)}`, {
        cache: 'no-store',
      })
      if (response.ok) {
        const payload = (await response.json()) as { status?: string }
        if (payload.status === 'failed') {
          throw new MarcoBridgeError('SOURCE_FAILED', 'The Solana source transaction failed on-chain.')
        }
        if (payload.status && payload.status !== 'not-found') return
      }
    } catch (cause) {
      if (cause instanceof MarcoBridgeError) throw cause
    }
    if (attempt + 1 < attempts) await new Promise((resolve) => setTimeout(resolve, 1_000))
  }

  throw new MarcoBridgeError(
    'SOURCE_FAILED',
    `Phantom returned signature ${signature}, but Solana did not observe the broadcast. No LayerZero transfer started.`,
  )
}

export function readConnectedSolanaAddress(wallet: SolanaInjectedWallet | null | undefined): string {
  return wallet?.publicKey?.toString() ?? ''
}

export function solanaWalletConnectionLabel(address: string): 'Connected' | 'Connect' {
  return address ? 'Connected' : 'Connect'
}

function assertFreshQuote(quote: MarcoBridgeQuote): void {
  const expiry = quote.expiresAt ? Date.parse(quote.expiresAt) : Date.parse(quote.quotedAt) + LIVE_QUOTE_TTL_MS
  if (!Number.isFinite(expiry) || Date.now() > expiry) {
    throw new MarcoBridgeError('QUOTE_FAILED', 'The live quote expired. Request a new quote before signing.')
  }
}

function deserializeSolanaTransaction(serialized: string): VersionedTransaction {
  return VersionedTransaction.deserialize(Buffer.from(serialized, 'base64'))
}

async function signAndBroadcastSolanaSend(input: {
  wallet: SolanaInjectedWallet
  serializedTransaction: string
  transport?: SolanaBroadcastTransport
  confirmSource: SolanaSourceConfirmation
}): Promise<string> {
  const transaction = deserializeSolanaTransaction(input.serializedTransaction)
  if (typeof input.wallet.signAndSendTransaction === 'function') {
    const sent = await input.wallet.signAndSendTransaction(transaction)
    const signature = typeof sent === 'string' ? sent : sent?.signature
    if (!signature) throw new MarcoBridgeError('SOURCE_FAILED', 'The Solana wallet did not return a source signature.')
    await input.confirmSource(signature)
    return signature
  }
  if (typeof input.wallet.signTransaction === 'function' && input.transport?.sendRawTransaction) {
    const signed = await input.wallet.signTransaction(transaction)
    const raw = signed.serialize()
    const bytes = raw instanceof Uint8Array ? raw : Uint8Array.from(raw)
    const signature = await input.transport.sendRawTransaction(bytes)
    if (!signature) throw new MarcoBridgeError('SOURCE_FAILED', 'The Solana send was not broadcast.')
    await input.confirmSource(signature)
    return signature
  }
  throw new MarcoBridgeError(
    'WALLET_REQUIRED',
    'The connected Solana wallet must support signAndSendTransaction or signTransaction.',
  )
}

export async function submitSolanaMarcoBridgeFromWallet(input: {
  request: MarcoBridgeQuoteRequest
  authority: CanonicalMmnRouteState
  wallet: SolanaInjectedWallet
  protocol: SolanaOftProtocol
  transport?: SolanaBroadcastTransport
  confirmSource: SolanaSourceConfirmation
  requestQuote?: typeof requestMarcoBridgeQuote
}): Promise<MarcoBridgeTracking> {
  assertRouteExecutable(input.request.from, input.request.to, input.authority)
  if (input.request.from !== 'solana' || input.request.to !== 'bnb') {
    throw new MarcoBridgeError('UNSUPPORTED_ROUTE', 'Only the certified Solana → BNB route is publicly activated.')
  }
  const connected = readConnectedSolanaAddress(input.wallet)
  if (!connected) {
    throw new MarcoBridgeError('WALLET_REQUIRED', 'Connect the Solana wallet to sign the bridge send.')
  }
  if (connected !== input.request.sourceWallet) {
    throw new MarcoBridgeError('WALLET_REQUIRED', 'Connected wallet does not match the quoted Solana source wallet.')
  }
  if (!isValidMarcoDestination(input.request.destinationWallet, 'evm')) {
    throw new MarcoBridgeError('INVALID_DESTINATION', 'Enter a valid BNB Smart Chain destination wallet.')
  }

  const requestQuote = input.requestQuote ?? requestMarcoBridgeQuote
  const quote = await requestQuote(input.request)
  assertFreshQuote(quote)
  if (!quote.binding) {
    throw new MarcoBridgeError('QUOTE_FAILED', 'The Solana quote is missing a bound send identity.')
  }
  if (quote.binding.sourceWallet !== connected) {
    throw new MarcoBridgeError('WALLET_REQUIRED', 'Connected wallet does not match the quoted Solana source wallet.')
  }
  const send = await input.protocol.buildSend({
    payer: connected,
    tokenMint: quote.binding.mint,
    tokenEscrow: quote.binding.escrow,
    tokenSource: quote.binding.tokenAccount,
    sendParam: {
      dstEid: quote.binding.dstEid,
      toBytes32: quote.binding.toBytes32,
      amountLd: quote.binding.amountLD,
      minAmountLd: quote.binding.amountLD,
      optionsHex: quote.binding.optionsHex,
      payInLzToken: false,
    },
    programId: quote.binding.programId || SOLANA_OFT_PROGRAM,
    lookupTable: quote.binding.lookupTable || LAYERZERO_SOLANA_V2_MAINNET_ALT,
    nativeFeeLamports: quote.nativeFeeWei,
  })
  assertSendMatchesQuote({ quote, request: input.request, send })
  if (!send.serializedTransaction) {
    throw new MarcoBridgeError('SOURCE_FAILED', 'The official Solana OFT SDK did not produce a signable transaction.')
  }

  const sourceTx = await signAndBroadcastSolanaSend({
    wallet: input.wallet,
    serializedTransaction: send.serializedTransaction,
    transport: input.transport,
    confirmSource: input.confirmSource,
  })
  return {
    status: 'submitted',
    sourceTx,
    message: MARCO_BRIDGE_SUBMITTED_COPY,
  }
}

export async function readErc20Allowance(input: {
  token: string
  owner: string
  spender: string
  provider: { call(tx: { to: string; data: string }): Promise<string> }
}): Promise<string> {
  const data = ERC20_APPROVE_IFACE.encodeFunctionData('allowance', [input.owner, input.spender])
  const result = await input.provider.call({ to: input.token, data })
  return BigNumber.from(result === '0x' ? '0' : result).toString()
}

export async function readErc20Balance(input: {
  token: string
  owner: string
  provider: { call(tx: { to: string; data: string }): Promise<string> }
}): Promise<string> {
  const data = ERC20_BALANCE_IFACE.encodeFunctionData('balanceOf', [input.owner])
  const result = await input.provider.call({ to: input.token, data })
  return BigNumber.from(result === '0x' ? '0' : result).toString()
}

export async function waitForSubmittedReceipt(input: {
  sent: { hash: string; wait?: (confirms?: number) => Promise<WalletSubmitReceipt | null> }
  provider?: { waitForTransaction?(hash: string): Promise<WalletSubmitReceipt | null> }
  failureCode?: 'APPROVAL_FAILED' | 'SOURCE_FAILED'
  failureMessage: string
}): Promise<WalletSubmitReceipt> {
  const receipt = input.sent.wait
    ? await input.sent.wait(1)
    : input.provider?.waitForTransaction
    ? await input.provider.waitForTransaction(input.sent.hash)
    : null
  if (!receipt) {
    throw new MarcoBridgeError(input.failureCode ?? 'SOURCE_FAILED', input.failureMessage)
  }
  if (receipt.status === 0) {
    throw new MarcoBridgeError(input.failureCode ?? 'SOURCE_FAILED', input.failureMessage)
  }
  return receipt
}

async function assertWalletNativePreflight(input: {
  request: MarcoBridgeQuoteRequest
  quote: MarcoBridgeQuote
  signer: WalletSubmitSigner
  signerAddress: string
  approvalRequired: boolean
}): Promise<void> {
  const source = MARCO_WAVE1_NETWORKS[input.request.from]
  const provider = input.signer.provider
  if (!provider?.getBalance) {
    throw new MarcoBridgeError(
      input.request.from === 'bnb' ? 'INSUFFICIENT_BNB' : 'INSUFFICIENT_GAS',
      input.request.from === 'bnb' ? 'INSUFFICIENT BNB' : `Insufficient native gas on ${source.label}.`,
    )
  }
  const [nativeBalanceWei, gasPriceWei] = await Promise.all([
    readNativeBalanceWei(provider, input.signerAddress),
    readGasPriceWei(provider),
  ])
  const requiredWei = requiredNativeWeiForBridge({
    nativeFeeWei: input.quote.nativeFeeWei,
    gasPriceWei,
    approvalRequired: input.approvalRequired,
  }).toString()
  const marcoBalance = provider.call
    ? formatUnits(
        await readErc20Balance({
          token: source.marcoIdentity,
          owner: input.signerAddress,
          provider: { call: (tx) => provider.call!(tx) },
        }),
        source.tokenDecimals,
      )
    : input.request.amount
  const nativeDecimals = preflightDecimals(input.request.from, nativeBalanceWei, requiredWei)
  assertMarcoBridgePreflight({
    from: input.request.from,
    to: input.request.to,
    amount: input.request.amount,
    marcoBalance,
    nativeGasBalance: nativeDecimals.nativeGasBalance,
    minimumNativeGas: nativeDecimals.minimumNativeGas,
    connectedEvmChainId: source.chainId,
    destinationWallet: input.request.destinationWallet,
    nativeFeeWei: input.quote.nativeFeeWei,
    nativeBalanceWei,
    gasPriceWei,
    approvalRequired: input.approvalRequired,
  })
  const verdict = evaluateNativeFunds({
    from: input.request.from,
    balanceWei: nativeBalanceWei,
    nativeFeeWei: input.quote.nativeFeeWei,
    gasPriceWei,
    approvalRequired: input.approvalRequired,
  })
  if (isNativeFundsBlocked(verdict)) {
    throw new MarcoBridgeError(verdict.code, verdict.reason)
  }
}

function preflightDecimals(from: MarcoBridgeQuoteRequest['from'], balanceWei: string, requiredWei: string) {
  const decimals = from === 'solana' ? 9 : 18
  return {
    nativeGasBalance: formatUnits(balanceWei, decimals),
    minimumNativeGas: decimals === 18 ? requiredNativeGasDecimal(requiredWei) : formatUnits(requiredWei, decimals),
  }
}

export async function submitMarcoApprovalFromWallet(input: {
  request: MarcoBridgeQuoteRequest
  authority: CanonicalMmnRouteState
  signer: WalletSubmitSigner
  allowanceLD?: string
  requestQuote?: typeof requestMarcoBridgeQuote
}): Promise<string> {
  assertRouteExecutable(input.request.from, input.request.to, input.authority)
  const requestQuote = input.requestQuote ?? requestMarcoBridgeQuote
  const quote = await requestQuote(input.request)
  const build = buildMarcoBridgeTransactions(
    { ...input.request, allowanceLD: input.allowanceLD },
    quote,
    input.authority,
  )
  const approval = build.transactions.find((tx) => tx.family === 'evm' && tx.purpose === 'approve')
  if (!approval || approval.family !== 'evm') {
    throw new MarcoBridgeError('WALLET_REQUIRED', 'MARCO approval is not required for this allowance.')
  }
  const signerAddress = getAddress(await input.signer.getAddress())
  if (signerAddress !== getAddress(input.request.sourceWallet)) {
    throw new MarcoBridgeError('WALLET_REQUIRED', 'Connected wallet does not match the source wallet.')
  }
  await assertWalletNativePreflight({
    request: input.request,
    quote,
    signer: input.signer,
    signerAddress,
    approvalRequired: true,
  })
  const sent = await input.signer.sendTransaction({
    to: approval.to,
    data: approval.data,
    value: approval.value,
    chainId: approval.chainId,
  })
  await waitForSubmittedReceipt({
    sent,
    provider: input.signer.provider,
    failureCode: 'APPROVAL_FAILED',
    failureMessage: 'MARCO approval failed on-chain.',
  })
  return sent.hash
}

export async function submitMarcoBridgeFromWallet(input: {
  request: MarcoBridgeQuoteRequest
  authority: CanonicalMmnRouteState
  signer?: WalletSubmitSigner
  ethereum?: EthereumProvider | null
  allowanceLD?: string
  requestQuote?: typeof requestMarcoBridgeQuote
  solanaWallet?: SolanaInjectedWallet
  solanaProtocol?: SolanaOftProtocol
  solanaTransport?: SolanaBroadcastTransport
  confirmSolanaSource?: SolanaSourceConfirmation
  preparedSolanaTransaction?: string
}): Promise<MarcoBridgeTracking> {
  assertRouteExecutable(input.request.from, input.request.to, input.authority)
  const source = MARCO_WAVE1_NETWORKS[input.request.from]
  if (source.walletFamily === 'solana') {
    if (!input.solanaWallet) {
      throw new MarcoBridgeError('WALLET_REQUIRED', 'Connect the Solana wallet to sign the bridge send.')
    }
    const requestQuote = input.requestQuote ?? requestMarcoBridgeQuote
    const quote = await requestQuote(input.request)
    const preparedBuild = input.preparedSolanaTransaction
    return submitSolanaMarcoBridgeFromWallet({
      request: input.request,
      authority: input.authority,
      wallet: input.solanaWallet,
      protocol:
        input.solanaProtocol ??
        createBrowserSolanaOftProtocol({
          request: input.request,
          quote,
          ...(preparedBuild
            ? {
                build: async () => ({
                  serializedTransaction: preparedBuild,
                  tokenAccount: quote.binding?.tokenAccount,
                }),
              }
            : {}),
        }),
      transport: input.solanaTransport,
      confirmSource: input.confirmSolanaSource ?? confirmSolanaSourceBroadcast,
      requestQuote: async () => quote,
    })
  }
  if (!input.signer) {
    throw new MarcoBridgeError('WALLET_REQUIRED', 'Connect the source wallet to sign the unsigned bridge transactions.')
  }
  const signer = input.signer
  if (source.chainId === 4663 && input.ethereum) {
    await ensureRobinhoodWalletNetwork(input.ethereum)
  }

  const requestQuote = input.requestQuote ?? requestMarcoBridgeQuote
  const quote = await requestQuote(input.request)
  if (quote.quotedAt) {
    const ageMs = Date.now() - Date.parse(quote.quotedAt)
    if (Number.isFinite(ageMs) && ageMs > 60_000) {
      throw new MarcoBridgeError('QUOTE_FAILED', 'The live quote expired. Request a new quote before signing.')
    }
  }

  const signerAddress = getAddress(await signer.getAddress())
  if (signerAddress !== getAddress(input.request.sourceWallet)) {
    throw new MarcoBridgeError('WALLET_REQUIRED', 'Connected wallet does not match the source wallet.')
  }
  await assertWalletNativePreflight({
    request: input.request,
    quote,
    signer,
    signerAddress,
    approvalRequired: false,
  })

  const build = buildMarcoBridgeTransactions(
    { ...input.request, allowanceLD: input.allowanceLD },
    quote,
    input.authority,
  )
  assertBuildReady(build)

  let sourceTx = ''
  for (const tx of build.transactions) {
    if (tx.family !== 'evm') {
      throw new MarcoBridgeError('WALLET_REQUIRED', 'Unexpected Solana transaction on an EVM source route.')
    }
    if (tx.purpose === 'approve') {
      throw new MarcoBridgeError('WALLET_REQUIRED', 'MARCO approval must be confirmed before the bridge send.')
    }
    const evmTx = tx as UnsignedEvmBridgeTx
    const sent = await signer.sendTransaction({
      to: evmTx.to,
      data: evmTx.data,
      value: evmTx.value,
      chainId: evmTx.chainId,
    })
    if (evmTx.purpose === 'oft_send') sourceTx = sent.hash
  }
  if (!sourceTx) throw new MarcoBridgeError('SOURCE_FAILED', 'The source send was not submitted.')
  return {
    status: 'submitted',
    sourceTx,
    message: MARCO_BRIDGE_SUBMITTED_COPY,
  }
}
