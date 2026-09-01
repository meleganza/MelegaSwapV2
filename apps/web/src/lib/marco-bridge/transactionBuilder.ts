import { Interface } from '@ethersproject/abi'
import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { isActivationRoute, routeExecutionBlockers } from './executableRoutes'
import type { CanonicalMmnRouteState } from './routeAuthority'
import { LAYERZERO_SOLANA_V2_MAINNET_ALT } from './solanaOftProtocol'
import { SOLANA_OFT_ESCROW, SOLANA_OFT_PROGRAM_ID, SOLANA_LZ_ENDPOINT_PROGRAM_ID } from './solanaUnpause'
import type { MarcoBridgeNetworkId, MarcoBridgeQuote } from './types'
import { MarcoBridgeError } from './types'
import { destinationToBytes32, parseBridgeAmount } from './validation'
import { MARCO_WAVE1_NETWORKS } from './wave1Registry'
import type { MarcoBridgeSendParam } from './quoteTransport'
import { ROBINHOOD_CHAIN_ID, ROBINHOOD_EXPLORER_URL } from './robinhoodChain'

export const ERC20_APPROVE_IFACE = new Interface([
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
])

export const OFT_SEND_IFACE = new Interface([
  'function send((uint32 dstEid,bytes32 to,uint256 amountLD,uint256 minAmountLD,bytes extraOptions,bytes composeMsg,bytes oftCmd) sendParam,(uint256 nativeFee,uint256 lzTokenFee) fee,address refundAddress) payable returns ((bytes32 guid,uint64 nonce,uint256 nativeFee,uint256 lzTokenFee) messagingReceipt,(uint256 amountSentLD,uint256 amountReceivedLD) oftReceipt)',
])

export type UnsignedEvmBridgeTx = {
  family: 'evm'
  purpose: 'approve' | 'oft_send'
  chainId: number
  from: string
  to: string
  data: string
  value: string
  nativeFeeSymbol: 'BNB' | 'ETH'
}

export type UnsignedSolanaBridgeTx = {
  family: 'solana'
  purpose: 'oft_send'
  from: string
  programId: string
  store: string
  mint: string
  escrow: string
  endpointProgram: string
  destinationWallet: string
  amountLD: string
  nativeFeeLamports: string
  dstEid: number
  toBytes32: string
  tokenAccount?: string
  optionsHex?: string
  lookupTable?: string
  quoteIdentity?: string
  serializedTransaction?: string
}

export type MarcoBridgeBuiltTx = UnsignedEvmBridgeTx | UnsignedSolanaBridgeTx

export type MarcoBridgeBuildRequest = {
  from: MarcoBridgeNetworkId
  to: MarcoBridgeNetworkId
  amount: string
  sourceWallet: string
  destinationWallet: string
  allowanceLD?: string
}

export type MarcoBridgeBuild = {
  from: MarcoBridgeNetworkId
  to: MarcoBridgeNetworkId
  amount: string
  sourceWallet: string
  destinationWallet: string
  sendParam: MarcoBridgeSendParam
  quote: MarcoBridgeQuote
  approvalRequired: boolean
  executable: boolean
  blockers: string[]
  transactions: MarcoBridgeBuiltTx[]
}

export function buildMarcoSendParam(
  from: MarcoBridgeNetworkId,
  to: MarcoBridgeNetworkId,
  amount: string,
  destinationWallet: string,
): { sendParam: MarcoBridgeSendParam; amountLD: BigNumber } {
  const source = MARCO_WAVE1_NETWORKS[from]
  const destination = MARCO_WAVE1_NETWORKS[to]
  const parsed = parseBridgeAmount(amount, source.tokenDecimals)
  if (!parsed) {
    throw new MarcoBridgeError('QUOTE_FAILED', 'Enter a dust-free MARCO amount with no more than 6 decimal places.')
  }
  return {
    amountLD: parsed.amountLD,
    sendParam: {
      dstEid: destination.layerZeroEid,
      to: destinationToBytes32(destinationWallet, destination.walletFamily),
      amountLD: parsed.amountLD.toString(),
      minAmountLD: parsed.amountLD.toString(),
      extraOptions: '0x',
      composeMsg: '0x',
      oftCmd: '0x',
    },
  }
}

