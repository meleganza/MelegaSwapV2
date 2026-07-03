import {
  EXECUTION_INSTRUCTION_SCHEMA_VERSION,
  INSTRUCTION_SOURCE_DEX_ROUTING,
} from './constants'
import type { InstructionIdentity, InstructionSource } from './types'

export interface CreateInstructionIdentityInput {
  id: string
  source?: InstructionSource
  correlationId?: string
}

/**
 * Builds instruction identity metadata for routing-produced instructions.
 * Execution layer consumes identity — it never mints instruction ids.
 */
export function createInstructionIdentity(input: CreateInstructionIdentityInput): InstructionIdentity {
  return {
    id: input.id,
    correlationId: input.correlationId ?? buildCorrelationId(input.id),
    version: EXECUTION_INSTRUCTION_SCHEMA_VERSION,
    source: input.source ?? INSTRUCTION_SOURCE_DEX_ROUTING,
  }
}

export function buildCorrelationId(instructionId: string, seed?: number): string {
  const suffix = seed ?? Date.now()
  return `corr:${instructionId}:${suffix}`
}

export function createExecutionId(instructionId: string, seed?: number): string {
  const suffix = seed ?? Date.now()
  return `exec:${instructionId}:${suffix}`
}
