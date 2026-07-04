import { describe, expect, it, vi } from 'vitest'
import { buildExecutionReceiptPayload } from '../buildExecutionReceiptPayload'
import { normalizeTreasuryIntakePayload } from '../normalizeTreasuryIntakePayload'
import { assertPayloadDoesNotOwnSettlement, FORBIDDEN_HANDOFF_PAYLOAD_FIELDS } from '../ownership'
import { clearSettlementReferenceStore, getSettlementReference } from '../settlementReferenceStore'
import { submitSettlementHandoff } from '../submitSettlementHandoff'
import type { ExecutionReceiptPayload, SwapHandoffContext } from '../types'

const context: SwapHandoffContext = {
  schema: 'melega.dex-swap-handoff-context.v1',
  asset: { symbol: 'MARCO', address: '0x963556de0eb8138E97A85F0A86eE0acD159D210b', decimals: 18 },
  amount: '1.0',
  fee: '0.0025',
  originProject: 'melega-dex',
}

function buildPayload(): ExecutionReceiptPayload {
  return buildExecutionReceiptPayload({
    chainId: 56,
    transactionHash: '0xabc123def4567890abcdef1234567890abcdef1234567890abcdef1234567890',
    wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    receiptStatus: 1,
    confirmedTime: Date.now(),
    context,
  })
}

describe('normalizeTreasuryIntakePayload', () => {
  it('normalizes DEX native receipt with numeric chain and nested asset object', () => {
    const dexPayload = buildPayload()
    const result = normalizeTreasuryIntakePayload(dexPayload)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.payload.chain).toBe('56')
    expect(result.payload.asset).toBe('MARCO')
    expect(result.payload.amount).toBe(1)
    expect(result.payload.fee).toBe(0.0025)
    expect(result.payload.status).toBe('confirmed')
    expect(result.payload.operation).toBe('swap')
    expect(result.payload.originModule).toBe('trade')
    expect(result.payload.originProject).toBe('melega-dex')
    assertPayloadDoesNotOwnSettlement(result.payload as unknown as Record<string, unknown>)
  })

  it('accepts chain provenance from object id form', () => {
    const result = normalizeTreasuryIntakePayload({
      schema: 'melega.dex-execution-receipt.v1',
      chain: { id: 56 },
      asset: { symbol: 'MARCO', address: '0x963556de0eb8138E97A85F0A86eE0acD159D210b' },
      amount: '2.5',
      fee: '0.01',
      transactionHash: '0xabc123def4567890abcdef1234567890abcdef1234567890abcdef1234567890',
      wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      timestamp: '2026-07-04T05:45:00.000Z',
      status: 'confirmed',
      operation: 'swap',
      originModule: 'trade',
      explorerUrl: 'https://bscscan.com/tx/0xabc123',
    })

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.payload.chain).toBe('56')
  })

  it('falls back to asset address when symbol is unavailable', () => {
    const result = normalizeTreasuryIntakePayload({
      schema: 'melega.dex-execution-receipt.v1',
      chain: 56,
      asset: { address: '0x963556de0eb8138E97A85F0A86eE0acD159D210b' },
      amount: '1.0',
      fee: '0.0025',
      transactionHash: '0xabc123def4567890abcdef1234567890abcdef1234567890abcdef1234567890',
      wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      timestamp: '2026-07-04T05:45:00.000Z',
      status: 'confirmed',
      operation: 'swap',
      originModule: 'trade',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.payload.asset).toBe('0x963556de0eb8138E97A85F0A86eE0acD159D210b')
    }
  })

  it('rejects locally when fee is missing — does not POST', async () => {
    const payload = {
      ...buildPayload(),
      fee: '',
    }
    const fetchImpl = vi.fn()

    const result = await submitSettlementHandoff(payload, {
      fetchImpl,
      endpoint: 'https://treasury.test/api/public/treasury/settlement-events',
      sleep: async () => {},
    })

    expect(fetchImpl).not.toHaveBeenCalled()
    expect(result.reference.settlementStatus).toBe('SETTLEMENT_REJECTED')
    expect(result.response?.machine_code).toBe('INVALID_RECEIPT')
  })
})

