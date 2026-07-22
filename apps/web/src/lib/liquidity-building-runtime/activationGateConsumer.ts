/**
 * LB021 / LB-ACT-003 — Melega DEX-side read-only activation gate consumer.
 *
 * Consumes verified external activation status. Does not become the authority.
 * Activation uses execution-critical gates only; Treasury ingestion is async accounting.
 */

import { existsSync, readFileSync } from 'fs'
import path from 'path'
import {
  LB_ACCOUNTING_ASYNC_GATE_IDS,
  LB_DIAGNOSTIC_GATE_IDS,
  LB_EXECUTION_CRITICAL_GATE_IDS,
  LIQUIDITY_BUILDING_GATE_REGISTRY,
  type GateClassificationSnapshot,
  type LbDiagnosticGateId,
  type LbExecutionCriticalGateId,
} from './gateClassification'

const ZERO = '0x0000000000000000000000000000000000000000'

function isDeployedAddress(value: string | null | undefined): value is string {
  if (!value) return false
  const v = value.toLowerCase()
  return v !== ZERO.toLowerCase() && /^0x[a-f0-9]{40}$/.test(v)
}

/**
 * @deprecated Prefer LB_DIAGNOSTIC_GATE_IDS / LB_EXECUTION_CRITICAL_GATE_IDS.
 * Kept for test/compat; includes accounting async gates for diagnostics only.
 */
export const LB021_REQUIRED_GATES = LB_DIAGNOSTIC_GATE_IDS

export type Lb021GateId = LbDiagnosticGateId

/** Per-gate machine state — no infrastructure jargon in product mapping. */
export type ExternalGateState = 'READY' | 'BLOCKED'

/**
 * Deterministic product activation status.
 * UI maps these without exposing KMS / Treasury / BC003S terminology.
 */
export type ProductActivationStatus =
  | 'READY'
  | 'READY_FOR_ACTIVATION'
  | 'BLOCKED'
  | 'PENDING_EXTERNAL_ACTIVATION'
  | 'FAILED'

export type ConsumedGate = {
  id: Lb021GateId
  state: ExternalGateState
  source: string
  /** Machine evidence only — never render raw to end users. */
  evidence: string | null
  classification: 'EXECUTION_CRITICAL' | 'ACCOUNTING_ASYNC'
}

export type ActivationGateConsumerInput = {
  activationAuthorized: boolean
  mainnetCycleAuthorized?: boolean
  manualOverrideForbidden?: boolean
  validatorResult: string | null
  deploymentReadinessState: string | null
  runtimeHealthExpected?: string | null
  /** Raw gates from activation-gate-final.v1.json */
  gates: ReadonlyArray<{
    gate?: string
    status?: string
    blocker?: string | null
    blockingReason?: string | null
    evidence?: string | null
  }>
  /** Optional production addresses from deployment inputs / binding */
  addresses?: {
    lbFactory?: string | null
    lbAuthorizer?: string | null
    lbFeeSink?: string | null
    treasuryFeeReceiver?: string | null
    programAddress?: string | null
  }
  /** Forbidden: any attempt to force activation */
  manualActivationAttempt?: boolean
  privateKeyConfigViolation?: boolean
}

export type ActivationGateConsumerResult = {
  schemaVersion: 'melega.liquidity-building.activation-gate-consumer.v1'
  productStatus: ProductActivationStatus
  activationAuthorized: boolean
  mainnetCycleAuthorized: boolean
  deploymentInputsValid: boolean
  contractsDeployed: boolean
  /** Execution-critical gates only (excludes Treasury ingestion / reconciliation). */
  executionCriticalGatesReady: boolean
  /** @deprecated Alias of executionCriticalGatesReady — accounting gates excluded. */
  allRequiredGatesReady: boolean
  accountingReadiness: boolean
  accountingDegraded: boolean
  feeReceiverValid: boolean
  validatorResult: string | null
  gates: ConsumedGate[]
  /** Execution-critical blockers only */
  executionBlockers: string[]
  /** Accounting / observability blockers (do not block activation) */
  accountingBlockers: string[]
  warnings: string[]
  /** Canonical classification registry snapshot for every known gate. */
  gateClassifications: GateClassificationSnapshot[]
  /** @deprecated Prefer executionBlockers — excludes accounting. */
  blockers: string[]
  /** Safe for UI — no infra names */
  uiMode: 'available' | 'pending' | 'blocked'
  assessedAt: string
  manualOverrideForbidden: true
  secondaryWarning: string | null
}

