import { validateTestnetExecutionHandoff, type TestnetExecutionHandoffPackage } from '../../execution-handoff-consumer/validate-testnet-handoff'
import { validateExecutionInstruction, resolveInstructionType } from '../../execution-ingress/validate'
import type { ExecutionInstruction } from '../../execution-layer/types'
import { isExecutionGatewayEnabled } from '../../execution-gateway/activation'
import { isInternalIngressEnabled } from '../../execution-ingress/activation'
import { evaluateLiveExecutionGates } from '../activation-gates'
import { EXECUTION_MODE_TESTNET_EXECUTION_ONLY } from '../constants'
import { getConfiguredExecutionMode, getExecutionModeConfig } from '../config'
import { getCivilizationObservations } from '../civilization-observations'

export interface PreconditionCheck {
  id: string
  satisfied: boolean
  detail: string
}

export interface PreconditionEvaluation {
  passed: boolean
  checks: PreconditionCheck[]
  blocking: string[]
  handoff?: TestnetExecutionHandoffPackage
  instruction?: ExecutionInstruction
  instructionType?: ReturnType<typeof resolveInstructionType>
}

export function evaluateTestnetExecutionPreconditions(
  handoffJson: unknown,
  context: { account?: string; walletFunded?: boolean },
): PreconditionEvaluation {
  const checks: PreconditionCheck[] = []

  const handoffResult = validateTestnetExecutionHandoff(handoffJson)
  checks.push({
    id: 'certified_handoff',
    satisfied: handoffResult.ok,
    detail: handoffResult.ok ? 'Testnet handoff validated' : handoffResult.error.message,
  })

  if (!handoffResult.ok) {
    return finalize(checks)
  }

  const instruction = handoffResult.package.proposedInstruction as unknown as ExecutionInstruction
  const validation = validateExecutionInstruction(instruction)
  checks.push({
    id: 'valid_instruction',
    satisfied: validation.ok,
    detail: validation.ok ? 'Instruction contract valid' : validation.error.message,
  })

  const instructionType = validation.ok ? validation.instructionType : null
  checks.push({
    id: 'supported_execution_type',
    satisfied: Boolean(instructionType),
    detail: instructionType ? `Type: ${instructionType}` : 'Unsupported instruction type',
  })

  checks.push({
    id: 'instruction_identity',
    satisfied:
      handoffResult.package.instructionIdentity.id === instruction.id &&
      handoffResult.package.instructionIdentity.correlationId === instruction.correlationId,
    detail: 'Instruction identity matches handoff envelope',
  })

  checks.push({
    id: 'correlation_identity',
    satisfied:
      handoffResult.package.correlationIdentity.handoffCorrelationId === handoffResult.package.correlationId &&
      handoffResult.package.correlationIdentity.handoffCorrelationId === instruction.correlationId,
    detail: 'Correlation identity matches',
  })

  checks.push({
    id: 'execution_mode',
    satisfied: getConfiguredExecutionMode() === EXECUTION_MODE_TESTNET_EXECUTION_ONLY,
    detail: `Mode: ${getConfiguredExecutionMode()}`,
  })

  const config = getExecutionModeConfig()
  checks.push({
    id: 'civilization_authorization',
    satisfied: config.kerlLiveExecutionAuthorized,
    detail: config.kerlLiveExecutionAuthorized ? 'Authorized' : 'Not authorized',
  })

  checks.push({
    id: 'gateway_enabled',
    satisfied: isExecutionGatewayEnabled(),
    detail: isExecutionGatewayEnabled() ? 'Gateway enabled' : 'Gateway disabled',
  })

  checks.push({
    id: 'ingress_enabled',
    satisfied: isInternalIngressEnabled(),
    detail: isInternalIngressEnabled() ? 'Ingress enabled' : 'Ingress disabled',
  })

  const observations = getCivilizationObservations()
  checks.push({ id: 'registry_active', satisfied: observations.kerlRegistryActive, detail: 'KERL registry active' })
  checks.push({ id: 'registry_published', satisfied: observations.registryPublished, detail: 'Registry published' })
  checks.push({
    id: 'registry_compatibility',
    satisfied: observations.registryCompatibilityVerified,
    detail: 'Registry compatibility certified',
  })
  checks.push({
    id: 'treasury_observed',
    satisfied: observations.treasuryObservesKerlRegistry,
    detail: 'Treasury observes KERL registry',
  })
  checks.push({
    id: 'mission_director_observed',
    satisfied: observations.missionDirectorObserved,
    detail: 'Mission Director observed',
  })
  checks.push({ id: 'kcis_observed', satisfied: observations.kcisObserved, detail: 'KCIS observed' })
  checks.push({
    id: 'economic_memory_observed',
    satisfied: observations.economicMemoryObserved,
    detail: 'Economic Memory observed',
  })

  checks.push({
    id: 'supported_chain',
    satisfied: instruction.chainId === 97,
    detail: `chainId: ${instruction.chainId ?? 'unknown'}`,
  })

  checks.push({
    id: 'wallet_present',
    satisfied: Boolean(context.account),
    detail: context.account ? `Wallet: ${context.account.slice(0, 10)}…` : 'No wallet account',
  })

  checks.push({
    id: 'wallet_funded',
    satisfied: context.walletFunded === true,
    detail: context.walletFunded ? 'Sufficient BNB Testnet gas' : 'Wallet not funded or balance unknown',
  })

  const gateEval = evaluateLiveExecutionGates({
    chainId: 97,
    account: context.account,
    instructionValid: validation.ok,
    certifiedHandoff: true,
    handoffCompatible: true,
    instructionType: instructionType ?? undefined,
    mode: EXECUTION_MODE_TESTNET_EXECUTION_ONLY,
  })
  checks.push({
    id: 'activation_gates',
    satisfied: gateEval.allowed,
    detail: gateEval.allowed ? 'All activation gates satisfied' : gateEval.gates.find((g) => !g.satisfied)?.reason ?? 'Gates failed',
  })

  return finalize(checks, handoffResult.package, instruction, instructionType ?? undefined)
}

function finalize(
  checks: PreconditionCheck[],
  handoff?: TestnetExecutionHandoffPackage,
  instruction?: ExecutionInstruction,
  instructionType?: ReturnType<typeof resolveInstructionType>,
): PreconditionEvaluation {
  const blocking = checks.filter((c) => !c.satisfied).map((c) => `${c.id}: ${c.detail}`)
  return {
    passed: blocking.length === 0,
    checks,
    blocking,
    handoff,
    instruction,
    instructionType,
  }
}
