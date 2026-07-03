import {
  EXECUTION_INSTRUCTION_SCHEMA_VERSION,
  INSTRUCTION_SOURCE_DEX_ROUTING,
  INSTRUCTION_SOURCE_KERL_PREVIEW,
  INSTRUCTION_SOURCE_MANUAL,
} from '../execution-contract/constants'
import type { ExecutionError } from '../execution-contract/types'
import type {
  BridgeExecutionInstruction,
  ExecutionInstruction,
  SwapExecutionInstruction,
} from '../execution-layer/types'
import { INGRESS_ERROR_CODES, type SupportedInstructionType } from './constants'
import type { IngressValidateResult } from './types'

const VALID_SOURCES = new Set([
  INSTRUCTION_SOURCE_DEX_ROUTING,
  INSTRUCTION_SOURCE_KERL_PREVIEW,
  INSTRUCTION_SOURCE_MANUAL,
])

function validationError(message: string, field?: string): ExecutionError {
  return {
    code: INGRESS_ERROR_CODES.VALIDATION_FAILED,
    category: 'adapter_error',
    message: field ? `${field}: ${message}` : message,
  }
}

export function resolveInstructionType(instruction: ExecutionInstruction): SupportedInstructionType | null {
  if (instruction.domain === 'bridge' && instruction.adapter === 'kronoswap-bridge') {
    if (instruction.routingPlan?.domain === 'bridge') {
      return 'BridgeBurn'
    }
    return null
  }

  if (instruction.domain !== 'swap') {
    return null
  }

  const planDomain = instruction.routingPlan?.domain

  if (instruction.adapter === 'smart-router' && planDomain === 'swap-smart') {
    return 'SmartSwap'
  }

  if (instruction.adapter === 'v2-router' && planDomain === 'swap-v2') {
    return 'V2Swap'
  }

  return null
}

function validateIdentity(instruction: ExecutionInstruction): ExecutionError | undefined {
  if (!instruction.id || typeof instruction.id !== 'string') {
    return validationError('instruction id is required', 'id')
  }
  if (!instruction.correlationId || typeof instruction.correlationId !== 'string') {
    return validationError('correlationId is required', 'correlationId')
  }
  if (instruction.version !== EXECUTION_INSTRUCTION_SCHEMA_VERSION) {
    return validationError(`unsupported schema version: ${instruction.version}`, 'version')
  }
  if (!VALID_SOURCES.has(instruction.source)) {
    return validationError(`unsupported instruction source: ${instruction.source}`, 'source')
  }
  if (!instruction.createdAt) {
    return validationError('createdAt is required', 'createdAt')
  }
  return undefined
}

function validateSwapInstruction(instruction: SwapExecutionInstruction): ExecutionError | undefined {
  if (typeof instruction.allowedSlippageBps !== 'number' || instruction.allowedSlippageBps < 0) {
    return validationError('allowedSlippageBps must be a non-negative number', 'allowedSlippageBps')
  }
  if (!instruction.routingPlan) {
    return validationError('routingPlan is required', 'routingPlan')
  }
  if (instruction.recipient !== null && typeof instruction.recipient !== 'string') {
    return validationError('recipient must be string or null', 'recipient')
  }
  return undefined
}

function validateBridgeInstruction(instruction: BridgeExecutionInstruction): ExecutionError | undefined {
  if (typeof instruction.pid !== 'number' || instruction.pid < 0) {
    return validationError('pid must be a non-negative number', 'pid')
  }
  if (typeof instruction.isNative !== 'boolean') {
    return validationError('isNative must be boolean', 'isNative')
  }
  if (!instruction.amount || typeof instruction.amount !== 'string') {
    return validationError('amount is required', 'amount')
  }
  if (!instruction.routingPlan || instruction.routingPlan.domain !== 'bridge') {
    return validationError('bridge routingPlan is required', 'routingPlan')
  }
  if (
    instruction.routingPlan.pid !== instruction.pid ||
    instruction.routingPlan.isNative !== instruction.isNative ||
    instruction.routingPlan.amount !== instruction.amount
  ) {
    return validationError('routingPlan fields must match instruction fields', 'routingPlan')
  }
  return undefined
}

/**
 * Validates instruction integrity without choosing routes, assets, or chains.
 */
export function validateExecutionInstruction(instruction: ExecutionInstruction): IngressValidateResult {
  const identityError = validateIdentity(instruction)
  if (identityError) {
    return { ok: false, error: identityError }
  }

  const instructionType = resolveInstructionType(instruction)
  if (!instructionType) {
    return {
      ok: false,
      error: {
        code: INGRESS_ERROR_CODES.UNSUPPORTED_TYPE,
        category: 'adapter_error',
        message: `Unsupported instruction type for adapter=${instruction.adapter} domain=${instruction.domain}`,
      },
    }
  }

  if (instruction.domain === 'swap') {
    const swapError = validateSwapInstruction(instruction as SwapExecutionInstruction)
    if (swapError) {
      return { ok: false, error: swapError }
    }
  }

  if (instruction.domain === 'bridge') {
    const bridgeError = validateBridgeInstruction(instruction as BridgeExecutionInstruction)
    if (bridgeError) {
      return { ok: false, error: bridgeError }
    }
  }

  return { ok: true, instructionType }
}
