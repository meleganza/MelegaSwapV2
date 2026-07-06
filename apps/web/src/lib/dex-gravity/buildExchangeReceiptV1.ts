import {
  DEX_GRAVITY_SCHEMA_VERSION,
  MELEGA_DEX_EXECUTION_RECEIPT_SCHEMA,
  MELEGA_EXCHANGE_RECEIPT_SCHEMA,
} from './constants'
import { DEX_AUTHORITY_BOUNDARIES, buildProvenance } from './authorities'
import type { MelegaExchangeReceiptV1Payload } from './schemas/types'
import type { ExecutionReceiptPayload } from '../treasury-handoff/types'

export function buildMelegaExchangeReceiptV1(
  legacy: ExecutionReceiptPayload,
): MelegaExchangeReceiptV1Payload {
  return {
    schema: MELEGA_EXCHANGE_RECEIPT_SCHEMA,
    schemaVersion: DEX_GRAVITY_SCHEMA_VERSION,
    legacySchema: MELEGA_DEX_EXECUTION_RECEIPT_SCHEMA,
    transactionHash: legacy.transactionHash,
    wallet: legacy.wallet,
    chain: legacy.chain,
    timestamp: legacy.timestamp,
    status: legacy.status,
    operation: legacy.operation === 'swap' ? 'swap' : 'swap',
    settlementBoundary: 'receipt-only',
    authority: DEX_AUTHORITY_BOUNDARIES,
    provenance: buildProvenance(),
    asset: legacy.asset,
    amount: legacy.amount,
    fee: legacy.fee,
    explorerUrl: legacy.explorerUrl,
    originModule: legacy.originModule,
  }
}

/** Preserves backward-compatible treasury handoff schema unchanged. */
export function toLegacyDexExecutionReceipt(payload: MelegaExchangeReceiptV1Payload): ExecutionReceiptPayload {
  return {
    schema: MELEGA_DEX_EXECUTION_RECEIPT_SCHEMA,
    transactionHash: payload.transactionHash,
    wallet: payload.wallet,
    chain: payload.chain,
    timestamp: payload.timestamp,
    status: payload.status,
    asset: payload.asset ?? { symbol: 'UNKNOWN', address: '0x0' },
    amount: payload.amount ?? '0',
    fee: payload.fee ?? '0',
    operation: 'swap',
    explorerUrl: payload.explorerUrl ?? '',
    originModule: (payload.originModule as 'trade') ?? 'trade',
  }
}
