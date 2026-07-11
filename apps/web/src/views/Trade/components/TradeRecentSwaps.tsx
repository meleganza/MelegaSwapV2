import React, { useMemo } from 'react'
import { DATA_REASON_LABELS } from 'lib/data-policy/dataReasonCodes'
import { RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'
import type { TradeSwapRow } from '../useTradeTerminalData'
import TradeSwapsTable from './TradeSwapsTable'

export interface TradeRecentSwapsProps {
  rows: TradeSwapRow[]
  isIndexing?: boolean
  swapEmptyReason?: string
  missingReason?: string | null
  missingReasonDetail?: string
  swapDiagnostic?: {
    source: string
    indexer: string
    lastAttempt: string
    reason?: string
  }
}

export const TradeRecentSwaps: React.FC<TradeRecentSwapsProps> = ({
  rows,
  isIndexing,
  swapEmptyReason,
  missingReasonDetail,
  swapDiagnostic,
}) => {
  const emptyDescription = useMemo(() => {
    if (isIndexing) {
      return swapDiagnostic?.reason ?? 'Indexer request in progress'
    }
    if (swapDiagnostic?.reason) {
      return swapDiagnostic.reason
    }
    if (swapEmptyReason === 'DATA_SOURCE_NOT_CONFIGURED') {
      return 'Swap indexer not deployed'
    }
    if (swapEmptyReason === 'NO_EVENTS_INDEXED') {
      return swapDiagnostic?.source?.includes('bsc-indexer') || swapDiagnostic?.indexer?.includes('featured')
        ? 'Indexer scope: MARCO/WBNB featured pair — no swaps indexed yet'
        : DATA_REASON_LABELS.NO_EVENTS_INDEXED
    }
    if (missingReasonDetail) {
      return missingReasonDetail
    }
    if (swapEmptyReason && DATA_REASON_LABELS[swapEmptyReason as keyof typeof DATA_REASON_LABELS]) {
      return DATA_REASON_LABELS[swapEmptyReason as keyof typeof DATA_REASON_LABELS]
    }
    return 'Waiting for first indexed event'
  }, [isIndexing, swapEmptyReason, missingReasonDetail, swapDiagnostic])

  const technicalDetail = useMemo(() => {
    if (isIndexing) {
      return `Indexer request in progress · Source: ${swapDiagnostic?.source ?? 'melega-indexer'} · Indexer: ${swapDiagnostic?.indexer ?? 'loading'} · Last attempt: ${swapDiagnostic?.lastAttempt ? new Date(swapDiagnostic.lastAttempt).toLocaleString() : 'in progress'}`
    }
    if (swapDiagnostic) {
      return `Reason: ${swapDiagnostic.reason ?? DATA_REASON_LABELS.NO_EVENTS_INDEXED} · Source: ${swapDiagnostic.source} · Indexer: ${swapDiagnostic.indexer} · Last attempt: ${new Date(swapDiagnostic.lastAttempt).toLocaleString()}`
    }
    return missingReasonDetail
  }, [isIndexing, swapDiagnostic, missingReasonDetail])

  return (
    <TradeSwapsTable
      rows={rows}
      isIndexing={isIndexing}
      emptyTitle={RUNTIME_UNAVAILABLE_LABEL}
      emptyDescription={emptyDescription}
      technicalDetail={technicalDetail}
    />
  )
}

export default TradeRecentSwaps
