import { useMemo } from 'react'
import useSWRImmutable from 'swr/immutable'
import fetchTopTransactions from 'state/info/queries/protocol/transactions'
import { checkIsStableSwap } from 'state/info/constant'
import { useGetChainName } from 'state/info/hooks'

const SWR_SETTINGS = {
  refreshInterval: 15000,
  errorRetryCount: 3,
  errorRetryInterval: 3000,
}

export type IndexerLoadStatus = 'loading' | 'ready' | 'error' | 'unavailable'

export interface IndexerActivityState {
  status: IndexerLoadStatus
  source: string
  indexer: string
  lastAttempt: string
  reason?: string
}

export function useProtocolTransactionsIndexer() {
  const chainName = useGetChainName()
  const type = checkIsStableSwap() ? 'stableSwap' : 'swap'
  const swrKey = chainName ? [`info/protocol/updateProtocolTransactionsData/${type}`, chainName] : null

  const { data, error, isValidating } = useSWRImmutable(
    swrKey,
    () => fetchTopTransactions(chainName!),
    SWR_SETTINGS,
  )

  const indexerState = useMemo((): IndexerActivityState => {
    const lastAttempt = new Date().toISOString()
    if (!chainName) {
      return {
        status: 'unavailable',
        source: 'melega-subgraph',
        indexer: 'unconfigured',
        lastAttempt,
        reason: 'Chain context not resolved for subgraph queries',
      }
    }
    if (Array.isArray(data)) {
      return {
        status: 'ready',
        source: 'melega-subgraph',
        indexer: `${chainName}-${type}`,
        lastAttempt,
      }
    }
    if (error) {
      return {
        status: 'error',
        source: 'melega-subgraph',
        indexer: `${chainName}-${type}`,
        lastAttempt,
        reason: error instanceof Error ? error.message : 'Subgraph transaction query failed',
      }
    }
    if (!isValidating && data === undefined) {
      return {
        status: 'error',
        source: 'melega-subgraph',
        indexer: `${chainName}-${type}`,
        lastAttempt,
        reason: 'Subgraph returned no transaction payload',
      }
    }
    return {
      status: 'loading',
      source: 'melega-subgraph',
      indexer: `${chainName}-${type}`,
      lastAttempt,
      reason: 'Subgraph transactions loading',
    }
  }, [chainName, data, error, isValidating, type])

  return {
    transactions: Array.isArray(data) ? data : undefined,
    indexerState,
    isActivityIndexing: indexerState.status === 'loading',
  }
}