describe('treasury handoff ownership', () => {
  it('does not include forbidden waterfall or settlement fields in receipt payload', () => {
    const payload = buildPayload()
    assertPayloadDoesNotOwnSettlement(payload as unknown as Record<string, unknown>)
    for (const field of FORBIDDEN_HANDOFF_PAYLOAD_FIELDS) {
      expect(payload).not.toHaveProperty(field)
    }
    expect(payload).not.toHaveProperty('lp_amount')
    expect(payload).not.toHaveProperty('treasury_amount')
    expect(payload).not.toHaveProperty('buyback_amount')
    expect(payload).not.toHaveProperty('referral_amount')
  })

  it('rejects payloads that attempt to own settlement fields', () => {
    expect(() =>
      assertPayloadDoesNotOwnSettlement({
        transactionHash: '0x1',
        settlement_id: 'settlement:fake',
      }),
    ).toThrow(/forbidden settlement field/)
  })
})

describe('submitSettlementHandoff', () => {
  beforeEach(() => {
    clearSettlementReferenceStore()
  })

  it('sends normalized Treasury intake payload accepted by mock Treasury intake', async () => {
    const payload = buildPayload()
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        authority: 'treasury_runtime',
        schema: 'melega.settlement-event.v1',
        settlement: { settlement_id: 'stl_56_abc123' },
      }),
    })

    const result = await submitSettlementHandoff(payload, {
      fetchImpl,
      endpoint: 'https://treasury.test/api/public/treasury/settlement-events',
      sleep: async () => {},
    })

    expect(fetchImpl).toHaveBeenCalledTimes(1)
    const body = JSON.parse(String(fetchImpl.mock.calls[0][1]?.body))
    expect(body.chain).toBe('56')
    expect(body.asset).toBe('MARCO')
    expect(body.amount).toBe(1)
    expect(body.fee).toBe(0.0025)
    expect(result.reference.settlementStatus).toBe('SETTLEMENT_ACCEPTED')
    expect(result.reference.settlementId).toBe('stl_56_abc123')
    expect(getSettlementReference(56, payload.transactionHash)?.settlementId).toBe('stl_56_abc123')
  })

  it('tolerates DUPLICATE_SETTLEMENT without failing handoff', async () => {
    const payload = buildPayload()
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        settlement_id: 'settlement:56:0xabc',
        status: 'duplicate',
        machine_code: 'DUPLICATE_SETTLEMENT',
      }),
    })

    const result = await submitSettlementHandoff(payload, {
      fetchImpl,
      endpoint: 'https://treasury.test/api/public/treasury/settlement-events',
      sleep: async () => {},
    })

    expect(result.reference.settlementStatus).toBe('SETTLEMENT_DUPLICATE')
    expect(result.reference.machineCode).toBe('DUPLICATE_SETTLEMENT')
  })

  it('marks SETTLEMENT_PENDING when Treasury Runtime is unavailable', async () => {
    const payload = buildPayload()
    const fetchImpl = vi.fn().mockRejectedValue(new Error('network down'))

    const result = await submitSettlementHandoff(payload, {
      fetchImpl,
      endpoint: 'https://treasury.test/api/public/treasury/settlement-events',
      sleep: async () => {},
    })

    expect(result.reference.settlementStatus).toBe('SETTLEMENT_PENDING')
    expect(result.reference.treasuryRuntimeEndpointStatus).toBe('unavailable')
    expect(fetchImpl).toHaveBeenCalledTimes(3)
  })

  it('exposes machine code when settlement is rejected', async () => {
    const payload = buildPayload()
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        status: 'rejected',
        machine_code: 'INVALID_RECEIPT',
        reason: 'Missing evidence',
      }),
    })

    const result = await submitSettlementHandoff(payload, {
      fetchImpl,
      endpoint: 'https://treasury.test/api/public/treasury/settlement-events',
      sleep: async () => {},
    })

    expect(result.reference.settlementStatus).toBe('SETTLEMENT_REJECTED')
    expect(result.reference.machineCode).toBe('INVALID_RECEIPT')
    expect(result.reference.reason).toBe('Missing evidence')
  })

  it('does not compute waterfall amounts in outbound normalized payload', async () => {
    const payload = buildPayload()
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, settlement: { settlement_id: 'stl_56_1' } }),
    })

    await submitSettlementHandoff(payload, {
      fetchImpl,
      endpoint: 'https://treasury.test/api/public/treasury/settlement-events',
      sleep: async () => {},
    })

    const body = JSON.parse(String(fetchImpl.mock.calls[0][1]?.body))
    expect(typeof body.fee).toBe('number')
    expect(typeof body.chain).toBe('string')
    expect(typeof body.asset).toBe('string')
    expect(body).not.toHaveProperty('lp_amount')
    expect(body).not.toHaveProperty('treasury_amount')
    expect(body).not.toHaveProperty('buyback_amount')
    expect(body).not.toHaveProperty('referral_amount')
    expect(body).not.toHaveProperty('settlement_id')
  })
})
