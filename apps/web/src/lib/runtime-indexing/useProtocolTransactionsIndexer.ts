import { useMemo } from 'react'
import useSWR from 'swr'
import useSWRImmutable from 'swr/immutable'
import fetchTopTransactions from 'state/info/queries/protocol/transactions'
import { checkIsStableSwap } from 'state/info/constant'
import { useGetChainName } from 'state/info/hooks'
import {
  BLOCKED_SUBGRAPH_NOT_DEPLOYED,
  formatSubgraphBlockerReason,
  resolveSubgraphEndpointReport,
} from './resolveSubgraphEndpoint'
import { fetchDurableIndexerTransactions } from 'lib/bsc-indexer/client/fetchDurableIndexer'

const SWR_SETTINGS = {
  refreshInterval: 15000,
  errorRetryCount: 3,
  errorRetryInterval: 3000,
}

const INDEXER_SWR_SETTINGS = {
  refreshInterval: 30_000,
  revalidateOnFocus: false,
  errorRetryCount: 2,
}

export type IndexerLoadStatus = 'loading' | 'ready' | 'error' | 'unavailable'

export interface IndexerActivityState {
  status: IndexerLoadStatus
  source: string
  indexer: string
  lastAttempt: string
  reason?: string
  blockerCode?: typeof BLOCKED_SUBGRAPH_NOT_DEPLOYED
  configuredEndpoint?: string | null
  latestIndexedBlock?: number
  chainHead?: number
  indexingLag?: number
}

export function useProtocolTransactionsIndexer(pairAddress?: string) {
  const chainName = useGetChainName()
  const subgraphReport = useMemo(() => resolveSubgraphEndpointReport(), [])
  const type = checkIsStableSwap() ? 'stableSwap' : 'swap'
  const useSubgraph = Boolean(chainName && subgraphReport.melegaNativeConfigured)
  const useDurableIndexer = Boolean(chainName === 'BSC' && !subgraphReport.melegaNativeConfigured && !checkIsStableSwap())

  const swrKey = useSubgraph ? [`info/protocol/updateProtocolTransactionsData/${type}`, chainName] : null

  const { data, error, isValidating } = useSWRImmutable(
    swrKey,
    () => fetchTopTransactions(chainName!),
    SWR_SETTINGS,
  )

  const {
    data: indexerPayload,
    error: indexerError,
    isValidating: indexerValidating,
  } = useSWR(
    useDurableIndexer ? ['durable-indexer/transactions', chainName, pairAddress] : null,
    () => fetchDurableIndexerTransactions({ pairAddress, limit: 80 }),
    INDEXER_SWR_SETTINGS,
  )

  const transactions = useMemo(() => {
    if (useSubgraph && Array.isArray(data)) return data
    if (useDurableIndexer && indexerPayload?.transactions?.length) return indexerPayload.transactions
    return undefined
  }, [useSubgraph, data, useDurableIndexer, indexerPayload])

  const indexerState = useMemo((): IndexerActivityState => {
    const lastAttempt = new Date().toISOString()

    if (useDurableIndexer) {
      const meta = indexerPayload?.meta
      if (indexerPayload?.transactions?.length) {
        return {
          source: meta?.source ?? 'bsc-durable-indexer',
          configuredEndpoint: null,
          status: 'ready',
          indexer: 'bsc-durable-event-store',
          lastAttempt: meta?.lastSuccessfulSync ?? lastAttempt,
          latestIndexedBlock: meta?.lastIndexedBlock,
          chainHead: meta?.chainHead,
          indexingLag: meta?.indexingLag,
        }
      }
      if (indexerError) {
        return {
          source: 'bsc-durable-indexer',
          configuredEndpoint: null,
          status: 'error',
          indexer: 'bsc-durable-event-store',
          lastAttempt,
          reason: indexerError instanceof Error ? indexerError.message : 'Durable indexer request failed',
          blockerCode: subgraphReport.blockerCode ?? undefined,
        }
      }
      if (!indexerValidating && meta?.status === 'empty') {
        return {
          source: 'bsc-durable-indexer',
          configuredEndpoint: null,
          status: 'ready',
          indexer: 'bsc-durable-event-store',
          lastAttempt,
          reason: meta.reason ?? 'No events in durable store for query',
          latestIndexedBlock: meta?.lastIndexedBlock,
          chainHead: meta?.chainHead,
          indexingLag: meta?.indexingLag,
        }
      }
      if (indexerValidating && !indexerPayload) {
        return {
          source: 'bsc-durable-indexer',
          configuredEndpoint: null,
          status: 'loading',
          indexer: 'bsc-durable-event-store',
          lastAttempt,
          reason: 'Loading indexed events',
        }
      }
      return {
        source: 'bsc-durable-indexer',
        configuredEndpoint: null,
        status: 'unavailable',
        indexer: 'bsc-durable-event-store',
        lastAttempt,
        reason:
          meta?.reason ??
          'Durable indexer not populated — configure BLOB_READ_WRITE_TOKEN and run /api/indexer/run',
        blockerCode: subgraphReport.blockerCode ?? undefined,
        latestIndexedBlock: meta?.lastIndexedBlock,
        chainHead: meta?.chainHead,
        indexingLag: meta?.indexingLag,
      }
    }

    const base = {
      source: 'melega-subgraph',
      configuredEndpoint: subgraphReport.configuredEndpoint,
    }
    const subgraphBlockerReason = subgraphReport.blockerCode
      ? formatSubgraphBlockerReason(subgraphReport)
      : undefined

    if (!chainName) {
      return {
        ...base,
        status: 'unavailable',
        indexer: 'unconfigured',
        lastAttempt,
        reason: 'Chain context not resolved for subgraph queries',
        blockerCode: subgraphReport.blockerCode ?? undefined,
      }
    }
    if (!subgraphReport.melegaNativeConfigured) {
      return {
        ...base,
        status: 'error',
        indexer: `${chainName}-${type}`,
        lastAttempt,
        reason: subgraphBlockerReason,
        blockerCode: subgraphReport.blockerCode ?? undefined,
      }
    }
    if (Array.isArray(data)) {
      if (data.length === 0 && subgraphReport.blockerCode) {
        return {
          ...base,
          status: 'error',
          indexer: `${chainName}-${type}`,
          lastAttempt,
          reason: subgraphBlockerReason,
          blockerCode: subgraphReport.blockerCode,
        }
      }
      return {
        ...base,
        status: 'ready',
        indexer: `${chainName}-${type}`,
        lastAttempt,
      }
    }
    if (error) {
      return {
        ...base,
        status: 'error',
        indexer: `${chainName}-${type}`,
        lastAttempt,
        reason: subgraphBlockerReason ?? (error instanceof Error ? error.message : 'Subgraph transaction query failed'),
        blockerCode: subgraphReport.blockerCode ?? undefined,
      }
    }
    if (!isValidating && data === undefined) {
      return {
        ...base,
        status: 'error',
        indexer: `${chainName}-${type}`,
        lastAttempt,
        reason: subgraphBlockerReason ?? 'Subgraph returned no transaction payload',
        blockerCode: subgraphReport.blockerCode ?? undefined,
      }
    }
    return {
      ...base,
      status: 'loading',
      indexer: `${chainName}-${type}`,
      lastAttempt,
      reason: 'Subgraph transactions loading',
    }
  }, [
    chainName,
    data,
    error,
    isValidating,
    type,
    subgraphReport,
    useDurableIndexer,
    indexerPayload,
    indexerError,
    indexerValidating,
  ])

  return {
    transactions,
    indexerState,
    subgraphReport,
    isActivityIndexing: indexerState.status === 'loading',
  }
}
