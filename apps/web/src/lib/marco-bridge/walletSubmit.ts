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
      'SOLANA_PAUSED',
      'Solana source send is prepared. Unpause the certified OFT store before signing.',
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
      throw new MarcoBridgeError('SOLANA_PAUSED', 'Solana OFT send requires the store to be unpaused.')
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
    message: 'Transaction submitted. Track this same LayerZero GUID until delivered; do not resend.',
  }
}
