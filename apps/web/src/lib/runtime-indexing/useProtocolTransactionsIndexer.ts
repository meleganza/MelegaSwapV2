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
import { fetchRpcProtocolTransactions } from './fetchRpcProtocolTransactions'

const SWR_SETTINGS = {
  refreshInterval: 15000,
  errorRetryCount: 3,
  errorRetryInterval: 3000,
}

const RPC_SWR_SETTINGS = {
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

export function useProtocolTransactionsIndexer() {
  const chainName = useGetChainName()
  const subgraphReport = useMemo(() => resolveSubgraphEndpointReport(), [])
  const type = checkIsStableSwap() ? 'stableSwap' : 'swap'
  const useSubgraph = Boolean(chainName && subgraphReport.melegaNativeConfigured)
  const useRpcFallback = Boolean(chainName === 'BSC' && !subgraphReport.melegaNativeConfigured && !checkIsStableSwap())

  const swrKey = useSubgraph ? [`info/protocol/updateProtocolTransactionsData/${type}`, chainName] : null

  const { data, error, isValidating } = useSWRImmutable(
    swrKey,
    () => fetchTopTransactions(chainName!),
    SWR_SETTINGS,
  )

  const {
    data: rpcPayload,
    error: rpcError,
    isValidating: rpcValidating,
  } = useSWR(useRpcFallback ? ['rpc/protocol/transactions', chainName] : null, () => fetchRpcProtocolTransactions(), RPC_SWR_SETTINGS)

  const transactions = useMemo(() => {
    if (useSubgraph && Array.isArray(data)) return data
    if (useRpcFallback && rpcPayload?.transactions?.length) return rpcPayload.transactions
    return undefined
  }, [useSubgraph, data, useRpcFallback, rpcPayload])

  const indexerState = useMemo((): IndexerActivityState => {
    const lastAttempt = new Date().toISOString()

    if (useRpcFallback) {
      const meta = rpcPayload?.meta
      if (rpcPayload?.transactions?.length) {
        return {
          source: meta?.source ?? 'bsc-rpc-log-indexer',
          configuredEndpoint: null,
          status: 'ready',
          indexer: 'bsc-rpc-swap-indexer',
          lastAttempt: meta?.lastSuccessfulSync ?? lastAttempt,
          latestIndexedBlock: meta?.latestIndexedBlock,
          chainHead: meta?.chainHead,
          indexingLag: meta?.indexingLag,
        }
      }
      if (rpcError) {
        return {
          source: 'bsc-rpc-log-indexer',
          configuredEndpoint: null,
          status: 'error',
          indexer: 'bsc-rpc-swap-indexer',
          lastAttempt,
          reason: rpcError instanceof Error ? rpcError.message : 'RPC swap indexer request failed',
          blockerCode: subgraphReport.blockerCode ?? undefined,
        }
      }
      if (!rpcValidating && rpcPayload?.meta?.status === 'empty') {
        return {
          source: 'bsc-rpc-log-indexer',
          configuredEndpoint: null,
          status: 'ready',
          indexer: 'bsc-rpc-swap-indexer',
          lastAttempt,
          reason: rpcPayload.meta.reason ?? 'No swap events in scanned block range',
          latestIndexedBlock: rpcPayload.meta.latestIndexedBlock,
          chainHead: rpcPayload.meta.chainHead,
          indexingLag: rpcPayload.meta.indexingLag,
        }
      }
      if (rpcValidating && !rpcPayload) {
        return {
          source: 'bsc-rpc-log-indexer',
          configuredEndpoint: null,
          status: 'loading',
          indexer: 'bsc-rpc-swap-indexer',
          lastAttempt,
          reason: 'Scanning on-chain swap events',
        }
      }
      return {
        source: 'bsc-rpc-log-indexer',
        configuredEndpoint: null,
        status: 'unavailable',
        indexer: 'bsc-rpc-swap-indexer',
        lastAttempt,
        reason: rpcPayload?.meta?.reason ?? formatSubgraphBlockerReason(subgraphReport),
        blockerCode: subgraphReport.blockerCode ?? undefined,
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
  }, [chainName, data, error, isValidating, type, subgraphReport, useRpcFallback, rpcPayload, rpcError, rpcValidating])

  return {
    transactions,
    indexerState,
    subgraphReport,
    isActivityIndexing: indexerState.status === 'loading',
  }
}
