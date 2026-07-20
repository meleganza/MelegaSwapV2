/**
 * LB021 — Melega DEX-side read-only activation gate consumer.
 *
 * Consumes verified external activation status. Does not become the authority.
 * Source of truth: deployment validator + activation-gate-final + production inputs.
 * Never invents PASS. Never allows manual activation override.
 */

import { existsSync, readFileSync } from 'fs'
import path from 'path'

const ZERO = '0x0000000000000000000000000000000000000000'

function isDeployedAddress(value: string | null | undefined): value is string {
  if (!value) return false
  const v = value.toLowerCase()
  return v !== ZERO.toLowerCase() && /^0x[a-f0-9]{40}$/.test(v)
}

/** External gates LB021 must consume (read-only). */
export const LB021_REQUIRED_GATES = [
  'LB-G03B',
  'LB-G11',
  'LB-G03C',
  'LB-G04B',
  'LB-G04C/G12',
  'LB-G08',
  'LB-G10',
] as const

export type Lb021GateId = (typeof LB021_REQUIRED_GATES)[number]

/** Per-gate machine state — no infrastructure jargon in product mapping. */
export type ExternalGateState = 'READY' | 'BLOCKED'

/**
 * Deterministic product activation status.
 * UI maps these without exposing KMS / Treasury / BC003S terminology.
 */
export type ProductActivationStatus =
  | 'READY'
  | 'BLOCKED'
  | 'PENDING_EXTERNAL_ACTIVATION'
  | 'FAILED'

export type ConsumedGate = {
  id: Lb021GateId
  state: ExternalGateState
  source: string
  /** Machine evidence only — never render raw to end users. */
  evidence: string | null
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
  validatorResult: string | null
  gates: ConsumedGate[]
  allRequiredGatesReady: boolean
  blockers: string[]
  /** Safe for UI — no infra names */
  uiMode: 'available' | 'pending' | 'blocked'
  assessedAt: string
  manualOverrideForbidden: true
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
  // Match rows whose blocker list includes this id, or gate title aliases.
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
    if (blockers.includes(id) || blockers.some((b) => b === id || (id === 'LB-G04C/G12' && (b === 'LB-G04C' || b === 'LB-G12')))) {
      return true
    }
    const title = String(g.gate ?? '')
    return aliases[id].some((re) => re.test(title) || re.test(String(g.blocker ?? '')))
  })

  if (matches.length === 0) {
    return { ready: false, source: 'activation-gate-final', evidence: `MISSING_GATE_ROW:${id}` }
  }

  // READY only when every matched blocking row is PASS (never invent PASS).
  const ready = matches.every((g) => String(g.status).toUpperCase() === 'PASS')
  const evidence = matches.map((g) => g.evidence || g.blockingReason || g.status || null).filter(Boolean).join(' | ') || null
  return { ready, source: 'activation-gate-final.v1.json', evidence }
}

/**
 * Pure consumer — deterministic, fail-closed, no network, no authority.
 */
export function consumeActivationGates(
  input: ActivationGateConsumerInput,
  assessedAt = new Date().toISOString(),
): ActivationGateConsumerResult {
  const manualOverrideForbidden = true
  const consumed: ConsumedGate[] = LB021_REQUIRED_GATES.map((id) => {
    const { ready, source, evidence } = gatePasses(input.gates, id)
    return {
      id,
      state: ready ? 'READY' : 'BLOCKED',
      source,
      evidence,
    }
  })

  const allRequiredGatesReady = consumed.every((g) => g.state === 'READY')

  const addresses = input.addresses ?? {}
  const contractsDeployed =
    isDeployedAddress(addresses.lbFactory) &&
    isDeployedAddress(addresses.lbAuthorizer) &&
    isDeployedAddress(addresses.lbFeeSink)

  const validatorOk =
    input.validatorResult === 'VALID' ||
    input.validatorResult === 'DEPLOYMENT_INPUTS_VALID' ||
    input.validatorResult === 'PASS'

  const readinessOk =
    input.deploymentReadinessState === 'VALID' || input.deploymentReadinessState === 'DEPLOYED'

  // DEPLOYMENT_INPUTS_VALID only when addresses exist, readiness VALID/DEPLOYED, validator ok, gates pass.
  const deploymentInputsValid =
    validatorOk && readinessOk && contractsDeployed && allRequiredGatesReady && input.activationAuthorized === true

  const blockers: string[] = []
  for (const g of consumed) {
    if (g.state === 'BLOCKED') blockers.push(g.id)
  }
  if (!validatorOk) blockers.push('DEPLOYMENT_INPUTS_BLOCKED')
  if (!contractsDeployed) blockers.push('CONTRACTS_NOT_DEPLOYED')
  if (input.manualActivationAttempt) blockers.push('MANUAL_ACTIVATION_FORBIDDEN')
  if (input.privateKeyConfigViolation) blockers.push('PRIVATE_KEY_CONFIG_FORBIDDEN')
  if (input.manualOverrideForbidden === false) blockers.push('OVERRIDE_FLAG_REJECTED')

  let productStatus: ProductActivationStatus
  if (input.manualActivationAttempt || input.privateKeyConfigViolation || input.manualOverrideForbidden === false) {
    productStatus = 'FAILED'
  } else if (
    input.activationAuthorized === true &&
    allRequiredGatesReady &&
    deploymentInputsValid &&
    contractsDeployed
  ) {
    productStatus = 'READY'
  } else if (!allRequiredGatesReady || input.activationAuthorized !== true) {
    // Melega DEX implementation frozen; waiting on external activation evidence.
    productStatus = 'PENDING_EXTERNAL_ACTIVATION'
  } else {
    productStatus = 'BLOCKED'
  }

  const uiMode: ActivationGateConsumerResult['uiMode'] =
    productStatus === 'READY' ? 'available' : productStatus === 'FAILED' || productStatus === 'BLOCKED' ? 'blocked' : 'pending'

  // Never elevate authorization beyond source of truth.
  const activationAuthorized =
    input.activationAuthorized === true &&
    allRequiredGatesReady &&
    deploymentInputsValid &&
    !input.manualActivationAttempt &&
    !input.privateKeyConfigViolation &&
    input.manualOverrideForbidden !== false

  return {
    schemaVersion: 'melega.liquidity-building.activation-gate-consumer.v1',
    productStatus,
    activationAuthorized,
    mainnetCycleAuthorized: input.mainnetCycleAuthorized === true && activationAuthorized,
    deploymentInputsValid,
    contractsDeployed,
    validatorResult: input.validatorResult,
    gates: consumed,
    allRequiredGatesReady,
    blockers,
    uiMode,
    assessedAt,
    manualOverrideForbidden,
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
        programAddress: null,
      },
      manualActivationAttempt: false,
      privateKeyConfigViolation: false,
    },
    assessedAt,
  )
}
