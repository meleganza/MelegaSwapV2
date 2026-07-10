import type { ExecutionRequest } from './types'

/**
 * DEX routing gate — rejects requests that carry non-KERL routing authority.
 * DEX is consumer only; must not mutate path, adapter, or wrapper.
 */
export function assertDexConsumesExecutionRequestOnly(
  request: ExecutionRequest,
): { ok: true } | { ok: false; code: string; message: string } {
  if (request.authority !== 'kerl') {
    return { ok: false, code: 'ROUTING_AUTHORITY_VIOLATION', message: 'DEX may only consume KERL-produced ExecutionRequest' }
  }
  if (request.schema !== 'melega.kerl.execution-request.v1') {
    return { ok: false, code: 'INVALID_REQUEST_SCHEMA', message: 'ExecutionRequest schema mismatch' }
  }
  if (!request.wrapperAddress || !request.path?.length) {
    return { ok: false, code: 'INCOMPLETE_REQUEST', message: 'ExecutionRequest missing wrapper or path' }
  }
  return { ok: true }
}

/** Maps ExecutionRequest to wrapper execution parameters — no routing decisions. */
export function resolveWrapperExecutionParams(request: ExecutionRequest) {
  const gate = assertDexConsumesExecutionRequestOnly(request)
  if (!gate.ok) {
    throw new Error(gate.message)
  }

  return {
    wrapperAddress: request.wrapperAddress,
    path: request.path,
    amountRaw: request.amountRaw,
    inputIsNative: request.inputIsNative,
    inputToken: request.inputToken,
    recipient: request.recipient,
    slippageBps: request.slippageBps,
    routeType: request.routeType,
    expectedFeeBps: request.expectedFeeBps,
  }
}
