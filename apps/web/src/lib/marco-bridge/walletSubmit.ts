import { Interface } from '@ethersproject/abi'
import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
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
import { assertMarcoBridgePreflight } from './preflight'
import type { CanonicalMmnRouteState } from './routeAuthority'
import { ensureRobinhoodWalletNetwork } from './robinhoodChain'
import { requestMarcoBridgeQuote, type MarcoBridgeQuoteRequest } from './service'
import { ERC20_APPROVE_IFACE, assertBuildReady, buildMarcoBridgeTransactions, type UnsignedEvmBridgeTx } from './transactionBuilder'
import { MarcoBridgeError, type MarcoBridgeQuote, type MarcoBridgeTracking } from './types'
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
  signer: WalletSubmitSigner
  ethereum?: EthereumProvider | null
  allowanceLD?: string
  requestQuote?: typeof requestMarcoBridgeQuote
}): Promise<MarcoBridgeTracking> {
  assertRouteExecutable(input.request.from, input.request.to, input.authority)
  const source = MARCO_WAVE1_NETWORKS[input.request.from]
  if (source.walletFamily === 'solana') {
    throw new MarcoBridgeError(
      'WALLET_REQUIRED',
      'Solana source submission is not publicly activated. Use BNB Smart Chain as the source.',
    )
  }
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

  const signerAddress = getAddress(await input.signer.getAddress())
  if (signerAddress !== getAddress(input.request.sourceWallet)) {
    throw new MarcoBridgeError('WALLET_REQUIRED', 'Connected wallet does not match the source wallet.')
  }
  await assertWalletNativePreflight({
    request: input.request,
    quote,
    signer: input.signer,
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
      throw new MarcoBridgeError('WALLET_REQUIRED', 'Solana source submission is not publicly activated.')
    }
    if (tx.purpose === 'approve') {
      throw new MarcoBridgeError('WALLET_REQUIRED', 'MARCO approval must be confirmed before the bridge send.')
    }
    const evmTx = tx as UnsignedEvmBridgeTx
    const sent = await input.signer.sendTransaction({
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
    message:
      "Your transaction was submitted successfully. We're tracking delivery across chains. Do not resend this transfer.",
  }
}
