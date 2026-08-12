import { Interface } from '@ethersproject/abi'
import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { hexlify, hexZeroPad } from '@ethersproject/bytes'
import { solanaAddressToBytes32 } from './address'
import { MarcoBridgeError } from './errors'
import type {
  CanonicalBridgeAmount,
  EvmTransactionRequest,
  MarcoBridgeNetworkId,
  MarcoBridgeQuote,
  SolanaBridgeInstructionPlan,
} from './types'
import { getMarcoBridgeNetwork } from './wave1Registry'

const oftInterface = new Interface([
  'function quoteSend((uint32 dstEid,bytes32 to,uint256 amountLD,uint256 minAmountLD,bytes extraOptions,bytes composeMsg,bytes oftCmd) sendParam,bool payInLzToken) view returns ((uint256 nativeFee,uint256 lzTokenFee) fee)',
  'function send((uint32 dstEid,bytes32 to,uint256 amountLD,uint256 minAmountLD,bytes extraOptions,bytes composeMsg,bytes oftCmd) sendParam,(uint256 nativeFee,uint256 lzTokenFee) fee,address refundAddress) payable returns ((bytes32 guid,uint64 nonce,(uint256 nativeFee,uint256 lzTokenFee) fee) msgReceipt,(uint256 amountSentLD,uint256 amountReceivedLD) oftReceipt)',
])

const erc20Interface = new Interface(['function approve(address spender,uint256 amount) returns (bool)'])

const EMPTY_BYTES = '0x'

export function destinationWalletToBytes32(destination: MarcoBridgeNetworkId, wallet: string): string {
  const network = getMarcoBridgeNetwork(destination)
  if (network.walletFamily === 'evm') return hexZeroPad(getAddress(wallet), 32)
  return hexlify(solanaAddressToBytes32(wallet))
}

function buildSendParam(destination: MarcoBridgeNetworkId, destinationWallet: string, amount: CanonicalBridgeAmount) {
  const network = getMarcoBridgeNetwork(destination)
  return {
    dstEid: network.layerZeroEid,
    to: destinationWalletToBytes32(destination, destinationWallet),
    amountLD: amount.sendLD,
    minAmountLD: amount.sendLD,
    extraOptions: EMPTY_BYTES,
    composeMsg: EMPTY_BYTES,
    oftCmd: EMPTY_BYTES,
  }
}

function requireEvmNetwork(source: MarcoBridgeNetworkId) {
  const network = getMarcoBridgeNetwork(source)
  if (network.walletFamily !== 'evm' || network.chainId === null) {
    throw new MarcoBridgeError('WRONG_WALLET_FAMILY', 'This transaction requires a Solana wallet transport.')
  }
  return network
}

export function buildEvmQuoteCall(
  source: MarcoBridgeNetworkId,
  destination: MarcoBridgeNetworkId,
  destinationWallet: string,
  amount: CanonicalBridgeAmount,
): EvmTransactionRequest {
  const sourceNetwork = requireEvmNetwork(source)
  return {
    chainId: sourceNetwork.chainId as number,
    to: sourceNetwork.identity.protocolContractOrStore,
    data: oftInterface.encodeFunctionData('quoteSend', [buildSendParam(destination, destinationWallet, amount), false]),
    value: BigNumber.from(0),
  }
}

export function decodeEvmQuoteResult(data: string): { nativeFee: BigNumber; lzTokenFee: BigNumber } {
  const [fee] = oftInterface.decodeFunctionResult('quoteSend', data)
  return {
    nativeFee: BigNumber.from(fee.nativeFee ?? fee[0]),
    lzTokenFee: BigNumber.from(fee.lzTokenFee ?? fee[1]),
  }
}

export function buildEvmApprovalCall(source: MarcoBridgeNetworkId, amountLD: BigNumber): EvmTransactionRequest | null {
  const network = requireEvmNetwork(source)
  if (source !== 'bnb') return null
  return {
    chainId: network.chainId as number,
    to: network.identity.consumerTokenOrMint,
    data: erc20Interface.encodeFunctionData('approve', [network.identity.protocolContractOrStore, amountLD]),
    value: BigNumber.from(0),
  }
}

export function buildEvmSendCall(quote: MarcoBridgeQuote): EvmTransactionRequest {
  const source = requireEvmNetwork(quote.intent.from)
  const sendParam = buildSendParam(quote.intent.to, quote.intent.destinationWallet, quote.amount)
  return {
    chainId: source.chainId as number,
    to: source.identity.protocolContractOrStore,
    data: oftInterface.encodeFunctionData('send', [
      sendParam,
      { nativeFee: quote.nativeFee, lzTokenFee: quote.lzTokenFee },
      getAddress(quote.intent.sourceWallet),
    ]),
    value: quote.nativeFee,
  }
}

export function buildSolanaInstructionPlan(quote: MarcoBridgeQuote): SolanaBridgeInstructionPlan {
  if (quote.intent.from !== 'solana') {
    throw new MarcoBridgeError('WRONG_WALLET_FAMILY', 'A Solana instruction plan requires Solana as source.')
  }
  const source = getMarcoBridgeNetwork('solana')
  return {
    oftStore: source.identity.protocolContractOrStore,
    destinationEid: getMarcoBridgeNetwork(quote.intent.to).layerZeroEid,
    destinationBytes32: destinationWalletToBytes32(quote.intent.to, quote.intent.destinationWallet),
    amountLD: quote.amount.sendLD,
    minAmountLD: quote.amount.sendLD,
    nativeFee: quote.nativeFee,
    quoteId: quote.quoteId,
  }
}
