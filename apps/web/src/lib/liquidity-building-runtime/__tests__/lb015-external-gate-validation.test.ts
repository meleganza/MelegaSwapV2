import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { assessLiquidityBuildingRuntimeHealth } from '../readiness'
import {
  BLOCKED_ACTIVATION_GATES,
  canSubmitMutatingAction,
  transitionProgramStatus,
  PROGRAM_STATUS_LABEL,
} from '../../../views/LiquidityStudio/liquidityBuilding/programStatus'

const ROOT = path.resolve(__dirname, '../../../../../../')
const CHAIN56 = path.join(ROOT, 'deployments/liquidity-building/chain-56')
const VALIDATOR = path.join(ROOT, 'deployments/liquidity-building/validate-lb-v1-inputs-core.mjs')

describe('LB015 external gate validation regressions', () => {
  it('activation gate final remains fail-closed with no override', () => {
    const gate = JSON.parse(readFileSync(path.join(CHAIN56, 'activation-gate-final.v1.json'), 'utf8'))
    expect(gate.activationAuthorized).toBe(false)
    expect(gate.mainnetCycleAuthorized).toBe(false)
    expect(gate.mainnetCycleExecuted).toBe(false)
    expect(gate.manualOverrideForbidden).toBe(true)
  })

  it('deployment inputs stay blocked without placeholders', async () => {
    const inputs = JSON.parse(readFileSync(path.join(CHAIN56, 'LiquidityBuildingV1.inputs.json'), 'utf8'))
    expect(inputs.deploymentReadinessState).toBe('BLOCKED')
    expect(inputs.treasury.receiverAddress).toBeNull()
    expect(inputs.authorizer?.address ?? null).toBeNull()
    expect(inputs.treasury.feeSinkAddress).toBeNull()
    expect(inputs.quotePolicies).toEqual([])
    expect(inputs.productionAuthority?.address ?? null).toBeNull()

    const { validateDeploymentInputs } = await import(/* @vite-ignore */ `file://${VALIDATOR}`)
    const result = validateDeploymentInputs(inputs)
    expect(result.result).toBe('DEPLOYMENT_INPUTS_BLOCKED')
    expect(result.reasons.join(' ')).toMatch(/LB-G03B|LB-G04B|LB-G08/)
  })

  it('runtime health blocked when signer/treasury/quote/relay deps missing', () => {
    const report = assessLiquidityBuildingRuntimeHealth({
      kmsReady: false,
      relayReady: false,
      treasuryReady: false,
      quotePolicyReady: false,
      contractsDeployed: false,
      finalityEvidenceOk: false,
    })
    expect(report.status).not.toBe('READY')
    expect(report.components.kmsSigner).not.toBe('READY')
    expect(report.components.relay).not.toBe('READY')
    expect(report.components.treasuryIngestion).not.toBe('READY')
  })

  it('mutating actions cannot bypass closed gates', () => {
    const gate = canSubmitMutatingAction({
      walletConnected: true,
      correctChain: true,
      gates: BLOCKED_ACTIVATION_GATES,
    })
    expect(gate.ok).toBe(false)
    expect(['DEPLOYMENT_INPUTS_BLOCKED', 'ACTIVATION_NOT_AUTHORIZED']).toContain(gate.reason)
  })

  it('active state mapping remains defined without inventing ACTIVE from NOT_ACTIVE', () => {
    expect(transitionProgramStatus('NOT_ACTIVE', 'ACTIVATE')).toBe('NOT_ACTIVE')
    expect(transitionProgramStatus('READY', 'ACTIVATE')).toBe('ACTIVE')
    expect(PROGRAM_STATUS_LABEL.ACTIVE).toBe('Active')
  })

  it('LB015 artifacts and docs exist; UI has no mock/fake execution copy', () => {
    expect(existsSync(path.join(CHAIN56, 'lb015-external-gate-status.v1.json'))).toBe(true)
    expect(existsSync(path.join(ROOT, 'docs/LB015_EXTERNAL_GATE_STATUS.md'))).toBe(true)
    expect(existsSync(path.join(ROOT, 'docs/LB015_FIRST_CONTROLLED_MAINNET_CYCLE_RUNBOOK.md'))).toBe(true)

    const artifact = JSON.parse(readFileSync(path.join(CHAIN56, 'lb015-external-gate-status.v1.json'), 'utf8'))
    expect(artifact.verdict).toBe('LB015_IMPLEMENTED_WITH_BLOCKERS')
    expect(artifact.mainnetCycleExecuted).toBe(false)
    expect(artifact.blockedByExternalInfrastructure.length).toBeGreaterThanOrEqual(5)
    expect(artifact.security.noManualGateOverride).toBe(true)

    const panel = readFileSync(
      path.join(ROOT, 'apps/web/src/views/LiquidityStudio/components/LiquidityBuildingPanel.tsx'),
      'utf8',
    )
    expect(panel).toMatch(/Liquidity Building unavailable until production activation requirements are completed/)
    expect(panel).toMatch(/Unavailable until activation/)
    expect(panel).toMatch(/No fake liquidity, executions, APY, or simulated activity/)
    expect(panel).not.toMatch(/APY:\s*\d|mock execution successful|simulated activity feed/i)
  })
})
