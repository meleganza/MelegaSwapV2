import { healthFromDependencies } from './state-machine'
import { assertNoPrivateKeySignerConfig } from './signing-adapter'
import type { RuntimeHealthReport, RuntimeHealthStatus } from './types'
import { LB_HEALTH_SCHEMA } from './types'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

export type ReadinessDeps = {
  kmsReady?: boolean
  relayReady?: boolean
  /** @deprecated Prefer feeReceiverValid + treasuryIngestionReady */
  treasuryReady?: boolean
  feeReceiverValid?: boolean
  treasuryIngestionReady?: boolean
  quotePolicyReady?: boolean
  contractsDeployed?: boolean
  observerOk?: boolean
  finalityEvidenceOk?: boolean
  deploymentInputsPath?: string
}

function componentStatus(ok: boolean, blockedFallback: RuntimeHealthStatus = 'BLOCKED'): RuntimeHealthStatus {
  return ok ? 'READY' : blockedFallback
}

/**
 * Production health must never report READY while mandatory execution-critical deps are missing.
 * Treasury ingestion unavailable → DEGRADED / accounting warning, not BLOCKED.
 */
export function assessLiquidityBuildingRuntimeHealth(deps: ReadinessDeps = {}): RuntimeHealthReport {
  const pk = assertNoPrivateKeySignerConfig()
  const kmsReady = deps.kmsReady === true
  const relayReady = deps.relayReady === true
  const feeReceiverValid =
    deps.feeReceiverValid !== undefined ? deps.feeReceiverValid === true : deps.treasuryReady === true
  const treasuryIngestionReady =
    deps.treasuryIngestionReady !== undefined
      ? deps.treasuryIngestionReady === true
      : deps.treasuryReady === true
  const quotePolicyReady = deps.quotePolicyReady === true
  const contractsDeployed = deps.contractsDeployed === true
  const observerOk = deps.observerOk !== false
  const finalityOk = deps.finalityEvidenceOk === true

  let deploymentBlocked = true
  const candidates = [
    deps.deploymentInputsPath,
    path.join(process.cwd(), 'deployments/liquidity-building/chain-56/LiquidityBuildingV1.inputs.json'),
    path.join(process.cwd(), '../../deployments/liquidity-building/chain-56/LiquidityBuildingV1.inputs.json'),
    path.resolve(__dirname, '../../../../../deployments/liquidity-building/chain-56/LiquidityBuildingV1.inputs.json'),
  ].filter(Boolean) as string[]

  for (const p of candidates) {
    if (existsSync(p)) {
      try {
        const doc = JSON.parse(readFileSync(p, 'utf8'))
        deploymentBlocked = doc.deploymentReadinessState !== 'VALID' && doc.deploymentReadinessState !== 'DEPLOYED'
      } catch {
        deploymentBlocked = true
      }
      break
    }
  }

  const { status, blockers, accountingBlockers, warnings, accountingDegraded } = healthFromDependencies({
    kmsReady,
    relayReady,
    feeReceiverValid,
    treasuryIngestionReady,
    quotePolicyReady: quotePolicyReady && !deploymentBlocked,
    contractsDeployed: contractsDeployed && !deploymentBlocked,
    observerOk,
  })

  const reasons = [...blockers]
  if (!pk.ok) reasons.push(`FORBIDDEN_PRIVATE_KEY_CONFIG:${pk.violations.join(',')}`)
  if (!finalityOk) reasons.push('LB-G10:FINALITY_EVIDENCE_INSUFFICIENT')
  if (deploymentBlocked) reasons.push('DEPLOYMENT_INPUTS_BLOCKED')

  const executionReasons = reasons.filter(
    (r) =>
      !r.includes('LB-G04C') &&
      !r.includes('LB-G12') &&
      r !== 'TREASURY_ACCOUNTING_DEGRADED',
  )

  let effective: RuntimeHealthStatus =
    !pk.ok || status === 'FAILED' ? 'FAILED' : status === 'READY' && executionReasons.length ? 'BLOCKED' : status

  if (effective === 'READY' && executionReasons.length) effective = 'BLOCKED'
  if (effective === 'DEGRADED' && executionReasons.length) effective = 'BLOCKED'
  if (
    effective !== 'FAILED' &&
    effective !== 'BLOCKED' &&
    accountingDegraded &&
    executionReasons.length === 0 &&
    status === 'DEGRADED'
  ) {
    effective = 'DEGRADED'
  }

  return {
    schemaVersion: LB_HEALTH_SCHEMA,
    status: effective,
    reasons: [...executionReasons, ...warnings],
    components: {
      observer: componentStatus(observerOk, 'FAILED'),
      finalityLag: componentStatus(finalityOk),
      kmsSigner: componentStatus(kmsReady),
      relay: componentStatus(relayReady),
      treasuryIngestion: componentStatus(treasuryIngestionReady, 'DEGRADED'),
      quotePolicy: componentStatus(quotePolicyReady && !deploymentBlocked),
      programDiscovery: componentStatus(contractsDeployed && !deploymentBlocked),
    },
    blockers: executionReasons.filter(
      (r) => r.startsWith('LB-') || r.includes('DEPLOYMENT') || r.includes('CONTRACT') || r.includes('FORBIDDEN'),
    ),
    accountingBlockers,
    warnings,
    accountingDegraded,
    accountingReadiness: !accountingDegraded,
    generatedAt: new Date().toISOString(),
  }
}
