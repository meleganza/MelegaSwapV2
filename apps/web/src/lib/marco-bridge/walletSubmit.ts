import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { assertRouteExecutable } from './executableRoutes'
import type { CanonicalMmnRouteState } from './routeAuthority'
import { ensureRobinhoodWalletNetwork } from './robinhoodChain'
import { requestMarcoBridgeQuote, type MarcoBridgeQuoteRequest } from './service'
import { assertBuildReady, buildMarcoBridgeTransactions, type UnsignedEvmBridgeTx } from './transactionBuilder'
import { MarcoBridgeError, type MarcoBridgeTracking } from './types'
import { ERC20_APPROVE_IFACE } from './transactionBuilder'
import { MARCO_WAVE1_NETWORKS } from './wave1Registry'

export type WalletSubmitSigner = {
  getAddress(): Promise<string>
  sendTransaction(tx: { to: string; data: string; value?: string; chainId?: number }): Promise<{ hash: string }>
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

export async function submitMarcoApprovalFromWallet(input: {
  request: MarcoBridgeQuoteRequest
  authority: CanonicalMmnRouteState
  signer: WalletSubmitSigner
  allowanceLD?: string
}): Promise<string> {
  assertRouteExecutable(input.request.from, input.request.to, input.authority)
  const quote = await requestMarcoBridgeQuote(input.request)
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
  const sent = await input.signer.sendTransaction({
    to: approval.to,
    data: approval.data,
    value: approval.value,
    chainId: approval.chainId,
  })
  return sent.hash
}

export async function submitMarcoBridgeFromWallet(input: {
  request: MarcoBridgeQuoteRequest
  authority: CanonicalMmnRouteState
  signer: WalletSubmitSigner
  ethereum?: EthereumProvider | null
  allowanceLD?: string
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

  const quote = await requestMarcoBridgeQuote(input.request)
  if (quote.quotedAt) {
    const ageMs = Date.now() - Date.parse(quote.quotedAt)
    if (Number.isFinite(ageMs) && ageMs > 60_000) {
      throw new MarcoBridgeError('QUOTE_FAILED', 'The live quote expired. Request a new quote before signing.')
    }
  }

  const build = buildMarcoBridgeTransactions(
    { ...input.request, allowanceLD: input.allowanceLD },
    quote,
    input.authority,
  )
  assertBuildReady(build)
  const signerAddress = getAddress(await input.signer.getAddress())
  if (signerAddress !== getAddress(input.request.sourceWallet)) {
    throw new MarcoBridgeError('WALLET_REQUIRED', 'Connected wallet does not match the source wallet.')
  }

  let sourceTx = ''
  for (const tx of build.transactions) {
    if (tx.family !== 'evm') {
      throw new MarcoBridgeError('WALLET_REQUIRED', 'Solana source submission is not publicly activated.')
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
