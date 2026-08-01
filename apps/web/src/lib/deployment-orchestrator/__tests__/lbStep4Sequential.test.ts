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
  LB_STEP4_CONTRACT,
  bindValidatedLbStep,
  emptyFounderLbSession,
  runtimeHashForCertifiedCompare,
  seedSessionWithValidatedStep1,
  seedSessionWithValidatedStep2,
  seedSessionWithValidatedStep3,
  sha256Bytecode,
  step3IsValidated,
  validateLbStepFromOnChain,
  verifyAuthorizerConstructorState,
} from 'lib/deployment-orchestrator/founderLbSession'
import { LB_CANONICAL_DEPLOYED_ADDRESSES } from 'config/constants/liquidityBuildingDeployment'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const STEP3_ADDR = LB_STEP3_FACTUAL.contractAddress
const STEP3_TX = LB_STEP3_FACTUAL.txHash

describe('LB Step 3 validation + Step 4 unlock', () => {
  it('canonical binding records Authorizer only for Step 3 (prior steps unchanged, later null)', () => {
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbExecutionMathLibrary).toBe(LB_STEP1_FACTUAL.contractAddress)
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbFeeReceiver).toBe(LB_STEP2_FACTUAL.contractAddress)
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbAuthorizer).toBe(STEP3_ADDR)
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbFeeSink).toBeNull()
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbFactory).toBeNull()
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbProgramImplementation).toBeNull()
  })

  it('deployed-addresses artifact binds Step 3 Authorizer', () => {
    const artifact = JSON.parse(
      readFileSync(
        path.resolve(__dirname, '../../../../../../deployments/liquidity-building/chain-56/deployed-addresses.v1.json'),
        'utf8',
      ),
    )
    expect(artifact.addresses.lbAuthorizer).toBe(STEP3_ADDR)
    expect(artifact.deployments.LiquidityBuildingExecutionAuthorizerV1.transactionHash).toBe(STEP3_TX)
    expect(artifact.deployments.LiquidityBuildingExecutionAuthorizerV1.status).toBe('VALIDATED')
    expect(artifact.deployments.LiquidityBuildingExecutionAuthorizerV1.signingAuthority).toBe(
      AUTHORIZED_MELEGA_DEPLOYER,
    )
    expect(artifact.deployments.LiquidityBuildingExecutionAuthorizerV1.authorityType).toBe(1)
    expect(artifact.addresses.lbFeeSink).toBeNull()
  })

  it('constructor state verifier accepts DEPLOYER authority + ERC1271 type', () => {
    const ok = verifyAuthorizerConstructorState({
      signingAuthority: AUTHORIZED_MELEGA_DEPLOYER,
      authorityType: 1,
    })
    expect(ok.ok).toBe(true)
    const badAuth = verifyAuthorizerConstructorState({
      signingAuthority: '0x1111111111111111111111111111111111111111',
      authorityType: 1,
    })
    expect(badAuth.ok).toBe(false)
    expect(badAuth.reason).toMatch(/STEP3_VALIDATION_FAILED/)
    const badType = verifyAuthorizerConstructorState({
      signingAuthority: AUTHORIZED_MELEGA_DEPLOYER,
      authorityType: 0,
    })
    expect(badType.ok).toBe(false)
  })

  it('validateLbStepFromOnChain accepts Authorizer when masked runtime matches certified template', () => {
    const certified = loadCertifiedLbArtifacts().artifacts.LiquidityBuildingExecutionAuthorizerV1
    const runtime = `0x${'ab'.repeat(2869)}`
    const expected = runtimeHashForCertifiedCompare('LiquidityBuildingExecutionAuthorizerV1', runtime)
    const result = validateLbStepFromOnChain({
      stepId: LB_STEP3_FACTUAL.stepId,
      contractName: LB_STEP3_FACTUAL.contractName,
      chainId: 56,
      txHash: STEP3_TX,
      receipt: {
        status: '0x1',
        contractAddress: STEP3_ADDR,
        from: AUTHORIZED_MELEGA_DEPLOYER,
      },
      runtimeBytecode: runtime,
      expectedRuntimeBytecodeSha256: expected,
      requireDeployer: AUTHORIZED_MELEGA_DEPLOYER,
      expectedContractAddress: STEP3_ADDR,
      constructorStateOk: true,
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.record.status).toBe('VALIDATED')
      expect(result.record.contractAddress.toLowerCase()).toBe(STEP3_ADDR.toLowerCase())
      expect(result.record.runtimeBytecodeSha256).toBe(sha256Bytecode(runtime))
    }
    expect(certified.expectedRuntimeBytecodeSha256).toBe(LB_STEP3_FACTUAL.expectedRuntimeBytecodeSha256)
  })

  it('rejects Authorizer when runtime does not match certified (even after mask)', () => {
    const runtime = `0x${'cd'.repeat(2869)}`
    const result = validateLbStepFromOnChain({
      stepId: LB_STEP3_FACTUAL.stepId,
      contractName: LB_STEP3_FACTUAL.contractName,
      chainId: 56,
      txHash: STEP3_TX,
      receipt: {
        status: '0x1',
        contractAddress: STEP3_ADDR,
        from: AUTHORIZED_MELEGA_DEPLOYER,
      },
      runtimeBytecode: runtime,
      expectedRuntimeBytecodeSha256: LB_STEP3_FACTUAL.expectedRuntimeBytecodeSha256,
      requireDeployer: AUTHORIZED_MELEGA_DEPLOYER,
    })
    expect(result.ok).toBe(false)
  })

  it('seeded session marks Step 3 VALIDATED and unlocks Step 4 FeeSink', () => {
    const session = seedSessionWithValidatedStep3(
      seedSessionWithValidatedStep2(seedSessionWithValidatedStep1(emptyFounderLbSession())),
    )
    expect(step3IsValidated(session)).toBe(true)
    expect(session.deployed.authorizer).toBe(STEP3_ADDR)
    expect(session.deployed.feeReceiver).toBe(LB_STEP2_FACTUAL.contractAddress)
    expect(session.deployed.math).toBe(LB_STEP1_FACTUAL.contractAddress)
    expect(session.completedStepIds).toEqual([
      'LiquidityBuildingExecutionMathV1',
      'LiquidityBuildingTreasuryFeeReceiverV1',
      'LiquidityBuildingExecutionAuthorizerV1',
    ])

    const order = loadCertifiedLbArtifacts().deployOrder
    expect(order[3]).toBe(LB_STEP4_CONTRACT)

    const built = buildLbDeploySteps(session.deployed)
    const active = activeLbStep(built.steps, session.completedStepIds)
    expect(active?.contractName).toBe(LB_STEP4_CONTRACT)
    expect(active?.index).toBe(4)
    expect(active?.deploymentData?.startsWith('0x')).toBe(true)
    expect(active?.blockedReason).toBeNull()
    expect(active?.dependencies).toEqual(['LiquidityBuildingTreasuryFeeReceiverV1'])
    expect(active?.constructorArgs[0].value.toLowerCase()).toBe(LB_STEP2_FACTUAL.contractAddress.toLowerCase())
  })

  it('Step 4 FeeSink resolves feeReceiver from factual Step 2 binding only', () => {
    const session = seedSessionWithValidatedStep3(seedSessionWithValidatedStep2(seedSessionWithValidatedStep1()))
    const built = buildLbDeploySteps(session.deployed)
    const sink = built.steps.find((s) => s.contractName === LB_STEP4_CONTRACT)
    expect(sink?.blockedReason).toBeNull()
    expect(sink?.constructorArgs.map((a) => a.name)).toEqual(['treasuryReceiver_'])
    expect(sink?.constructorArgs[0].value.toLowerCase()).toBe(LB_STEP2_FACTUAL.contractAddress.toLowerCase())

    const withoutFee = buildLbDeploySteps({
      math: session.deployed.math,
      authorizer: session.deployed.authorizer,
    })
    const blocked = withoutFee.steps.find((s) => s.contractName === LB_STEP4_CONTRACT)
    expect(blocked?.blockedReason).toMatch(/FeeReceiver/i)
  })

  it('Step 4 CTA can reach READY_TO_DEPLOY; creation request has no to (no auto broadcast)', () => {
    const session = seedSessionWithValidatedStep3(seedSessionWithValidatedStep2(seedSessionWithValidatedStep1()))
    const built = buildLbDeploySteps(session.deployed)
    const step4 = activeLbStep(built.steps, session.completedStepIds)!
    expect(step4.contractName).toBe(LB_STEP4_CONTRACT)

    const gates = assessFounderDeployGates({
      connectedWallet: AUTHORIZED_MELEGA_DEPLOYER,
      chainId: 56,
      balanceWei: WEI_PER_BNB,
      artifactValid: built.artifactStatus === 'ARTIFACTS_VALID',
      constructorValid: Boolean(step4.deploymentData && !step4.blockedReason),
      subsystemReady: true,
    })
    const cost = 10_000_000_000_000_000n
    const gas = assessFounderGasReadiness({
      balanceWei: WEI_PER_BNB,
      estimateStatus: 'ready',
      estimatedTotalCostWei: cost,
      perTx: [
        {
          stepId: step4.stepId,
          contractName: step4.contractName,
          gasUnits: '250000',
          gasPriceWei: '3000000000',
          costWei: cost.toString(),
          costBnb: '0.01',
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
      data: step4.deploymentData!,
      gasUnits: 500000n,
    })
    expect(req.value).toBe('0x0')
    expect(req).not.toHaveProperty('to')
  })

  it('refuses to overwrite Step 3 binding with a different address', () => {
    const session = seedSessionWithValidatedStep3(seedSessionWithValidatedStep2(seedSessionWithValidatedStep1()))
    expect(() =>
      bindValidatedLbStep(session, {
        stepId: LB_STEP3_FACTUAL.stepId,
        contractName: LB_STEP3_FACTUAL.contractName,
        contractAddress: '0x1111111111111111111111111111111111111111',
        txHash: STEP3_TX,
        chainId: 56,
        runtimeBytecodeSha256: LB_STEP3_FACTUAL.observedRuntimeBytecodeSha256,
        status: 'VALIDATED',
        validatedAt: new Date().toISOString(),
      }),
    ).toThrow(/overwrite/i)
  })

  it('sequence lock: Step 4 is not active until Step 3 is completed', () => {
    const onlyTwo = seedSessionWithValidatedStep2(seedSessionWithValidatedStep1())
    const built = buildLbDeploySteps(onlyTwo.deployed)
    const active = activeLbStep(built.steps, onlyTwo.completedStepIds)
    expect(active?.contractName).toBe('LiquidityBuildingExecutionAuthorizerV1')
    expect(active?.contractName).not.toBe(LB_STEP4_CONTRACT)
  })
})
