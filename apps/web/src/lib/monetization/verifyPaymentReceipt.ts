import { FEATURED_PAYMENT_TOKENS, type FeaturedPayAsset } from 'lib/featured-placement/constants'

const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
const TX_HASH = /^0x[a-fA-F0-9]{64}$/

type RpcTransaction = {
  hash?: string
  from?: string
  to?: string | null
  value?: string
  blockNumber?: string | null
}

type RpcReceipt = {
  transactionHash?: string
  from?: string
  to?: string | null
  status?: string | number | null
  blockNumber?: string | null
  logs?: Array<{ address?: string; topics?: string[]; data?: string }>
}

export type VerifiedPaymentReceipt = {
  ok: boolean
  reason?: string
  blockNumber?: string
  transactionHash?: string
}

type FetchLike = typeof fetch

function normalize(value?: string | null): string {
  return (value || '').toLowerCase()
}

function statusSucceeded(status: RpcReceipt['status']): boolean {
  return status === '0x1' || status === 1 || status === '1' || status === 'success'
}

function decodeTopicAddress(topic?: string): string {
  const hex = normalize(topic).replace(/^0x/, '')
  return hex.length >= 40 ? `0x${hex.slice(-40)}` : ''
}

function safeBigInt(value?: string | null): bigint | null {
  try {
    return BigInt(value || '0x0')
  } catch {
    return null
  }
}

async function rpcCall<T>(rpcUrl: string, method: string, params: unknown[], fetcher: FetchLike): Promise<T | null> {
  const signal =
    typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
      ? AbortSignal.timeout(8_000)
      : undefined
  const response = await fetcher(rpcUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: method, method, params }),
    signal,
  })
  if (!response.ok) throw new Error(`RPC_HTTP_${response.status}`)
  const payload = (await response.json()) as { result?: T | null; error?: { message?: string } }
  if (payload.error) throw new Error(payload.error.message || 'RPC_ERROR')
  return payload.result ?? null
}

/**
 * Certifies a BNB Chain payment from canonical RPC data. Client-submitted receipts are never trusted.
 * The transaction sender, destination, amount, token contract, transfer log and mined status must all match.
 */
export async function verifyBscPaymentReceipt(input: {
  transactionHash: string
  buyerWallet: string
  paymentAsset: FeaturedPayAsset
  tokenAmountRaw: string
  treasuryWallet: string
  rpcUrl?: string
  fetcher?: FetchLike
}): Promise<VerifiedPaymentReceipt> {
  if (!TX_HASH.test(input.transactionHash)) return { ok: false, reason: 'INVALID_TX_HASH' }

  const rpcUrl =
    input.rpcUrl || process.env.BSC_RPC_URL || process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-rpc.publicnode.com'
  const fetcher = input.fetcher || fetch

  let transaction: RpcTransaction | null
  let receipt: RpcReceipt | null
  try {
    ;[transaction, receipt] = await Promise.all([
      rpcCall<RpcTransaction>(rpcUrl, 'eth_getTransactionByHash', [input.transactionHash], fetcher),
      rpcCall<RpcReceipt>(rpcUrl, 'eth_getTransactionReceipt', [input.transactionHash], fetcher),
    ])
  } catch {
    return { ok: false, reason: 'RPC_VERIFICATION_UNAVAILABLE' }
  }

  if (!transaction || !receipt || !transaction.blockNumber || !receipt.blockNumber) {
    return { ok: false, reason: 'TX_NOT_MINED' }
  }
  if (
    normalize(transaction.hash) !== normalize(input.transactionHash) ||
    normalize(receipt.transactionHash) !== normalize(input.transactionHash)
  ) {
    return { ok: false, reason: 'TX_HASH_MISMATCH' }
  }
  if (!statusSucceeded(receipt.status)) return { ok: false, reason: 'TX_FAILED' }
  if (
    normalize(transaction.from) !== normalize(input.buyerWallet) ||
    (receipt.from && normalize(receipt.from) !== normalize(input.buyerWallet))
  ) {
    return { ok: false, reason: 'BAD_SENDER' }
  }

  const needed = safeBigInt(input.tokenAmountRaw)
  if (needed === null || needed <= 0n) return { ok: false, reason: 'BAD_QUOTED_AMOUNT' }

  const treasury = normalize(input.treasuryWallet)
  const token = FEATURED_PAYMENT_TOKENS[input.paymentAsset]
  if (token.kind === 'native') {
    const value = safeBigInt(transaction.value)
    if (normalize(transaction.to) !== treasury || normalize(receipt.to) !== treasury) {
      return { ok: false, reason: 'BAD_DESTINATION' }
    }
    if (value === null || value < needed) return { ok: false, reason: 'BAD_AMOUNT' }
  } else {
    const tokenAddress = normalize(token.address)
    if (normalize(transaction.to) !== tokenAddress || normalize(receipt.to) !== tokenAddress) {
      return { ok: false, reason: 'BAD_TOKEN' }
    }
    const transfer = (receipt.logs || []).find((log) => {
      if (normalize(log.address) !== tokenAddress) return false
      if (normalize(log.topics?.[0]) !== TRANSFER_TOPIC) return false
      if (decodeTopicAddress(log.topics?.[1]) !== normalize(input.buyerWallet)) return false
      if (decodeTopicAddress(log.topics?.[2]) !== treasury) return false
      const amount = safeBigInt(log.data)
      return amount !== null && amount >= needed
    })
    if (!transfer) return { ok: false, reason: 'TRANSFER_NOT_FOUND' }
  }

  return {
    ok: true,
    blockNumber: receipt.blockNumber,
    transactionHash: input.transactionHash.toLowerCase(),
  }
}
