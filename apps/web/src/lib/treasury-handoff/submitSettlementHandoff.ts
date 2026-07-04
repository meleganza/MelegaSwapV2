import { TREASURY_HANDOFF_API_PATH } from './config'
import { assertPayloadDoesNotOwnSettlement } from './ownership'
import { setSettlementReference, type SettlementReference } from './settlementReferenceStore'
import type {
  ExecutionReceiptPayload,
  SettlementHandoffResult,
  SettlementHandoffStatus,
  TreasuryRuntimeEndpointStatus,
  TreasurySettlementResponse,
} from './types'

const MAX_ATTEMPTS = 3
const RETRY_DELAY_MS = 400

export interface SubmitHandoffDeps {
  fetchImpl?: typeof fetch
  endpoint?: string
  sleep?: (ms: number) => Promise<void>
}

function sleepDefault(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function mapResponseToStatus(response: TreasurySettlementResponse): SettlementHandoffStatus {
  const code = response.machine_code?.toUpperCase()
  if (code === 'DUPLICATE_SETTLEMENT') return 'SETTLEMENT_DUPLICATE'
  if (response.status?.toLowerCase() === 'accepted' || response.settlement_id) return 'SETTLEMENT_ACCEPTED'
  if (response.status?.toLowerCase() === 'rejected') return 'SETTLEMENT_REJECTED'
  if (code === 'DUPLICATE_SETTLEMENT' || response.status?.toLowerCase() === 'duplicate') {
    return 'SETTLEMENT_DUPLICATE'
  }
  return response.settlement_id ? 'SETTLEMENT_ACCEPTED' : 'SETTLEMENT_REJECTED'
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
    settlementId: response?.settlement_id,
    machineCode: response?.machine_code,
    reason: response?.reason,
    treasuryRuntimeEndpointStatus: endpointStatus,
    updatedAt: new Date().toISOString(),
  }
}

async function postOnce(
  payload: ExecutionReceiptPayload,
  endpoint: string,
  fetchImpl: typeof fetch,
): Promise<{ ok: boolean; status: number; body: TreasurySettlementResponse | null }> {
  const res = await fetchImpl(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  let body: TreasurySettlementResponse | null = null
  try {
    body = (await res.json()) as TreasurySettlementResponse
  } catch {
    body = null
  }

  return { ok: res.ok, status: res.status, body }
}

/**
 * Submits verified execution receipt to Treasury Runtime via same-origin proxy.
 * DEX stores settlement reference only — never computes treasury truth.
 */
export async function submitSettlementHandoff(
  payload: ExecutionReceiptPayload,
  deps: SubmitHandoffDeps = {},
): Promise<SettlementHandoffResult> {
  assertPayloadDoesNotOwnSettlement(payload as unknown as Record<string, unknown>)

  const fetchImpl = deps.fetchImpl ?? fetch
  const endpoint = deps.endpoint ?? TREASURY_HANDOFF_API_PATH
  const sleep = deps.sleep ?? sleepDefault

  let lastError: unknown
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const result = await postOnce(payload, endpoint, fetchImpl)

      if (result.status === 503) {
        const reference = buildReference(payload, 'SETTLEMENT_PENDING', 'not_configured')
        setSettlementReference(reference)
        return { reference }
      }

      if (!result.ok && result.status >= 500) {
        throw new Error(`Treasury Runtime unavailable: HTTP ${result.status}`)
      }

      const body = result.body ?? {}
      const machineCode = body.machine_code?.toUpperCase()

      if (machineCode === 'DUPLICATE_SETTLEMENT') {
        const reference = buildReference(payload, 'SETTLEMENT_DUPLICATE', 'available', body)
        setSettlementReference(reference)
        return { reference, response: body }
      }

      const status = mapResponseToStatus(body)
      const reference = buildReference(payload, status, 'available', body)
      setSettlementReference(reference)
      return { reference, response: body }
    } catch (error) {
      lastError = error
      if (attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_DELAY_MS * attempt)
      }
    }
  }

  console.warn('[treasury-handoff] Treasury Runtime unavailable — swap success preserved', lastError)
  const reference = buildReference(payload, 'SETTLEMENT_PENDING', 'unavailable')
  setSettlementReference(reference)
  return { reference }
}
