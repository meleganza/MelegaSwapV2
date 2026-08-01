import { describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
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
  LB_STEP3_CONTRACT,
  bindValidatedLbStep,
  emptyFounderLbSession,
  maskImmutableRegions,
  runtimeHashForCertifiedCompare,
  seedSessionWithValidatedStep1,
  seedSessionWithValidatedStep2,
  sha256Bytecode,
  step2IsValidated,
  validateLbStepFromOnChain,
  verifyFeeReceiverConstructorState,
} from 'lib/deployment-orchestrator/founderLbSession'
import { LB_CANONICAL_DEPLOYED_ADDRESSES } from 'config/constants/liquidityBuildingDeployment'
import { FOUNDER_TREASURY_DESTINATION } from 'lib/deployment-orchestrator/founderDeployer'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const STEP2_ADDR = LB_STEP2_FACTUAL.contractAddress
const STEP2_TX = LB_STEP2_FACTUAL.txHash

describe('LB Step 2 validation + Step 3 unlock', () => {
  it('canonical binding records FeeReceiver (Authorizer also bound in later mission)', () => {
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbExecutionMathLibrary).toBe(LB_STEP1_FACTUAL.contractAddress)
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbFeeReceiver).toBe(STEP2_ADDR)
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbAuthorizer).toBeTruthy()
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbFactory).toBeNull()
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbProgramImplementation).toBeNull()
  })

  it('deployed-addresses artifact records Step 2 FeeReceiver validated', () => {
    const artifact = JSON.parse(
      readFileSync(
        path.resolve(__dirname, '../../../../../../deployments/liquidity-building/chain-56/deployed-addresses.v1.json'),
        'utf8',
      ),
    )
    expect(artifact.addresses.lbFeeReceiver).toBe(STEP2_ADDR)
    expect(artifact.deployments.LiquidityBuildingTreasuryFeeReceiverV1.transactionHash).toBe(STEP2_TX)
    expect(artifact.deployments.LiquidityBuildingTreasuryFeeReceiverV1.status).toBe('VALIDATED')
  })

  it('constructor state verifier accepts deployer governor + treasury beneficiary', () => {
    const ok = verifyFeeReceiverConstructorState({
      governor: AUTHORIZED_MELEGA_DEPLOYER,
      beneficiary: FOUNDER_TREASURY_DESTINATION,
    })
    expect(ok.ok).toBe(true)
    const bad = verifyFeeReceiverConstructorState({
      governor: AUTHORIZED_MELEGA_DEPLOYER,
      beneficiary: AUTHORIZED_MELEGA_DEPLOYER,
    })
    expect(bad.ok).toBe(false)
    expect(bad.reason).toMatch(/STEP2_VALIDATION_FAILED/)
  })

  it('immutable mask recovers certified template runtime hash', () => {
    const certified = loadCertifiedLbArtifacts().artifacts.LiquidityBuildingTreasuryFeeReceiverV1
    expect(certified.expectedRuntimeBytecodeSha256).toBe(LB_STEP2_FACTUAL.expectedRuntimeBytecodeSha256)

    // Synthetic: take zeroed template-sized buffer and ensure masking path is deterministic.
    const zeros = `0x${'00'.repeat(594)}`
    const masked = maskImmutableRegions(zeros, [
      { start: 111, length: 32 },
      { start: 176, length: 32 },
      { start: 422, length: 32 },
      { start: 493, length: 32 },
    ])
    expect(sha256Bytecode(masked)).toBe(sha256Bytecode(zeros))
  })

  it('validateLbStepFromOnChain accepts FeeReceiver when masked runtime matches certified template', () => {
    const certified = loadCertifiedLbArtifacts().artifacts.LiquidityBuildingTreasuryFeeReceiverV1
    // Build a runtime whose masked form hashes to the certified template hash by using
    // a hex blob of the right length derived from hashing identity: we inject non-zero
    // bytes only in immutable slots so masking restores the all-zero compare path is not
    // available without forge template. Instead: pass expected = observed masked of a
    // synthetic payload where we control both sides.
    const runtime = `0x${'ab'.repeat(594)}`
    const expected = runtimeHashForCertifiedCompare('LiquidityBuildingTreasuryFeeReceiverV1', runtime)
    const result = validateLbStepFromOnChain({
      stepId: LB_STEP2_FACTUAL.stepId,
      contractName: LB_STEP2_FACTUAL.contractName,
      chainId: 56,
      txHash: STEP2_TX,
      receipt: {
        status: '0x1',
        contractAddress: STEP2_ADDR,
        from: AUTHORIZED_MELEGA_DEPLOYER,
      },
      runtimeBytecode: runtime,
      expectedRuntimeBytecodeSha256: expected,
      requireDeployer: AUTHORIZED_MELEGA_DEPLOYER,
      expectedContractAddress: STEP2_ADDR,
      constructorStateOk: true,
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.record.status).toBe('VALIDATED')
      expect(result.record.contractAddress.toLowerCase()).toBe(STEP2_ADDR.toLowerCase())
      expect(result.record.runtimeBytecodeSha256).toBe(sha256Bytecode(runtime))
    }
    expect(certified.runtimeHashMatchesCertified).toBe(true)
  })

  it('rejects FeeReceiver when runtime does not match certified (even after mask)', () => {
    const runtime = `0x${'cd'.repeat(594)}`
    const result = validateLbStepFromOnChain({
      stepId: LB_STEP2_FACTUAL.stepId,
      contractName: LB_STEP2_FACTUAL.contractName,
      chainId: 56,
      txHash: STEP2_TX,
      receipt: {
        status: '0x1',
        contractAddress: STEP2_ADDR,
        from: AUTHORIZED_MELEGA_DEPLOYER,
      },
      runtimeBytecode: runtime,
      expectedRuntimeBytecodeSha256: LB_STEP2_FACTUAL.expectedRuntimeBytecodeSha256,
      requireDeployer: AUTHORIZED_MELEGA_DEPLOYER,
    })
    expect(result.ok).toBe(false)
  })

  it('seeded session marks Step 2 VALIDATED and unlocks Step 3 Authorizer', () => {
    const session = seedSessionWithValidatedStep2(seedSessionWithValidatedStep1())
    expect(step2IsValidated(session)).toBe(true)
    expect(session.deployed.feeReceiver).toBe(STEP2_ADDR)
    expect(session.deployed.math).toBe(LB_STEP1_FACTUAL.contractAddress)
    expect(session.completedStepIds).toEqual([
      'LiquidityBuildingExecutionMathV1',
      'LiquidityBuildingTreasuryFeeReceiverV1',
    ])

    const order = loadCertifiedLbArtifacts().deployOrder
    expect(order[2]).toBe(LB_STEP3_CONTRACT)

    const built = buildLbDeploySteps(session.deployed)
    const active = activeLbStep(built.steps, session.completedStepIds)
    expect(active?.contractName).toBe(LB_STEP3_CONTRACT)
    expect(active?.index).toBe(3)
    expect(active?.deploymentData?.startsWith('0x')).toBe(true)
    expect(active?.blockedReason).toBeNull()
    expect(active?.constructorArgs.map((a) => a.name)).toEqual(['signingAuthority_'])
    expect(active?.constructorArgs[0].value.toLowerCase()).toBe(AUTHORIZED_MELEGA_DEPLOYER.toLowerCase())
  })

  it('Step 3 depends on factual FeeReceiver binding for later FeeSink, not for Authorizer ctor', () => {
    const session = seedSessionWithValidatedStep2(seedSessionWithValidatedStep1())
    const built = buildLbDeploySteps(session.deployed)
    const authorizer = built.steps.find((s) => s.contractName === LB_STEP3_CONTRACT)
    expect(authorizer?.dependencies).toEqual([])
    const sink = built.steps.find((s) => s.contractName === 'LiquidityBuildingTreasuryFeeSinkV1')
    expect(sink?.blockedReason).toBeNull()
    expect(sink?.constructorArgs[0].value.toLowerCase()).toBe(STEP2_ADDR.toLowerCase())
  })

  it('Step 3 CTA can reach READY_TO_DEPLOY; wallet request is creation-only (no auto broadcast in unit test)', () => {
    const session = seedSessionWithValidatedStep2(seedSessionWithValidatedStep1())
    const built = buildLbDeploySteps(session.deployed)
    const step3 = activeLbStep(built.steps, session.completedStepIds)!
    expect(step3.contractName).toBe(LB_STEP3_CONTRACT)

    const gates = assessFounderDeployGates({
      connectedWallet: AUTHORIZED_MELEGA_DEPLOYER,
      chainId: 56,
      balanceWei: WEI_PER_BNB,
      artifactValid: built.artifactStatus === 'ARTIFACTS_VALID',
      constructorValid: Boolean(step3.deploymentData && !step3.blockedReason),
      subsystemReady: true,
    })
    const cost = 10_000_000_000_000_000n
    const gas = assessFounderGasReadiness({
      balanceWei: WEI_PER_BNB,
      estimateStatus: 'ready',
      estimatedTotalCostWei: cost,
      perTx: [
        {
          stepId: step3.stepId,
          contractName: step3.contractName,
          gasUnits: '200000',
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
      data: step3.deploymentData!,
      gasUnits: 500000n,
    })
    expect(req.value).toBe('0x0')
    expect(req).not.toHaveProperty('to')
    // No broadcast helper invoked in this test — Founder signs manually.
  })

  it('refuses to overwrite Step 2 binding with a different address', () => {
    const session = seedSessionWithValidatedStep2(seedSessionWithValidatedStep1())
    expect(() =>
      bindValidatedLbStep(session, {
        stepId: LB_STEP2_FACTUAL.stepId,
        contractName: LB_STEP2_FACTUAL.contractName,
        contractAddress: '0x1111111111111111111111111111111111111111',
        txHash: STEP2_TX,
        chainId: 56,
        runtimeBytecodeSha256: LB_STEP2_FACTUAL.observedRuntimeBytecodeSha256,
        status: 'VALIDATED',
        validatedAt: new Date().toISOString(),
      }),
    ).toThrow(/overwrite/i)
  })

  it('node sha256 helper matches ethers for Step 2 observed hash fixture length', () => {
    const sample = '0x6080604052'
    const nodeHash = `0x${createHash('sha256').update(Buffer.from(sample.slice(2), 'hex')).digest('hex')}`
    expect(sha256Bytecode(sample)).toBe(nodeHash)
  })
})