export function buildMarcoBridgeTransactions(
  request: MarcoBridgeBuildRequest,
  quote: MarcoBridgeQuote,
  authority: CanonicalMmnRouteState,
): MarcoBridgeBuild {
  if (!isActivationRoute(request.from, request.to)) {
    throw new MarcoBridgeError('UNSUPPORTED_ROUTE', 'This builder only encodes BNB↔Robinhood and BNB↔Solana.')
  }
  const source = MARCO_WAVE1_NETWORKS[request.from]
  const canonicalSource = authority.networks.find((network) => network.id === request.from)
  if (!canonicalSource) throw new MarcoBridgeError('CANONICAL_CONFIG_MISSING', 'Canonical source binding is missing.')

  const { sendParam, amountLD } = buildMarcoSendParam(
    request.from,
    request.to,
    request.amount,
    request.destinationWallet,
  )
  if (sendParam.dstEid !== MARCO_WAVE1_NETWORKS[request.to].layerZeroEid) {
    throw new MarcoBridgeError('CANONICAL_CONFIG_MISSING', 'Destination EID mismatch.')
  }

  const blockers = routeExecutionBlockers(request.from, request.to, authority)
  const executable = blockers.length === 0
  const approvalRequired = canonicalSource.requires_approval
  const allowance = request.allowanceLD ? BigNumber.from(request.allowanceLD) : BigNumber.from(0)
  const needsApprove = approvalRequired && allowance.lt(amountLD)
  const nativeFeeWei = quote.nativeFeeWei

  const transactions: MarcoBridgeBuiltTx[] = []
  if (source.walletFamily === 'evm' && source.chainId != null) {
    const from = getAddress(request.sourceWallet)
    if (needsApprove) {
      transactions.push({
        family: 'evm',
        purpose: 'approve',
        chainId: source.chainId,
        from,
        to: getAddress(canonicalSource.token),
        data: ERC20_APPROVE_IFACE.encodeFunctionData('approve', [canonicalSource.endpoint_contract, amountLD]),
        value: '0x0',
        nativeFeeSymbol: source.nativeFeeSymbol === 'BNB' ? 'BNB' : 'ETH',
      })
    }
    transactions.push({
      family: 'evm',
      purpose: 'oft_send',
      chainId: source.chainId,
      from,
      to: getAddress(canonicalSource.endpoint_contract),
      data: OFT_SEND_IFACE.encodeFunctionData('send', [
        [
          sendParam.dstEid,
          sendParam.to,
          sendParam.amountLD,
          sendParam.minAmountLD,
          sendParam.extraOptions,
          sendParam.composeMsg,
          sendParam.oftCmd,
        ],
        [nativeFeeWei, 0],
        from,
      ]),
      value: BigNumber.from(nativeFeeWei).toHexString(),
      nativeFeeSymbol: source.nativeFeeSymbol === 'BNB' ? 'BNB' : 'ETH',
    })
  } else {
    transactions.push({
      family: 'solana',
      purpose: 'oft_send',
      from: request.sourceWallet,
      programId: SOLANA_OFT_PROGRAM_ID,
      store: MARCO_WAVE1_NETWORKS.solana.endpointContract,
      mint: MARCO_WAVE1_NETWORKS.solana.marcoIdentity,
      escrow: quote.binding?.escrow ?? SOLANA_OFT_ESCROW,
      endpointProgram: SOLANA_LZ_ENDPOINT_PROGRAM_ID,
      destinationWallet: request.destinationWallet,
      amountLD: sendParam.amountLD,
      nativeFeeLamports: nativeFeeWei,
      dstEid: sendParam.dstEid,
      toBytes32: sendParam.to,
      tokenAccount: quote.binding?.tokenAccount,
      optionsHex: quote.binding?.optionsHex,
      lookupTable: quote.binding?.lookupTable ?? LAYERZERO_SOLANA_V2_MAINNET_ALT,
      quoteIdentity: quote.binding?.identity,
    })
  }

  return {
    from: request.from,
    to: request.to,
    amount: request.amount,
    sourceWallet: request.sourceWallet,
    destinationWallet: request.destinationWallet,
    sendParam,
    quote,
    approvalRequired: needsApprove,
    executable,
    blockers,
    transactions: executable ? transactions : [],
  }
}

export function assertBuildReady(build: MarcoBridgeBuild): void {
  if (!build.executable) {
    throw new MarcoBridgeError(
      build.blockers.some((blocker) => /paused/i.test(blocker)) ? 'SOLANA_PAUSED' : 'PUBLIC_ACTIVATION_REQUIRED',
      build.blockers[0] ?? 'Bridge submission is not executable.',
    )
  }
  if (build.sendParam.dstEid === 0) throw new MarcoBridgeError('CANONICAL_CONFIG_MISSING', 'Destination EID is missing.')
}

export function robinhoodExplorerTx(hash: string): string {
  return `${ROBINHOOD_EXPLORER_URL}/tx/${hash}`
}

export { ROBINHOOD_CHAIN_ID }
