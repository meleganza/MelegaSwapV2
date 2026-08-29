import { ethers } from 'ethers'
import type { CanonicalMmnRouteState } from './routeAuthority'
import { assertMarcoRouteExecutable } from './executionGate'
import type { MarcoBridgeQuoteRequest } from './service'
import { MarcoBridgeError, type MarcoBridgeQuote, type MarcoBridgeTracking } from './types'
import { destinationToBytes32, parseBridgeAmount } from './validation'
import { MARCO_WAVE1_NETWORKS } from './wave1Registry'

const ERC20_ABI = [
  'function allowance(address owner,address spender) view returns (uint256)',
  'function approve(address spender,uint256 amount) returns (bool)',
] as const

const OFT_SEND_ABI = [
  'function send((uint32 dstEid,bytes32 to,uint256 amountLD,uint256 minAmountLD,bytes extraOptions,bytes composeMsg,bytes oftCmd) sendParam,(uint256 nativeFee,uint256 lzTokenFee) fee,address refundAddress) payable returns ((bytes32 guid,uint64 nonce,(uint256 nativeFee,uint256 lzTokenFee) fee) msgReceipt,(uint256 amountSentLD,uint256 amountReceivedLD) oftReceipt)',
  'event OFTSent(bytes32 indexed guid,uint32 dstEid,address indexed fromAddress,uint256 amountSentLD,uint256 amountReceivedLD)',
] as const

const QUOTE_MAX_AGE_MS = 30_000

type MarcoEvmSigner = {
  getAddress(): Promise<string>
  provider?: { getNetwork(): Promise<{ chainId: number }> }
}

export async function executeEvmMarcoBridge(args: {
  request: MarcoBridgeQuoteRequest
  quote: MarcoBridgeQuote
  authority: CanonicalMmnRouteState
  signer: MarcoEvmSigner
}): Promise<MarcoBridgeTracking> {
  const { request, quote, authority, signer } = args
  const source = MARCO_WAVE1_NETWORKS[request.from]
  const destination = MARCO_WAVE1_NETWORKS[request.to]
  if (source.walletFamily !== 'evm' || source.chainId == null) {
    throw new MarcoBridgeError('WRONG_SOURCE_NETWORK', 'An EVM source wallet is required for this transfer.')
  }
  assertMarcoRouteExecutable(authority, request.from, request.to)
  if (!quote.executionEnabled || quote.routePaused || !quote.publiclyActive) {
    throw new MarcoBridgeError('PUBLIC_ACTIVATION_REQUIRED', 'The signed quote is not executable.')
  }
  if (Date.now() - Date.parse(quote.quotedAt) > QUOTE_MAX_AGE_MS) {
    throw new MarcoBridgeError('STALE_QUOTE', 'The LayerZero fee quote expired. Refresh it before signing.')
  }

  const signerAddress = await signer.getAddress()
  if (signerAddress.toLowerCase() !== request.sourceWallet.toLowerCase()) {
    throw new MarcoBridgeError('WRONG_SOURCE_NETWORK', 'The connected wallet changed after quote review.')
  }
  const signerNetwork = await signer.provider?.getNetwork()
  if (!signerNetwork || signerNetwork.chainId !== source.chainId) {
    throw new MarcoBridgeError('WRONG_SOURCE_NETWORK', `Switch your wallet to ${source.label}.`)
  }
  const amount = parseBridgeAmount(request.amount, source.tokenDecimals)
  if (!amount) throw new MarcoBridgeError('QUOTE_FAILED', 'The MARCO amount is invalid.')
  const nativeFee = ethers.utils.parseUnits(quote.nativeFee, 18)
  const sendParam = {
    dstEid: destination.layerZeroEid,
    to: destinationToBytes32(request.destinationWallet, destination.walletFamily),
    amountLD: amount.amountLD,
    minAmountLD: amount.amountLD,
    extraOptions: '0x',
    composeMsg: '0x',
    oftCmd: '0x',
  }

  if (authority.networks.find((network) => network.id === request.from)?.requires_approval) {
    const token = new ethers.Contract(source.marcoIdentity, ERC20_ABI, signer as ethers.Signer)
    const allowance = await token.allowance(signerAddress, source.endpointContract)
    if (allowance.lt(amount.amountLD)) {
      const approval = await token.approve(source.endpointContract, amount.amountLD)
      const approvalReceipt = await approval.wait(1)
      if (approvalReceipt.status !== 1) throw new MarcoBridgeError('SOURCE_FAILED', 'MARCO approval failed.')
    }
  }

  const oft = new ethers.Contract(source.endpointContract, OFT_SEND_ABI, signer as ethers.Signer)
  const transfer = await oft.send(sendParam, { nativeFee, lzTokenFee: 0 }, signerAddress, { value: nativeFee })
  const receipt = await transfer.wait(1)
  if (receipt.status !== 1) throw new MarcoBridgeError('SOURCE_FAILED', 'The source bridge transaction failed.')
  let guid: string | undefined
  for (const log of receipt.logs) {
    try {
      const parsed = oft.interface.parseLog(log)
      if (parsed.name === 'OFTSent') guid = parsed.args.guid
    } catch {
      // Ignore unrelated logs emitted by EndpointV2 and the token.
    }
  }
  return { status: 'source-confirmed', sourceTx: receipt.transactionHash, guid }
}
