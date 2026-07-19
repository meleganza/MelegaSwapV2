import { createHash } from 'crypto'
import type { ReconciliationV1, TreasuryIngestStatus } from './types'
import { LB_CHAIN_ID, LB_RECONCILIATION_SCHEMA } from './types'

export type TreasurySettlementEvent = {
  chainId: number
  sink: string
  treasuryReceiver: string
  factory: string
  program: string
  programId: string
  executionId: string
  quoteAsset: string
  feeAmount: string
  settlementKey: string
  settlementReceipt: string
  transactionHash: string
  logIndex: number
  blockNumber: number
  finalized: boolean
  programRegistered: boolean
  sinkMatchesFactory: boolean
  receiverMatchesCanonical: boolean
}

export type TreasuryIngestResult =
  | { ok: true; record: ReconciliationV1 }
  | { ok: false; status: TreasuryIngestStatus; reason: string }

export interface LiquidityBuildingTreasuryIngestor {
  readonly ready: boolean
  ingest(event: TreasurySettlementEvent): Promise<TreasuryIngestResult>
  getBySettlementKey(settlementKey: string): ReconciliationV1 | null
}

function idempotencyKey(e: TreasurySettlementEvent): string {
  return [
    e.chainId,
    e.sink.toLowerCase(),
    e.settlementKey,
    e.transactionHash.toLowerCase(),
    String(e.logIndex),
  ].join(':')
}

/**
 * Local validation + idempotent store. Production ingestion belongs in Treasury Runtime
 * (meleganza/melega-kiri-treasury-runtime). This adapter stays blocked until Runtime is wired.
 */
export class BlockedTreasuryIngestor implements LiquidityBuildingTreasuryIngestor {
  readonly ready = false
  private readonly byKey = new Map<string, ReconciliationV1>()
  private readonly byIdem = new Map<string, ReconciliationV1>()

  async ingest(event: TreasurySettlementEvent): Promise<TreasuryIngestResult> {
    if (!this.ready) {
      return {
        ok: false,
        status: 'ERROR',
        reason: 'Treasury Runtime LB ingestion not operational (LB-G04C, LB-G12)',
      }
    }
    return this.validateAndStore(event)
  }

  /** Test-only path: validate rules without claiming production readiness. */
  validateAndStore(event: TreasurySettlementEvent): TreasuryIngestResult {
    if (event.chainId !== LB_CHAIN_ID) {
      return { ok: false, status: 'REJECTED', reason: 'INVALID_CHAIN' }
    }
    if (!event.finalized) {
      return { ok: false, status: 'AWAITING_FINALITY', reason: 'NOT_FINALIZED' }
    }
    if (!event.programRegistered) {
      return { ok: false, status: 'REJECTED', reason: 'UNREGISTERED_PROGRAM' }
    }
    if (!event.sinkMatchesFactory) {
      return { ok: false, status: 'REJECTED', reason: 'WRONG_SINK' }
    }
    if (!event.receiverMatchesCanonical) {
      return { ok: false, status: 'REJECTED', reason: 'WRONG_TREASURY_RECEIVER' }
    }
    if (!event.feeAmount || event.feeAmount === '0') {
      return { ok: false, status: 'REJECTED', reason: 'FEE_AMOUNT_INVALID' }
    }

    const idem = idempotencyKey(event)
    const existing = this.byIdem.get(idem)
    if (existing) {
      return { ok: true, record: existing }
    }
    if (this.byKey.has(event.settlementKey)) {
      return { ok: false, status: 'REJECTED', reason: 'DUPLICATE_SETTLEMENT_KEY' }
    }

    const ack = `0x${createHash('sha256').update(`ack:${idem}`).digest('hex')}`
    const record: ReconciliationV1 = {
      schemaVersion: LB_RECONCILIATION_SCHEMA,
      chainId: event.chainId,
      program: event.program,
      executionId: event.executionId,
      settlementKey: event.settlementKey,
      settlementReceipt: event.settlementReceipt,
      runtimeAcknowledgementId: ack,
      treasuryStatus: 'ACCOUNTED',
      feeAmount: event.feeAmount,
      quoteAsset: event.quoteAsset,
      idempotencyKey: idem,
      createdAt: new Date().toISOString(),
      notes: [
        'executionId, settlementReceipt, and runtimeAcknowledgementId are distinct identities',
        'TEST/LOCAL VALIDATION ONLY — production Runtime not ready',
      ],
    }
    this.byKey.set(event.settlementKey, record)
    this.byIdem.set(idem, record)
    return { ok: true, record }
  }

  getBySettlementKey(settlementKey: string): ReconciliationV1 | null {
    return this.byKey.get(settlementKey) || null
  }
}

/** Production-facing wrapper that never marks ready until explicitly enabled by Runtime wiring. */
export class LocalValidationTreasuryIngestor extends BlockedTreasuryIngestor {
  // ready remains false — production health must stay BLOCKED
}
