import { describe, expect, it } from 'vitest'
import {
  AUTHORIZED_MELEGA_DEPLOYER,
  activeLbStep,
  buildLbDeploySteps,
  buildContractCreationRequest,
  assessFounderDeployGates,
  assessFounderGasReadiness,
  resolveFounderOperationalState,
  WEI_PER_BNB,
  loadCertifiedLbArtifacts,
} from 'lib/deployment-orchestrator'
import {
  LB_STEP1_FACTUAL,
  LB_STEP2_FACTUAL,
  LB_STEP3_FACTUAL,
  LB_STEP4_FACTUAL,
  LB_STEP5_CONTRACT,
  bindValidatedLbStep,
  emptyFounderLbSession,
  runtimeHashForCertifiedCompare,
  seedSessionWithValidatedStep1,
  seedSessionWithValidatedStep2,
  seedSessionWithValidatedStep3,
  seedSessionWithValidatedStep4,
  sha256Bytecode,
  step4IsValidated,
  validateLbStepFromOnChain,
  verifyFeeSinkConstructorState,
} from 'lib/deployment-orchestrator/founderLbSession'
import { LB_CANONICAL_DEPLOYED_ADDRESSES } from 'config/constants/liquidityBuildingDeployment'
import { FOUNDER_TREASURY_DESTINATION } from 'lib/deployment-orchestrator/founderDeployer'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const STEP4_ADDR = LB_STEP4_FACTUAL.contractAddress
const STEP4_TX = LB_STEP4_FACTUAL.txHash

function seedThroughStep4() {
  return seedSessionWithValidatedStep4(
    seedSessionWithValidatedStep3(seedSessionWithValidatedStep2(seedSessionWithValidatedStep1(emptyFounderLbSession()))),
  )
}

