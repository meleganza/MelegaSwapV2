import type { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'
import { readOnlyMarcoBridgeQuote, type MarcoBridgeQuoteReader } from 'lib/marco-bridge/quoteTransport'
import { fetchCanonicalRouteAuthority } from 'lib/marco-bridge/routeAuthority'
import { MarcoBridgeError, type MarcoBridgeNetworkId } from 'lib/marco-bridge/types'
import { isValidMarcoDestination } from 'lib/marco-bridge/validation'
import { MARCO_WAVE1_NETWORKS } from 'lib/marco-bridge/wave1Registry'

const OFT_QUOTE_ABI = [
  'function quoteSend((uint32 dstEid,bytes32 to,uint256 amountLD,uint256 minAmountLD,bytes extraOptions,bytes composeMsg,bytes oftCmd) sendParam,bool payInLzToken) view returns ((uint256 nativeFee,uint256 lzTokenFee) msgFee)',
  'function quoteOFT((uint32 dstEid,bytes32 to,uint256 amountLD,uint256 minAmountLD,bytes extraOptions,bytes composeMsg,bytes oftCmd) sendParam) view returns ((uint256 minAmountLD,uint256 maxAmountLD) oftLimit,(int256 feeAmountLD,string description)[] oftFeeDetails,(uint256 amountSentLD,uint256 amountReceivedLD) oftReceipt)',
] as const

const isNetworkId = (value: unknown): value is MarcoBridgeNetworkId =>
  typeof value === 'string' && Object.prototype.hasOwnProperty.call(MARCO_WAVE1_NETWORKS, value)

function resolveRpcUrl(source: MarcoBridgeNetworkId): string {
  if (source === 'bnb') {
    return process.env.BSC_RPC_URL || process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-rpc.publicnode.com'
  }
  if (source === 'base') {
    return process.env.BASE_RPC_URL || process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://base-rpc.publicnode.com'
  }
  if (source === 'robinhood') {
    return (
      process.env.ROBINHOOD_RPC_URL ||
      process.env.NEXT_PUBLIC_ROBINHOOD_RPC_URL ||
      'https://rpc.mainnet.chain.robinhood.com'
    )
  }
  if (source === 'solana') {
    throw new MarcoBridgeError('QUOTE_FAILED', 'Solana source quotes use the Solana OFT store, not an EVM RPC.')
  }
  throw new MarcoBridgeError('QUOTE_FAILED', `No read-only RPC is configured for ${source} source quotes.`)
}

function createEthersQuoteReader(source: MarcoBridgeNetworkId): MarcoBridgeQuoteReader {
  const sourceNetwork = MARCO_WAVE1_NETWORKS[source]
  if (sourceNetwork.chainId == null) {
    throw new MarcoBridgeError('QUOTE_FAILED', 'The source network is not EVM-compatible.')
  }
  const provider = new ethers.providers.StaticJsonRpcProvider(resolveRpcUrl(source), sourceNetwork.chainId)
  const contractFor = (endpointContract: string) => new ethers.Contract(endpointContract, OFT_QUOTE_ABI, provider)
  return {
    async quoteSend(endpointContract, sendParam) {
      const fee = await contractFor(endpointContract).quoteSend(sendParam, false)
      return { nativeFee: fee.nativeFee }
    },
    async quoteOft(endpointContract, sendParam) {
      const quote = await contractFor(endpointContract).quoteOFT(sendParam)
      return { amountReceivedLD: quote.oftReceipt.amountReceivedLD }
    },
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' })
  }

  try {
    const { from, to, amount, sourceWallet, destinationWallet } = req.body ?? {}
    if (!isNetworkId(from) || !isNetworkId(to) || typeof amount !== 'string') {
      throw new MarcoBridgeError('QUOTE_FAILED', 'Invalid bridge quote request.')
    }
    const source = MARCO_WAVE1_NETWORKS[from]
    if (
      typeof sourceWallet !== 'string' ||
      typeof destinationWallet !== 'string' ||
      !isValidMarcoDestination(sourceWallet, source.walletFamily)
    ) {
      throw new MarcoBridgeError('QUOTE_FAILED', 'A valid source wallet is required for a live quote.')
    }

    const authority = await fetchCanonicalRouteAuthority()
    if (from === 'solana') {
      const solana = authority.networks.find((network) => network.id === 'solana')
      const route = authority.routes.find((item) => item.from === from && item.to === to)
      if (solana?.paused || route?.paused) {
        throw new MarcoBridgeError('SOLANA_PAUSED', 'Solana OFT store is paused. Unpause is required before Solana source quotes.')
      }
      throw new MarcoBridgeError(
        'QUOTE_FAILED',
        'Solana source quoteSend is available only after the certified store is unpaused.',
      )
    }
    const quote = await readOnlyMarcoBridgeQuote(
      { from, to, amount, destinationWallet },
      authority,
      createEthersQuoteReader(from),
    )
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json(quote)
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'LayerZero quote is unavailable.'
    const code = cause instanceof MarcoBridgeError ? cause.code : 'QUOTE_FAILED'
    return res.status(code === 'INVALID_DESTINATION' ? 400 : 503).json({ error: code, message })
  }
}
