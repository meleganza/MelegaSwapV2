import { describe, expect, it } from 'vitest'
import {
  assessFounderGasReadiness,
  fundingRequiredAllowed,
  loadCertifiedLbArtifacts,
  buildLbDeploySteps,
  buildLbEconomicReviewFields,
  resolveFounderOperationalState,
  assessFounderDeployGates,
  AUTHORIZED_MELEGA_DEPLOYER,
  createMockEthereum,
  walletEstimateDeployGas,
  walletSendDeployTransaction,
  isUserRejectedError,
  WEI_PER_BNB,
} from 'lib/deployment-orchestrator'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const DEPLOYER = AUTHORIZED_MELEGA_DEPLOYER

describe('gas readiness invariants', () => {
  it('null / pending estimate never emits FUNDING_REQUIRED', () => {
    const pending = assessFounderGasReadiness({
      balanceWei: 1n,
      estimateStatus: 'pending',
    })
    expect(pending.pauseCode).toBeNull()
    expect(pending.estimateStatus).toBe('pending')
    expect(
      fundingRequiredAllowed({
        estimateStatus: 'pending',
        estimatedTotalCostWei: null,
        balanceWei: '1',
      }),
    ).toBe(false)

    const unavailable = assessFounderGasReadiness({
      balanceWei: 1n,
      estimateStatus: 'unavailable',
      error: 'rpc timeout',
    })
    expect(unavailable.pauseCode).toBeNull()
    expect(unavailable.message).toMatch(/unavailable/i)

    const state = resolveFounderOperationalState({
      gates: assessFounderDeployGates({
        connectedWallet: DEPLOYER,
        chainId: 56,
        artifactValid: true,
        constructorValid: true,
        subsystemReady: true,
      }),
      gas: pending,
      artifactStatus: 'ARTIFACTS_VALID',
    })
    expect(state).toBe('GAS_ESTIMATE_PENDING')
    expect(state).not.toBe('FUNDING_REQUIRED')
  })

  it('known insufficient balance emits FUNDING_REQUIRED only after estimate ready', () => {
    const cost = WEI_PER_BNB // 1 BNB
    const gas = assessFounderGasReadiness({
      balanceWei: WEI_PER_BNB / 50n, // 0.02 BNB
      estimateStatus: 'ready',
      gasPriceWei: 3_000_000_000n,
      estimatedTotalCostWei: cost,
      perTx: [
        {
          stepId: 'x',
          contractName: 'X',
          gasUnits: '1',
          gasPriceWei: '1',
          costWei: cost.toString(),
          costBnb: '1',
        },
      ],
    })
    expect(gas.pauseCode).toBe('FOUNDER_DEPLOYER_FUNDING_REQUIRED')
    expect(gas.fundingSufficient).toBe(false)
    expect(gas.shortfallWei).not.toBeNull()
  })

  it('known sufficient balance emits READY_TO_DEPLOY', () => {
    const cost = 10_000_000_000_000_000n // 0.01 BNB
    const gas = assessFounderGasReadiness({
      balanceWei: WEI_PER_BNB, // 1 BNB
      estimateStatus: 'ready',
      estimatedTotalCostWei: cost,
      perTx: [
        {
          stepId: 'x',
          contractName: 'X',
          gasUnits: '1',
          gasPriceWei: '1',
          costWei: cost.toString(),
          costBnb: '0.01',
        },
      ],
    })
    expect(gas.pauseCode).toBeNull()
    expect(gas.fundingSufficient).toBe(true)
    const state = resolveFounderOperationalState({
      gates: assessFounderDeployGates({
        connectedWallet: DEPLOYER,
        chainId: 56,
        artifactValid: true,
        constructorValid: true,
        subsystemReady: true,
      }),
      gas,
      artifactStatus: 'ARTIFACTS_VALID',
    })
    expect(state).toBe('READY_TO_DEPLOY')
  })
})

describe('certified LB artifacts + sequence', () => {
  it('loads certified bytecode with matching runtime hashes', () => {
    const loaded = loadCertifiedLbArtifacts()
    expect(loaded.status).toBe('ARTIFACTS_VALID')
    expect(loaded.invalidReasons).toEqual([])
    expect(loaded.deployOrder[0]).toBe('LiquidityBuildingExecutionMathV1')
    expect(loaded.artifacts.LiquidityBuildingFactoryV1.creationBytecode.startsWith('0x')).toBe(true)
  })

  it('exposes human-readable economics and deployable first step data', () => {
    const econ = buildLbEconomicReviewFields()
    expect(econ.some((f) => f.label === 'Protocol fee' && f.value.includes('10%'))).toBe(true)
    expect(econ.some((f) => f.value.includes('0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b'))).toBe(true)

    const built = buildLbDeploySteps({})
    expect(built.artifactStatus).toBe('ARTIFACTS_VALID')
    const first = built.steps[0]
    expect(first.contractName).toBe('LiquidityBuildingExecutionMathV1')
    expect(first.deploymentData?.startsWith('0x')).toBe(true)
    expect(first.artifactVerified).toBe(true)

    const feeReceiver = built.steps[1]
    expect(feeReceiver.deploymentData?.startsWith('0x')).toBe(true)
    expect(feeReceiver.humanFields.some((f) => f.label.includes('Treasury'))).toBe(true)
  })

  it('empty bytecode / wrong hash would invalidate package', () => {
    const loaded = loadCertifiedLbArtifacts()
    for (const name of loaded.deployOrder) {
      expect(loaded.artifacts[name].creationBytecode.length).toBeGreaterThan(10)
      expect(loaded.artifacts[name].runtimeHashMatchesCertified).toBe(true)
    }
  })
})

describe('browser wallet mock execution', () => {
  it('estimates and requests wallet signature without server signer', async () => {
    const eth = createMockEthereum({ estimateGasWei: 2_000_000n, gasPriceWei: 3_000_000_000n })
    const units = await walletEstimateDeployGas(eth, DEPLOYER, '0x6000')
    expect(units).toBe(2_000_000n)
    const hash = await walletSendDeployTransaction(eth, DEPLOYER, '0x6000')
    expect(hash).toMatch(/^0x[a-f0-9]{64}$/i)
  })

  it('wallet rejection returns recoverable state', async () => {
    const eth = createMockEthereum({ rejectSend: true })
    try {
      await walletSendDeployTransaction(eth, DEPLOYER, '0x6000')
      expect.fail('should reject')
    } catch (e) {
      expect(isUserRejectedError(e)).toBe(true)
    }
  })

  it('Founder shell wires deploy CTA and gas controls without KMS / server signer', () => {
    const ui = readFileSync(
      path.resolve(__dirname, '../../../views/DeploymentOrchestrator/FounderDeploymentShell.tsx'),
      'utf8',
    )
    expect(ui).toContain('Estimate Deployment Gas')
    expect(ui).toContain('Retry Gas Estimate')
    expect(ui).toContain('founder-review-checkbox')
    expect(ui).toMatch(/Deploy \$\{step\.contractName\}|Deploy Create Token Factory/)
    expect(ui).toContain('walletSendDeployTransaction')
    expect(ui).not.toContain('MAINNET_DEPLOYER')
    expect(ui).not.toMatch(/Missing KMS/i)
    expect(ui).not.toContain('Production authority missing')
    expect(ui).toContain('Technical JSON (collapsed)')
    expect(ui).not.toMatch(/Load certified creation bytecode/i)
    expect(ui).toContain('Certified artifact loaded')
  })
})
