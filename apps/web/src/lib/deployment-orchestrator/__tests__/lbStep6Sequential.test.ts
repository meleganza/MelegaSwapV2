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
  linkLibraryBytecode,
} from 'lib/deployment-orchestrator'
import {
  LB_STEP1_FACTUAL,
  LB_STEP2_FACTUAL,
  LB_STEP3_FACTUAL,
  LB_STEP4_FACTUAL,
  LB_STEP5_FACTUAL,
  LB_STEP6_CONTRACT,
  bindValidatedLbStep,
  emptyFounderLbSession,
  runtimeHashForCertifiedCompare,
  seedSessionWithValidatedStep1,
  seedSessionWithValidatedStep2,
  seedSessionWithValidatedStep3,
  seedSessionWithValidatedStep4,
  seedSessionWithValidatedStep5,
  sha256Bytecode,
  step5IsValidated,
  validateLbStepFromOnChain,
  verifyProgramLibraryLink,
} from 'lib/deployment-orchestrator/founderLbSession'
import { LB_CANONICAL_DEPLOYED_ADDRESSES } from 'config/constants/liquidityBuildingDeployment'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const STEP5_ADDR = LB_STEP5_FACTUAL.contractAddress
const STEP5_TX = LB_STEP5_FACTUAL.txHash
const MATH = LB_STEP1_FACTUAL.contractAddress

function seedThroughStep5() {
  return seedSessionWithValidatedStep5(
    seedSessionWithValidatedStep4(
      seedSessionWithValidatedStep3(seedSessionWithValidatedStep2(seedSessionWithValidatedStep1(emptyFounderLbSession()))),
    ),
  )
}

/** Build synthetic Program runtime with Math in every library slot. */
function syntheticProgramRuntime(libraryAddress: string): string {
  const ranges = [
    7777, 7980, 8039, 8123, 8185, 8315, 8444, 8532, 8715, 8812, 8896, 9592,
  ]
  const bytes = new Uint8Array(22911).fill(0xab)
  const lib = Buffer.from(libraryAddress.replace(/^0x/, '').toLowerCase(), 'hex')
  for (const start of ranges) lib.copy(bytes, start)
  return `0x${Buffer.from(bytes).toString('hex')}`
}

