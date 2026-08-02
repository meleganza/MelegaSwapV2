/**
 * Liquidity Builder program inventory sync.
 * Scans Factory ProgramCreated, known program clones, and FeeSink fee events.
 * Safe to skip when RPC/blob unavailable — never invents programs.
 */
import { LB_CANONICAL_DEPLOYED_ADDRESSES } from 'config/constants/liquidityBuildingDeployment'
import { getBlockNumber, getLogsChunked } from 'lib/bsc-indexer/rpc/chunkedLogs'
import type { IndexerDeadline } from 'lib/bsc-indexer/indexer/indexerDeadline'
import {
  LB_FACTORY_ADDRESS,
  LB_FEE_SINK_ADDRESS,
  lbFactoryTopicsOrFilter,
  lbFeeTopicsOrFilter,
  lbProgramTopicsOrFilter,
} from './topics'
import { parseLbLog } from './parseEvents'
import { resolveLbProgramStore, type LbProgramStore } from './store'
import { LB_INDEXER_CHAIN_ID } from './types'

export const LB_PROGRAM_SYNC_MIN_REMAINING_MS = 10_000
const DEFAULT_LOOKBACK = 25_000
const MAX_PROGRAM_ADDRESSES_PER_RUN = 40

function isDeployed(addr: string | null | undefined): boolean {
  return Boolean(addr && /^0x[a-fA-F0-9]{40}$/.test(addr) && !/^0x0+$/.test(addr))
}

export type LbProgramSyncReport = {
  ok: boolean
  skipped?: boolean
  reason?: string
  added: number
  scannedBlocks: number
  factoryLogs: number
  programLogs: number
  feeLogs: number
  programCount: number
  partial?: boolean
}

