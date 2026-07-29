import { normalizeTreasuryIntakePayload } from './normalizeTreasuryIntakePayload'
import { assertPayloadDoesNotOwnSettlement } from './ownership'
import { setSettlementReference, type SettlementReference } from './settlementReferenceStore'
import type {
  ExecutionReceiptPayload,
  SettlementHandoffResult,
  SettlementHandoffStatus,
  TreasuryRuntimeEndpointStatus,
  TreasurySettlementResponse,
} from './types'

export interface SubmitHandoffDeps {
  fetchImpl?: typeof fetch
  endpoint?: string
  sleep?: (ms: number) => Promise<void>
}

function buildReference(
  payload: ExecutionReceiptPayload,
  status: SettlementHandoffStatus,
  endpointStatus: TreasuryRuntimeEndpointStatus,
  response?: TreasurySettlementResponse,
): SettlementReference {
  return {
    txHash: payload.transactionHash,
    chainId: payload.chain,
    wallet: payload.wallet,
    settlementStatus: status,
    settlementId: response?.settlement_id ?? response?.settlement?.settlement_id,
    machineCode: response?.machine_code,
    reason: response?.reason,
    treasuryRuntimeEndpointStatus: endpointStatus,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Treasury Runtime handoff — decommissioned.
 * Never issues HTTP requests to Treasury Runtime or treasury.melega.ai.
 * Swap success is independent of this path.
 */
export async function submitSettlementHandoff(
  payload: ExecutionReceiptPayload,
  _deps: SubmitHandoffDeps = {},
): Promise<SettlementHandoffResult> {
  assertPayloadDoesNotOwnSettlement(payload as unknown as Record<string, unknown>)

  const normalized = normalizeTreasuryIntakePayload(payload)
  if (!normalized.ok) {
    const rejected: TreasurySettlementResponse = {
      status: 'rejected',
      machine_code: normalized.machine_code,
      reason: normalized.reason,
    }
    const reference = buildReference(payload, 'SETTLEMENT_REJECTED', 'decommissioned', rejected)
    setSettlementReference(reference)
    return { reference, response: rejected }
  }

  // Intentionally never call fetchImpl / upstream — TR is decommissioned.
  void _deps
  const decommissioned: TreasurySettlementResponse = {
    status: 'decommissioned',
    machine_code: 'TREASURY_RUNTIME_DECOMMISSIONED',
    reason: 'Treasury Runtime decommissioned — no settlement handoff required',
  }

  const reference = buildReference(payload, 'SETTLEMENT_PENDING', 'decommissioned', decommissioned)
  setSettlementReference(reference)
  return { reference, response: decommissioned }
}
