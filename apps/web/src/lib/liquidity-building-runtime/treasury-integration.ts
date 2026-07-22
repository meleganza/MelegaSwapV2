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
  /** Gross quote acquired before fee (base units) — retained for async replay. */
  grossQuoteAmount?: string
  /** Net quote after fee used for liquidity (base units). */
  netQuoteAmount?: string
  lpAmount?: string
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
  | { ok: false; status: TreasuryIngestStatus; reason: string; pendingEvidence?: ReconciliationV1 }

export interface LiquidityBuildingTreasuryIngestor {
  readonly ready: boolean
  ingest(event: TreasurySettlementEvent): Promise<TreasuryIngestResult>
  getBySettlementKey(settlementKey: string): ReconciliationV1 | null
  /** Async reconciliation retry — idempotent; never resubmits on-chain execution. */
  retryPending?(): Promise<{ attempted: number; accounted: number; stillPending: number }>
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

function pendingRecord(event: TreasurySettlementEvent, idem: string): ReconciliationV1 {
  return {
    schemaVersion: LB_RECONCILIATION_SCHEMA,
    chainId: event.chainId,
    program: event.program,
    executionId: event.executionId,
    settlementKey: event.settlementKey,
    settlementReceipt: event.settlementReceipt,
    runtimeAcknowledgementId: null,
    treasuryStatus: 'OBSERVED',
    feeAmount: event.feeAmount,
    quoteAsset: event.quoteAsset,
    idempotencyKey: idem,
    createdAt: new Date().toISOString(),
    notes: [
      'RECONCILIATION_PENDING',
      'Treasury Runtime ingestion unavailable — evidence retained for async replay',
      'execution status is independent of reconciliation status',
      `tx=${event.transactionHash}`,
      `block=${event.blockNumber}`,
      `programId=${event.programId}`,
      event.grossQuoteAmount ? `grossQuote=${event.grossQuoteAmount}` : '',
      event.netQuoteAmount ? `netQuote=${event.netQuoteAmount}` : '',
      event.lpAmount ? `lp=${event.lpAmount}` : '',
      `treasuryReceiver=${event.treasuryReceiver}`,
    ].filter(Boolean),
  }
}

/**
 * Local validation + idempotent store. Production ingestion belongs in Treasury Runtime
 * (meleganza/melega-kiri-treasury-runtime).
 *
 * LB-ACT-003: when Runtime is not operational, evidence is retained as PENDING for async
 * retry. This never blocks deterministic on-chain execution and never duplicates accounting.
 */
export class BlockedTreasuryIngestor implements LiquidityBuildingTreasuryIngestor {
  protected _ready = false
  private readonly byKey = new Map<string, ReconciliationV1>()
  private readonly byIdem = new Map<string, ReconciliationV1>()
  private readonly pending = new Map<string, TreasurySettlementEvent>()

  get ready(): boolean {
    return this._ready
  }

  async ingest(event: TreasurySettlementEvent): Promise<TreasuryIngestResult> {
    if (!this.ready) {
      const idem = idempotencyKey(event)
      const existing = this.byIdem.get(idem)
      if (existing) {
        return { ok: true, record: existing }
      }
      const pending = pendingRecord(event, idem)
      this.pending.set(idem, event)
      this.byIdem.set(idem, pending)
      this.byKey.set(event.settlementKey, pending)
      return {
        ok: false,
        status: 'OBSERVED',
        reason: 'TREASURY_ACCOUNTING_DEGRADED',
        pendingEvidence: pending,
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
    if (existing && existing.treasuryStatus === 'ACCOUNTED') {
      return { ok: true, record: existing }
    }
    if (this.byKey.has(event.settlementKey) && this.byKey.get(event.settlementKey)?.treasuryStatus === 'ACCOUNTED') {
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
        'TEST/LOCAL VALIDATION ONLY — production Runtime wiring may still be deferred',
      ],
    }
    this.byKey.set(event.settlementKey, record)
    this.byIdem.set(idem, record)
    this.pending.delete(idem)
    return { ok: true, record }
  }

  /**
   * Retry pending evidence when Runtime becomes available.
   * Idempotent: never creates duplicate ACCOUNTED rows; never resubmits on-chain txs.
   */
  async retryPending(): Promise<{ attempted: number; accounted: number; stillPending: number }> {
    if (!this.ready) {
      return { attempted: 0, accounted: 0, stillPending: this.pending.size }
    }
    let accounted = 0
    const events = [...this.pending.values()]
    for (const event of events) {
      const result = this.validateAndStore(event)
      if (result.ok) accounted += 1
    }
    return { attempted: events.length, accounted, stillPending: this.pending.size }
  }

  getBySettlementKey(settlementKey: string): ReconciliationV1 | null {
    return this.byKey.get(settlementKey) || null
  }
}

/**
 * Local validation ingestor used in tests — can be marked ready for idempotent replay tests
 * without claiming production Runtime availability in default health assessment.
 */
export class LocalValidationTreasuryIngestor extends BlockedTreasuryIngestor {
  setReadyForTests(ready: boolean): void {
    this._ready = ready
  }
}