export async function syncLbProgramInventory(opts?: {
  deadline?: IndexerDeadline
  store?: LbProgramStore
  lookbackBlocks?: number
}): Promise<LbProgramSyncReport> {
  const deadline = opts?.deadline
  if (deadline?.shouldStop()) {
    return { ok: true, skipped: true, reason: 'DEADLINE', added: 0, scannedBlocks: 0, factoryLogs: 0, programLogs: 0, feeLogs: 0, programCount: 0, partial: true }
  }
  if (deadline && deadline.remainingMs() <= LB_PROGRAM_SYNC_MIN_REMAINING_MS) {
    return { ok: true, skipped: true, reason: 'BUDGET', added: 0, scannedBlocks: 0, factoryLogs: 0, programLogs: 0, feeLogs: 0, programCount: 0 }
  }

  if (!isDeployed(LB_FACTORY_ADDRESS) || !isDeployed(LB_CANONICAL_DEPLOYED_ADDRESSES.lbFactory)) {
    return { ok: false, reason: 'FACTORY_UNBOUND', added: 0, scannedBlocks: 0, factoryLogs: 0, programLogs: 0, feeLogs: 0, programCount: 0 }
  }

  const store = opts?.store ?? resolveLbProgramStore()
  let chainHead: number
  try {
    chainHead = await getBlockNumber()
  } catch {
    return { ok: false, reason: 'RPC_UNAVAILABLE', added: 0, scannedBlocks: 0, factoryLogs: 0, programLogs: 0, feeLogs: 0, programCount: 0 }
  }

  const doc = await store.load()
  const lookback = opts?.lookbackBlocks ?? DEFAULT_LOOKBACK
  const factoryFrom = Math.max(
    0,
    (doc.cursor.factoryLastScannedBlock ?? Math.max(0, chainHead - lookback)) + (doc.cursor.factoryLastScannedBlock != null ? 1 : 0),
  )
  const toBlock = chainHead
  if (factoryFrom > toBlock) {
    return {
      ok: true,
      skipped: true,
      reason: 'CAUGHT_UP',
      added: 0,
      scannedBlocks: 0,
      factoryLogs: 0,
      programLogs: 0,
      feeLogs: 0,
      programCount: doc.programs.length,
    }
  }

  let factoryLogs = 0
  let programLogs = 0
  let feeLogs = 0
  let added = 0

  const { logs: createdLogs, aborted: factoryAborted } = await getLogsChunked({
    address: LB_FACTORY_ADDRESS,
    topics: lbFactoryTopicsOrFilter(),
    fromBlock: factoryFrom,
    toBlock,
    shouldAbort: () => Boolean(deadline?.shouldStop()),
  })
  factoryLogs = createdLogs.length
  const parsedCreated = createdLogs
    .map((l) =>
      parseLbLog(
        {
          address: l.address,
          topics: l.topics,
          data: l.data,
          transactionHash: l.transactionHash,
          logIndex: l.logIndex,
          blockNumber: l.blockNumber,
        },
        LB_INDEXER_CHAIN_ID,
      ),
    )
    .filter(Boolean)
  if (parsedCreated.length) {
    const r = await store.ingestEvents(parsedCreated as NonNullable<(typeof parsedCreated)[number]>[])
    added += r.added
  }

  const refreshed = await store.load()
  const programAddresses = refreshed.programs
    .map((p) => p.programAddress)
    .filter(isDeployed)
    .slice(0, MAX_PROGRAM_ADDRESSES_PER_RUN)

  const progFrom = Math.max(
    0,
    (refreshed.cursor.programsLastScannedBlock ?? factoryFrom),
  )

  for (const programAddress of programAddresses) {
    if (deadline?.shouldStop()) break
    const { logs: pLogs } = await getLogsChunked({
      address: programAddress,
      topics: lbProgramTopicsOrFilter(),
      fromBlock: progFrom,
      toBlock,
      shouldAbort: () => Boolean(deadline?.shouldStop()),
    })
    programLogs += pLogs.length
    const parsed = pLogs
      .map((l) =>
        parseLbLog(
          {
            address: l.address,
            topics: l.topics,
            data: l.data,
            transactionHash: l.transactionHash,
            logIndex: l.logIndex,
            blockNumber: l.blockNumber,
          },
          LB_INDEXER_CHAIN_ID,
        ),
      )
      .filter(Boolean)
    if (parsed.length) {
      const r = await store.ingestEvents(parsed as NonNullable<(typeof parsed)[number]>[])
      added += r.added
    }
  }

  if (isDeployed(LB_FEE_SINK_ADDRESS) && !deadline?.shouldStop()) {
    const feeFrom = Math.max(0, refreshed.cursor.feeLastScannedBlock ?? factoryFrom)
    const { logs: fLogs } = await getLogsChunked({
      address: LB_FEE_SINK_ADDRESS,
      topics: lbFeeTopicsOrFilter(),
      fromBlock: feeFrom,
      toBlock,
      shouldAbort: () => Boolean(deadline?.shouldStop()),
    })
    feeLogs = fLogs.length
    const parsed = fLogs
      .map((l) =>
        parseLbLog(
          {
            address: l.address,
            topics: l.topics,
            data: l.data,
            transactionHash: l.transactionHash,
            logIndex: l.logIndex,
            blockNumber: l.blockNumber,
          },
          LB_INDEXER_CHAIN_ID,
        ),
      )
      .filter(Boolean)
    if (parsed.length) {
      const r = await store.ingestEvents(parsed as NonNullable<(typeof parsed)[number]>[])
      added += r.added
    }
  }

  const finalDoc = await store.load()
  if (!factoryAborted) {
    finalDoc.cursor.factoryLastScannedBlock = toBlock
    finalDoc.cursor.programsLastScannedBlock = toBlock
    finalDoc.cursor.feeLastScannedBlock = toBlock
    finalDoc.updatedAt = new Date().toISOString()
    await store.save(finalDoc)
  }

  return {
    ok: true,
    added,
    scannedBlocks: toBlock - factoryFrom + 1,
    factoryLogs,
    programLogs,
    feeLogs,
    programCount: finalDoc.programs.length,
    partial: Boolean(factoryAborted),
  }
}