function normalizeBlocker(raw: string | null | undefined): string[] {
  if (!raw) return []
  return raw
    .split(/[/,]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function gatePasses(
  gates: ActivationGateConsumerInput['gates'],
  id: Lb021GateId,
): { ready: boolean; source: string; evidence: string | null } {
  const aliases: Record<Lb021GateId, RegExp[]> = {
    'LB-G03B': [/signer/i, /LB-G03B/i],
    'LB-G11': [/signature/i, /LB-G11/i, /signer/i],
    'LB-G03C': [/relay/i, /LB-G03C/i],
    'LB-G04B': [/treasury receiver/i, /fee sink/i, /LB-G04B/i],
    'LB-G04C/G12': [/runtime ingestion/i, /LB-G04C/i, /LB-G12/i],
    'LB-G08': [/quote policy/i, /LB-G08/i],
    'LB-G10': [/finality/i, /LB-G10/i],
  }

  const matches = gates.filter((g) => {
    const blockers = normalizeBlocker(g.blocker)
    if (
      blockers.includes(id) ||
      blockers.some((b) => b === id || (id === 'LB-G04C/G12' && (b === 'LB-G04C' || b === 'LB-G12')))
    ) {
      return true
    }
    const title = String(g.gate ?? '')
    return aliases[id].some((re) => re.test(title) || re.test(String(g.blocker ?? '')))
  })

  if (matches.length === 0) {
    return { ready: false, source: 'activation-gate-final', evidence: `MISSING_GATE_ROW:${id}` }
  }

  const ready = matches.every((g) => String(g.status).toUpperCase() === 'PASS')
  const evidence =
    matches.map((g) => g.evidence || g.blockingReason || g.status || null).filter(Boolean).join(' | ') ||
    null
  return { ready, source: 'activation-gate-final.v1.json', evidence }
}

function isExecutionCritical(id: Lb021GateId): id is LbExecutionCriticalGateId {
  return (LB_EXECUTION_CRITICAL_GATE_IDS as readonly string[]).includes(id)
}

/**
 * Pure consumer — deterministic, fail-closed, no network, no authority.
 *
 * activationAuthorized =
 *   gateDoc.activationAuthorized
 *   AND executionCriticalGatesReady
 *   AND deploymentInputsValid
 *
 * accountingReadiness is reported separately and never participates in activationAuthorized.
 */
export function consumeActivationGates(
  input: ActivationGateConsumerInput,
  assessedAt = new Date().toISOString(),
): ActivationGateConsumerResult {
  const manualOverrideForbidden = true
  const consumed: ConsumedGate[] = LB_DIAGNOSTIC_GATE_IDS.map((id) => {
    const { ready, source, evidence } = gatePasses(input.gates, id)
    return {
      id,
      state: ready ? 'READY' : 'BLOCKED',
      source,
      evidence,
      classification: isExecutionCritical(id) ? 'EXECUTION_CRITICAL' : 'ACCOUNTING_ASYNC',
    }
  })

  const executionGates = consumed.filter((g) => g.classification === 'EXECUTION_CRITICAL')
  const accountingGates = consumed.filter((g) => g.classification === 'ACCOUNTING_ASYNC')

  const executionCriticalGatesReady = executionGates.every((g) => g.state === 'READY')
  const accountingReadiness = accountingGates.every((g) => g.state === 'READY')
  const accountingDegraded = !accountingReadiness

  const addresses = input.addresses ?? {}
  const contractsDeployed =
    isDeployedAddress(addresses.lbFactory) &&
    isDeployedAddress(addresses.lbAuthorizer) &&
    isDeployedAddress(addresses.lbFeeSink)

  const feeReceiverValid = isDeployedAddress(addresses.treasuryFeeReceiver)

  const validatorOk =
    input.validatorResult === 'VALID' ||
    input.validatorResult === 'DEPLOYMENT_INPUTS_VALID' ||
    input.validatorResult === 'PASS'

  const readinessOk =
    input.deploymentReadinessState === 'VALID' || input.deploymentReadinessState === 'DEPLOYED'

  // Deployment inputs do not require gateDoc.activationAuthorized (avoids circular formula)
  // and do not require Treasury ingestion readiness.
  const deploymentInputsValid = validatorOk && readinessOk && contractsDeployed && feeReceiverValid

  const executionBlockers: string[] = []
  for (const g of executionGates) {
    if (g.state === 'BLOCKED') executionBlockers.push(g.id)
  }
  if (!feeReceiverValid) executionBlockers.push('TREASURY_FEE_RECEIVER_MISSING')
  if (!validatorOk) executionBlockers.push('DEPLOYMENT_INPUTS_BLOCKED')
  if (!contractsDeployed) executionBlockers.push('CONTRACTS_NOT_DEPLOYED')
  if (input.manualActivationAttempt) executionBlockers.push('MANUAL_ACTIVATION_FORBIDDEN')
  if (input.privateKeyConfigViolation) executionBlockers.push('PRIVATE_KEY_CONFIG_FORBIDDEN')
  if (input.manualOverrideForbidden === false) executionBlockers.push('OVERRIDE_FLAG_REJECTED')
  if (input.activationAuthorized !== true) executionBlockers.push('GATE_DOC_ACTIVATION_NOT_AUTHORIZED')

  const accountingBlockers: string[] = []
  for (const g of accountingGates) {
    if (g.state === 'BLOCKED') {
      accountingBlockers.push(g.id)
      // Expand combined diagnostic id into canonical LB-G04C / LB-G12 accounting blockers.
      if (g.id === 'LB-G04C/G12') {
        if (!accountingBlockers.includes('LB-G04C')) accountingBlockers.push('LB-G04C')
        if (!accountingBlockers.includes('LB-G12')) accountingBlockers.push('LB-G12')
      }
    }
  }
  for (const id of LB_ACCOUNTING_ASYNC_GATE_IDS) {
    if (!accountingBlockers.includes(id) && accountingGates.some((g) => g.id === id && g.state === 'BLOCKED')) {
      accountingBlockers.push(id)
    }
  }

  const warnings: string[] = []
  if (accountingDegraded) {
    warnings.push('TREASURY_ACCOUNTING_DEGRADED')
  }

  const combinedAccounting = accountingGates.find((g) => g.id === 'LB-G04C/G12')
  const gateClassifications: GateClassificationSnapshot[] = LIQUIDITY_BUILDING_GATE_REGISTRY.map((row) => {
    const match = consumed.find((g) => g.id === row.gateId)
    let assessedReady: boolean | null = null
    let runtimeStatus = row.runtimeStatus
    if (row.gateId === 'LB-G04C' || row.gateId === 'LB-G12') {
      assessedReady = combinedAccounting ? combinedAccounting.state === 'READY' : false
      runtimeStatus = assessedReady ? 'CONNECTED' : 'UNAVAILABLE'
    } else if (match) {
      assessedReady = match.state === 'READY'
      runtimeStatus = assessedReady ? 'CONNECTED' : 'UNAVAILABLE'
    } else if (row.gateId === 'CONTRACTS_DEPLOYED') {
      assessedReady = contractsDeployed
      runtimeStatus = contractsDeployed ? 'CONNECTED' : 'NOT_CONFIGURED'
    } else if (row.gateId === 'LB-G04B') {
      const g04b = consumed.find((g) => g.id === 'LB-G04B')
      assessedReady = feeReceiverValid && (g04b ? g04b.state === 'READY' : feeReceiverValid)
      runtimeStatus = assessedReady ? 'CONNECTED' : feeReceiverValid ? 'PARTIAL' : 'NOT_CONFIGURED'
    }
    return {
      ...row,
      runtimeStatus,
      assessedReady,
    }
  })

  const activationAuthorized =
    input.activationAuthorized === true &&
    executionCriticalGatesReady &&
    deploymentInputsValid &&
    !input.manualActivationAttempt &&
    !input.privateKeyConfigViolation &&
    input.manualOverrideForbidden !== false

  let productStatus: ProductActivationStatus
  if (input.manualActivationAttempt || input.privateKeyConfigViolation || input.manualOverrideForbidden === false) {
    productStatus = 'FAILED'
  } else if (activationAuthorized) {
    // Accounting degradation does not demote primary readiness.
    productStatus = 'READY'
  } else if (
    executionCriticalGatesReady &&
    deploymentInputsValid &&
    input.activationAuthorized !== true
  ) {
    productStatus = 'READY_FOR_ACTIVATION'
  } else if (!contractsDeployed) {
    productStatus = 'BLOCKED'
  } else if (!executionCriticalGatesReady || input.activationAuthorized !== true) {
    productStatus = 'PENDING_EXTERNAL_ACTIVATION'
  } else {
    productStatus = 'BLOCKED'
  }

  const uiMode: ActivationGateConsumerResult['uiMode'] =
    productStatus === 'READY' || productStatus === 'READY_FOR_ACTIVATION'
      ? 'available'
      : productStatus === 'FAILED' || productStatus === 'BLOCKED'
        ? 'blocked'
        : 'pending'

  const secondaryWarning = accountingDegraded
    ? 'Treasury accounting synchronization delayed'
    : null

  return {
    schemaVersion: 'melega.liquidity-building.activation-gate-consumer.v1',
    productStatus,
    activationAuthorized,
    mainnetCycleAuthorized: input.mainnetCycleAuthorized === true && activationAuthorized,
    deploymentInputsValid,
    contractsDeployed,
    executionCriticalGatesReady,
    allRequiredGatesReady: executionCriticalGatesReady,
    accountingReadiness,
    accountingDegraded,
    feeReceiverValid,
    validatorResult: input.validatorResult,
    gates: consumed,
    executionBlockers,
    accountingBlockers,
    warnings,
    gateClassifications,
    blockers: executionBlockers,
    uiMode,
    assessedAt,
    manualOverrideForbidden,
    secondaryWarning,
  }
}

function resolveRepoPaths(filename: string): string[] {
  const cwd = process.cwd()
  return [
    path.join(cwd, 'deployments/liquidity-building/chain-56', filename),
    path.join(cwd, '../../deployments/liquidity-building/chain-56', filename),
    path.resolve(__dirname, '../../../../../deployments/liquidity-building/chain-56', filename),
    path.resolve(__dirname, '../../../../../../deployments/liquidity-building/chain-56', filename),
  ]
}

function readJsonIfExists(candidates: string[]): Record<string, unknown> | null {
  for (const p of candidates) {
    if (!existsSync(p)) continue
    try {
      return JSON.parse(readFileSync(p, 'utf8')) as Record<string, unknown>
    } catch {
      return null
    }
  }
  return null
}

/**
 * Server-side load of verified activation artifacts (read-only).
 * Fail-closed when artifacts missing or unreadable.
 */
export function loadAndConsumeActivationGates(assessedAt = new Date().toISOString()): ActivationGateConsumerResult {
  const gateDoc = readJsonIfExists(resolveRepoPaths('activation-gate-final.v1.json'))
  const inputsDoc = readJsonIfExists(resolveRepoPaths('LiquidityBuildingV1.inputs.json'))

  if (!gateDoc) {
    return consumeActivationGates(
      {
        activationAuthorized: false,
        validatorResult: 'DEPLOYMENT_INPUTS_BLOCKED',
        deploymentReadinessState: 'BLOCKED',
        gates: [],
        addresses: {
          lbFactory: null,
          lbAuthorizer: null,
          lbFeeSink: null,
          treasuryFeeReceiver: null,
          programAddress: null,
        },
        privateKeyConfigViolation: false,
        manualActivationAttempt: false,
      },
      assessedAt,
    )
  }

  const treasury = (inputsDoc?.treasury ?? {}) as Record<string, unknown>
  const authorizer = (inputsDoc?.authorizer ?? {}) as Record<string, unknown>
  const factory = (inputsDoc?.factory ?? {}) as Record<string, unknown>

  return consumeActivationGates(
    {
      activationAuthorized: gateDoc.activationAuthorized === true,
      mainnetCycleAuthorized: gateDoc.mainnetCycleAuthorized === true,
      manualOverrideForbidden: gateDoc.manualOverrideForbidden !== false,
      validatorResult: typeof gateDoc.validatorResult === 'string' ? gateDoc.validatorResult : null,
      deploymentReadinessState:
        typeof inputsDoc?.deploymentReadinessState === 'string'
          ? (inputsDoc.deploymentReadinessState as string)
          : 'BLOCKED',
      runtimeHealthExpected:
        typeof gateDoc.runtimeHealthExpected === 'string' ? (gateDoc.runtimeHealthExpected as string) : null,
      gates: Array.isArray(gateDoc.gates) ? (gateDoc.gates as ActivationGateConsumerInput['gates']) : [],
      addresses: {
        lbFactory: typeof factory.address === 'string' ? factory.address : null,
        lbAuthorizer: typeof authorizer.address === 'string' ? authorizer.address : null,
        lbFeeSink: typeof treasury.feeSinkAddress === 'string' ? treasury.feeSinkAddress : null,
        treasuryFeeReceiver: typeof treasury.receiverAddress === 'string' ? treasury.receiverAddress : null,
        programAddress: null,
      },
      manualActivationAttempt: false,
      privateKeyConfigViolation: false,
    },
    assessedAt,
  )
}