describe('LB Step 4 validation + Step 5 unlock', () => {
  it('canonical binding records FeeSink only for Step 4 (priors unchanged, later null)', () => {
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbExecutionMathLibrary).toBe(LB_STEP1_FACTUAL.contractAddress)
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbFeeReceiver).toBe(LB_STEP2_FACTUAL.contractAddress)
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbAuthorizer).toBe(LB_STEP3_FACTUAL.contractAddress)
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbFeeSink).toBe(STEP4_ADDR)
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbFactory).toBeNull()
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbProgramImplementation).toBeNull()
  })

  it('deployed-addresses artifact binds Step 4 FeeSink', () => {
    const artifact = JSON.parse(
      readFileSync(
        path.resolve(__dirname, '../../../../../../deployments/liquidity-building/chain-56/deployed-addresses.v1.json'),
        'utf8',
      ),
    )
    expect(artifact.addresses.lbFeeSink).toBe(STEP4_ADDR)
    expect(artifact.deployments.LiquidityBuildingTreasuryFeeSinkV1.transactionHash).toBe(STEP4_TX)
    expect(artifact.deployments.LiquidityBuildingTreasuryFeeSinkV1.status).toBe('VALIDATED')
    expect(artifact.deployments.LiquidityBuildingTreasuryFeeSinkV1.treasuryReceiver).toBe(
      LB_STEP2_FACTUAL.contractAddress,
    )
    expect(artifact.addresses.lbProgramImplementation).toBeNull()
  })

  it('constructor state verifier requires FeeReceiver (rejects Treasury wallet)', () => {
    const ok = verifyFeeSinkConstructorState({
      treasuryReceiver: LB_STEP2_FACTUAL.contractAddress,
    })
    expect(ok.ok).toBe(true)
    expect(ok.notDirectTreasury).toBe(true)
    const directTreasury = verifyFeeSinkConstructorState({
      treasuryReceiver: FOUNDER_TREASURY_DESTINATION,
    })
    expect(directTreasury.ok).toBe(false)
    expect(directTreasury.reason).toMatch(/STEP4_VALIDATION_FAILED/)
  })

  it('validateLbStepFromOnChain accepts FeeSink when masked runtime matches certified template', () => {
    const certified = loadCertifiedLbArtifacts().artifacts.LiquidityBuildingTreasuryFeeSinkV1
    const runtime = `0x${'ab'.repeat(3105)}`
    const expected = runtimeHashForCertifiedCompare('LiquidityBuildingTreasuryFeeSinkV1', runtime)
    const result = validateLbStepFromOnChain({
      stepId: LB_STEP4_FACTUAL.stepId,
      contractName: LB_STEP4_FACTUAL.contractName,
      chainId: 56,
      txHash: STEP4_TX,
      receipt: {
        status: '0x1',
        contractAddress: STEP4_ADDR,
        from: AUTHORIZED_MELEGA_DEPLOYER,
      },
      runtimeBytecode: runtime,
      expectedRuntimeBytecodeSha256: expected,
      requireDeployer: AUTHORIZED_MELEGA_DEPLOYER,
      expectedContractAddress: STEP4_ADDR,
      constructorStateOk: true,
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.record.status).toBe('VALIDATED')
      expect(result.record.contractAddress.toLowerCase()).toBe(STEP4_ADDR.toLowerCase())
      expect(result.record.runtimeBytecodeSha256).toBe(sha256Bytecode(runtime))
    }
    expect(certified.expectedRuntimeBytecodeSha256).toBe(LB_STEP4_FACTUAL.expectedRuntimeBytecodeSha256)
  })

  it('rejects FeeSink when runtime does not match certified (even after mask)', () => {
    const runtime = `0x${'cd'.repeat(3105)}`
    const result = validateLbStepFromOnChain({
      stepId: LB_STEP4_FACTUAL.stepId,
      contractName: LB_STEP4_FACTUAL.contractName,
      chainId: 56,
      txHash: STEP4_TX,
      receipt: {
        status: '0x1',
        contractAddress: STEP4_ADDR,
        from: AUTHORIZED_MELEGA_DEPLOYER,
      },
      runtimeBytecode: runtime,
      expectedRuntimeBytecodeSha256: LB_STEP4_FACTUAL.expectedRuntimeBytecodeSha256,
      requireDeployer: AUTHORIZED_MELEGA_DEPLOYER,
    })
    expect(result.ok).toBe(false)
  })

  it('seeded session marks Step 4 VALIDATED and unlocks Step 5 Program', () => {
    const session = seedThroughStep4()
    expect(step4IsValidated(session)).toBe(true)
    expect(session.deployed.feeSink).toBe(STEP4_ADDR)
    expect(session.deployed.authorizer).toBe(LB_STEP3_FACTUAL.contractAddress)
    expect(session.deployed.feeReceiver).toBe(LB_STEP2_FACTUAL.contractAddress)
    expect(session.deployed.math).toBe(LB_STEP1_FACTUAL.contractAddress)
    expect(session.completedStepIds).toEqual([
      'LiquidityBuildingExecutionMathV1',
      'LiquidityBuildingTreasuryFeeReceiverV1',
      'LiquidityBuildingExecutionAuthorizerV1',
      'LiquidityBuildingTreasuryFeeSinkV1',
    ])

    const order = loadCertifiedLbArtifacts().deployOrder
    expect(order[4]).toBe(LB_STEP5_CONTRACT)

    const built = buildLbDeploySteps(session.deployed)
    const active = activeLbStep(built.steps, session.completedStepIds)
    expect(active?.contractName).toBe(LB_STEP5_CONTRACT)
    expect(active?.index).toBe(5)
    expect(active?.deploymentData?.startsWith('0x')).toBe(true)
    expect(active?.blockedReason).toBeNull()
    expect(active?.dependencies).toEqual(['LiquidityBuildingExecutionMathV1'])
  })

  it('Step 5 Program links factual ExecutionMath library address', () => {
    const session = seedThroughStep4()
    const built = buildLbDeploySteps(session.deployed)
    const program = built.steps.find((s) => s.contractName === LB_STEP5_CONTRACT)
    expect(program?.blockedReason).toBeNull()
    expect(program?.humanFields.some((f) => f.value === LB_STEP1_FACTUAL.contractAddress)).toBe(true)
    // Linked creation payload must not still contain solc placeholders
    expect(program?.deploymentData).not.toMatch(/__\$/)

    const withoutMath = buildLbDeploySteps({
      feeReceiver: session.deployed.feeReceiver,
      authorizer: session.deployed.authorizer,
      feeSink: session.deployed.feeSink,
    })
    const blocked = withoutMath.steps.find((s) => s.contractName === LB_STEP5_CONTRACT)
    expect(blocked?.blockedReason).toMatch(/ExecutionMath|Math/i)
  })

  it('Step 5 CTA can reach READY_TO_DEPLOY; creation request has no to (no auto broadcast)', () => {
    const session = seedThroughStep4()
    const built = buildLbDeploySteps(session.deployed)
    const step5 = activeLbStep(built.steps, session.completedStepIds)!
    expect(step5.contractName).toBe(LB_STEP5_CONTRACT)

    const gates = assessFounderDeployGates({
      connectedWallet: AUTHORIZED_MELEGA_DEPLOYER,
      chainId: 56,
      balanceWei: WEI_PER_BNB,
      artifactValid: built.artifactStatus === 'ARTIFACTS_VALID',
      constructorValid: Boolean(step5.deploymentData && !step5.blockedReason),
      subsystemReady: true,
    })
    const cost = 20_000_000_000_000_000n
    const gas = assessFounderGasReadiness({
      balanceWei: WEI_PER_BNB,
      estimateStatus: 'ready',
      estimatedTotalCostWei: cost,
      perTx: [
        {
          stepId: step5.stepId,
          contractName: step5.contractName,
          gasUnits: '800000',
          gasPriceWei: '3000000000',
          costWei: cost.toString(),
          costBnb: '0.02',
        },
      ],
    })
    expect(gas.fundingSufficient).toBe(true)
    expect(
      resolveFounderOperationalState({
        gates,
        gas,
        artifactStatus: 'ARTIFACTS_VALID',
      }),
    ).toBe('READY_TO_DEPLOY')

    const req = buildContractCreationRequest({
      from: AUTHORIZED_MELEGA_DEPLOYER,
      data: step5.deploymentData!,
      gasUnits: 800000n,
    })
    expect(req.value).toBe('0x0')
    expect(req).not.toHaveProperty('to')
  })

  it('refuses to overwrite Step 4 binding with a different address', () => {
    const session = seedThroughStep4()
    expect(() =>
      bindValidatedLbStep(session, {
        stepId: LB_STEP4_FACTUAL.stepId,
        contractName: LB_STEP4_FACTUAL.contractName,
        contractAddress: '0x1111111111111111111111111111111111111111',
        txHash: STEP4_TX,
        chainId: 56,
        runtimeBytecodeSha256: LB_STEP4_FACTUAL.observedRuntimeBytecodeSha256,
        status: 'VALIDATED',
        validatedAt: new Date().toISOString(),
      }),
    ).toThrow(/overwrite/i)
  })

  it('sequence lock: Step 5 is not active until Step 4 is completed', () => {
    const onlyThree = seedSessionWithValidatedStep3(seedSessionWithValidatedStep2(seedSessionWithValidatedStep1()))
    const built = buildLbDeploySteps(onlyThree.deployed)
    const active = activeLbStep(built.steps, onlyThree.completedStepIds)
    expect(active?.contractName).toBe('LiquidityBuildingTreasuryFeeSinkV1')
    expect(active?.contractName).not.toBe(LB_STEP5_CONTRACT)
  })
})
