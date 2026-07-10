import { Transaction, TransactionType } from 'state/info/types'

export interface RpcSwapIndexerMeta {
  source: 'bsc-rpc-log-indexer'
  pairAddress: string
  fromBlock: number
  toBlock: number
  latestIndexedBlock: number
  chainHead: number
  indexingLag: number
  lastSuccessfulSync: string
  eventCount: number
  status: 'ready' | 'empty' | 'error' | 'unavailable'
  reason?: string
}

export interface RpcSwapIndexerResponse {
  transactions: Transaction[]
  meta: RpcSwapIndexerMeta
}

export async function fetchRpcProtocolTransactions(
  pairAddress?: string,
  blockSpan = 50_000,
): Promise<RpcSwapIndexerResponse | undefined> {
  try {
    const params = new URLSearchParams()
    if (pairAddress) params.set('pair', pairAddress)
    params.set('blockSpan', String(blockSpan))
    const res = await fetch(`/api/runtime/swaps?${params.toString()}`)
    if (!res.ok) return undefined
    return (await res.json()) as RpcSwapIndexerResponse
  } catch {
    return undefined
  }
}
