import { healthFromDependencies } from './state-machine'
import { assertNoPrivateKeySignerConfig } from './signing-adapter'
import type { RuntimeHealthReport, RuntimeHealthStatus } from './types'
import { LB_HEALTH_SCHEMA } from './types'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

export type ReadinessDeps = {
  kmsReady?: boolean
  relayReady?: boolean
  treasuryReady?: boolean
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
 * Production health must never report READY while mandatory LB008/LB009 deps are missing.
 */
export function assessLiquidityBuildingRuntimeHealth(deps: ReadinessDeps = {}): RuntimeHealthReport {
  const pk = assertNoPrivateKeySignerConfig()
  const kmsReady = deps.kmsReady === true
  const relayReady = deps.relayReady === true
  const treasuryReady = deps.treasuryReady === true
  const quotePolicyReady = deps.quotePolicyReady === true
  const contractsDeployed = deps.contractsDeployed === true
  const observerOk = deps.observerOk !== false
  const finalityOk = deps.finalityEvidenceOk === true

  // Deployment inputs — default blocked unless validator would pass (file readiness BLOCKED)
  let deploymentBlocked = true
  const inputsPath =
    deps.deploymentInputsPath ||
    path.join(process.cwd(), '../../deployments/liquidity-building/chain-56/LiquidityBuildingV1.inputs.json')
  // try monorepo roots
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

  const { status, blockers } = healthFromDependencies({
    kmsReady,
    relayReady,
    treasuryReady,
    quotePolicyReady: quotePolicyReady && !deploymentBlocked,
    contractsDeployed: contractsDeployed && !deploymentBlocked,
    observerOk,
  })

  const reasons = [...blockers]
  if (!pk.ok) reasons.push(`FORBIDDEN_PRIVATE_KEY_CONFIG:${pk.violations.join(',')}`)
  if (!finalityOk) reasons.push('LB-G10:FINALITY_EVIDENCE_INSUFFICIENT')
  if (deploymentBlocked) reasons.push('DEPLOYMENT_INPUTS_BLOCKED')

  const effective: RuntimeHealthStatus =
    !pk.ok || status === 'FAILED' ? 'FAILED' : status === 'READY' && reasons.length ? 'BLOCKED' : status

  return {
    schemaVersion: LB_HEALTH_SCHEMA,
    status: effective === 'READY' && reasons.length ? 'BLOCKED' : effective,
    reasons,
    components: {
      observer: componentStatus(observerOk, 'FAILED'),
      finalityLag: componentStatus(finalityOk),
      kmsSigner: componentStatus(kmsReady),
      relay: componentStatus(relayReady),
      treasuryIngestion: componentStatus(treasuryReady),
      quotePolicy: componentStatus(quotePolicyReady && !deploymentBlocked),
      programDiscovery: componentStatus(contractsDeployed && !deploymentBlocked),
    },
    blockers: reasons.filter((r) => r.startsWith('LB-') || r.includes('DEPLOYMENT') || r.includes('CONTRACT')),
    generatedAt: new Date().toISOString(),
  }
}
