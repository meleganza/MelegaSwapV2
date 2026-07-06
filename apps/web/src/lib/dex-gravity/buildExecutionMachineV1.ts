import { DEX_GRAVITY_SCHEMA_VERSION, MELEGA_EXECUTION_SCHEMA } from './constants'
import { DEX_AUTHORITY_BOUNDARIES, buildProvenance } from './authorities'
import type { ExecutionLifecyclePhase, MelegaExecutionV1Payload } from './schemas/types'
import type { SwapExecutionInstruction } from '../execution-layer/types'

export function buildMelegaExecutionV1(input: {
  lifecycle: ExecutionLifecyclePhase
  instruction?: SwapExecutionInstruction | null
}): MelegaExecutionV1Payload {
  const plan = input.instruction?.routingPlan
  return {
    schema: MELEGA_EXECUTION_SCHEMA,
    schemaVersion: DEX_GRAVITY_SCHEMA_VERSION,
    lifecycle: input.lifecycle,
    instructionId: input.instruction?.id,
    correlationId: input.instruction?.correlationId,
    adapter: input.instruction?.adapter,
    routingDomain: plan?.domain,
    quoteOwner: 'routing-layer',
    submitOwner: 'execution-ingress',
    authority: DEX_AUTHORITY_BOUNDARIES,
    provenance: buildProvenance(),
  }
}