describe('LB Step 5 validation + Step 6 Factory unlock', () => {
  it('canonical binding records Program (Factory also bound in later mission)', () => {
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbExecutionMathLibrary).toBe(MATH)
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbFeeReceiver).toBe(LB_STEP2_FACTUAL.contractAddress)
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbAuthorizer).toBe(LB_STEP3_FACTUAL.contractAddress)
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbFeeSink).toBe(LB_STEP4_FACTUAL.contractAddress)
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbProgramImplementation).toBe(STEP5_ADDR)
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbFactory).toBeTruthy()
  })

  it('deployed-addresses artifact records Step 5 Program validated', () => {
    const artifact = JSON.parse(
      readFileSync(
        path.resolve(__dirname, '../../../../../../deployments/liquidity-building/chain-56/deployed-addresses.v1.json'),
        'utf8',
      ),
    )
    expect(artifact.addresses.lbProgramImplementation).toBe(STEP5_ADDR)
    expect(artifact.deployments.LiquidityBuildingProgramV1.transactionHash).toBe(STEP5_TX)
    expect(artifact.deployments.LiquidityBuildingProgramV1.status).toBe('VALIDATED')
    expect(artifact.deployments.LiquidityBuildingProgramV1.linkedLibrary).toBe(MATH)
  })

  it('library link verifier requires ExecutionMath in all Program slots', () => {
    const runtime = syntheticProgramRuntime(MATH)
    const ok = verifyProgramLibraryLink({ runtimeBytecode: runtime, expectedLibraryAddress: MATH })
    expect(ok.ok).toBe(true)
    expect(ok.slotsMatch).toBe(12)
    const bad = verifyProgramLibraryLink({
      runtimeBytecode: syntheticProgramRuntime('0x1111111111111111111111111111111111111111'),
      expectedLibraryAddress: MATH,
    })
    expect(bad.ok).toBe(false)
    expect(bad.reason).toMatch(/STEP5_VALIDATION_FAILED/)
  })

  it('masked Program runtime matches certified template when library slots zeroed', () => {
    const runtime = syntheticProgramRuntime(MATH)
    const expected = runtimeHashForCertifiedCompare('LiquidityBuildingProgramV1', runtime)
    // Zeroing library slots of synthetic runtime should be deterministic vs itself
    expect(expected).toBe(runtimeHashForCertifiedCompare('LiquidityBuildingProgramV1', runtime))
    const certified = loadCertifiedLbArtifacts().artifacts.LiquidityBuildingProgramV1
    expect(certified.expectedRuntimeBytecodeSha256).toBe(LB_STEP5_FACTUAL.expectedRuntimeBytecodeSha256)
  })

  it('validateLbStepFromOnChain accepts Program when masked runtime matches expected', () => {
    const runtime = syntheticProgramRuntime(MATH)
    const expected = runtimeHashForCertifiedCompare('LiquidityBuildingProgramV1', runtime)
    const link = verifyProgramLibraryLink({ runtimeBytecode: runtime })
    expect(link.ok).toBe(true)
    const result = validateLbStepFromOnChain({
      stepId: LB_STEP5_FACTUAL.stepId,
      contractName: LB_STEP5_FACTUAL.contractName,
      chainId: 56,
      txHash: STEP5_TX,
      receipt: {
        status: '0x1',
        contractAddress: STEP5_ADDR,
        from: AUTHORIZED_MELEGA_DEPLOYER,
      },
      runtimeBytecode: runtime,
      expectedRuntimeBytecodeSha256: expected,
      requireDeployer: AUTHORIZED_MELEGA_DEPLOYER,
      expectedContractAddress: STEP5_ADDR,
      constructorStateOk: true,
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.record.contractAddress.toLowerCase()).toBe(STEP5_ADDR.toLowerCase())
      expect(result.record.runtimeBytecodeSha256).toBe(sha256Bytecode(runtime))
    }
  })

  it('creation payload links certified Program bytecode to factual Math only', () => {
    const art = loadCertifiedLbArtifacts().artifacts.LiquidityBuildingProgramV1
    const linked = linkLibraryBytecode(art.creationBytecode, MATH)
    expect(linked).not.toMatch(/__\$/)
    expect(linked.toLowerCase()).toContain(MATH.slice(2).toLowerCase())
    expect(() => linkLibraryBytecode(art.creationBytecode, '0x1111111111111111111111111111111111111111')).not.toThrow()
  })

  it('seeded session marks Step 5 VALIDATED and unlocks Step 6 Factory', () => {
    const session = seedThroughStep5()
    expect(step5IsValidated(session)).toBe(true)
    expect(session.deployed.program).toBe(STEP5_ADDR)
    expect(session.completedStepIds).toHaveLength(5)

    const order = loadCertifiedLbArtifacts().deployOrder
    expect(order[5]).toBe(LB_STEP6_CONTRACT)

    const built = buildLbDeploySteps(session.deployed)
    const active = activeLbStep(built.steps, session.completedStepIds)
    expect(active?.contractName).toBe(LB_STEP6_CONTRACT)
    expect(active?.index).toBe(6)
    expect(active?.total).toBe(6)
    expect(active?.deploymentData?.startsWith('0x')).toBe(true)
    expect(active?.blockedReason).toBeNull()
  })

  it('Factory resolves Program, Authorizer, FeeSink from factual bindings', () => {
    const session = seedThroughStep5()
    const built = buildLbDeploySteps(session.deployed)
    const factory = built.steps.find((s) => s.contractName === LB_STEP6_CONTRACT)!
    expect(factory.blockedReason).toBeNull()
    const values = factory.constructorArgs.map((a) => a.value.toLowerCase())
    expect(values).toContain(STEP5_ADDR.toLowerCase())
    expect(values).toContain(LB_STEP3_FACTUAL.contractAddress.toLowerCase())
    expect(values).toContain(LB_STEP4_FACTUAL.contractAddress.toLowerCase())

    const missingProgram = buildLbDeploySteps({
      math: session.deployed.math,
      feeReceiver: session.deployed.feeReceiver,
      authorizer: session.deployed.authorizer,
      feeSink: session.deployed.feeSink,
    })
    const blocked = missingProgram.steps.find((s) => s.contractName === LB_STEP6_CONTRACT)
    expect(blocked?.blockedReason).toMatch(/Program|Authorizer|FeeSink/i)
  })

  it('Step 6 CTA can reach READY_TO_DEPLOY; creation request has no to (no auto broadcast)', () => {
    const session = seedThroughStep5()
    const built = buildLbDeploySteps(session.deployed)
    const step6 = activeLbStep(built.steps, session.completedStepIds)!
    expect(step6.contractName).toBe(LB_STEP6_CONTRACT)

    const gates = assessFounderDeployGates({
      connectedWallet: AUTHORIZED_MELEGA_DEPLOYER,
      chainId: 56,
      balanceWei: WEI_PER_BNB,
      artifactValid: built.artifactStatus === 'ARTIFACTS_VALID',
      constructorValid: Boolean(step6.deploymentData && !step6.blockedReason),
      subsystemReady: true,
    })
    const cost = 50_000_000_000_000_000n
    const gas = assessFounderGasReadiness({
      balanceWei: WEI_PER_BNB,
      estimateStatus: 'ready',
      estimatedTotalCostWei: cost,
      perTx: [
        {
          stepId: step6.stepId,
          contractName: step6.contractName,
          gasUnits: '2000000',
          gasPriceWei: '3000000000',
          costWei: cost.toString(),
          costBnb: '0.05',
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
      data: step6.deploymentData!,
      gasUnits: 2000000n,
    })
    expect(req.value).toBe('0x0')
    expect(req).not.toHaveProperty('to')
  })

  it('refuses to overwrite Step 5 binding; sequence lock holds Factory until Program completes', () => {
    const session = seedThroughStep5()
    expect(() =>
      bindValidatedLbStep(session, {
        stepId: LB_STEP5_FACTUAL.stepId,
        contractName: LB_STEP5_FACTUAL.contractName,
        contractAddress: '0x1111111111111111111111111111111111111111',
        txHash: STEP5_TX,
        chainId: 56,
        runtimeBytecodeSha256: LB_STEP5_FACTUAL.observedRuntimeBytecodeSha256,
        status: 'VALIDATED',
        validatedAt: new Date().toISOString(),
      }),
    ).toThrow(/overwrite/i)

    const onlyFour = seedSessionWithValidatedStep4(
      seedSessionWithValidatedStep3(seedSessionWithValidatedStep2(seedSessionWithValidatedStep1())),
    )
    const active = activeLbStep(buildLbDeploySteps(onlyFour.deployed).steps, onlyFour.completedStepIds)
    expect(active?.contractName).toBe('LiquidityBuildingProgramV1')
    expect(active?.contractName).not.toBe(LB_STEP6_CONTRACT)
  })
})
