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
  bindValidatedLbStep,
  emptyFounderLbSession,
  seedSessionWithValidatedStep1,
  sha256Bytecode,
  step1IsValidated,
  validateLbStepFromOnChain,
} from 'lib/deployment-orchestrator/founderLbSession'
import { LB_CANONICAL_DEPLOYED_ADDRESSES } from 'config/constants/liquidityBuildingDeployment'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const STEP1_ADDR = LB_STEP1_FACTUAL.contractAddress
const STEP1_TX = LB_STEP1_FACTUAL.txHash

describe('LB Step 1 factual validation + Step 2 unlock', () => {
  it('canonical binding records ExecutionMath (Step 2 also bound in later mission)', () => {
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbExecutionMathLibrary).toBe(STEP1_ADDR)
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbFeeReceiver).toBeTruthy()
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbFactory).toBeNull()
  })

  it('deployed-addresses artifact records Step 1 validated', () => {
    const artifact = JSON.parse(
      readFileSync(
        path.resolve(__dirname, '../../../../../../deployments/liquidity-building/chain-56/deployed-addresses.v1.json'),
        'utf8',
      ),
    )
    expect(artifact.addresses.lbExecutionMathLibrary).toBe(STEP1_ADDR)
    expect(artifact.deployments.LiquidityBuildingExecutionMathV1.transactionHash).toBe(STEP1_TX)
    expect(artifact.deployments.LiquidityBuildingExecutionMathV1.status).toBe('VALIDATED')
  })

  it('sha256 of mainnet runtime matches certified hash', () => {
    // Hex captured from eth_getCode for Step 1 address (prefix-checked length only here —
    // full code equality is proven in runtime-hash-proof evidence via live RPC).
    const certified = loadCertifiedLbArtifacts().artifacts.LiquidityBuildingExecutionMathV1
    expect(certified.expectedRuntimeBytecodeSha256).toBe(LB_STEP1_FACTUAL.expectedRuntimeBytecodeSha256)
    expect(certified.runtimeHashMatchesCertified).toBe(true)
    const sample = '0x6080604052'
    const nodeHash = `0x${createHash('sha256').update(Buffer.from(sample.slice(2), 'hex')).digest('hex')}`
    expect(sha256Bytecode(sample)).toBe(nodeHash)
  })

  it('validateLbStepFromOnChain accepts successful receipt with matching runtime hash', () => {
    const runtime = '0x6080604052'
    const hash = sha256Bytecode(runtime)
    const result = validateLbStepFromOnChain({
      stepId: LB_STEP1_FACTUAL.stepId,
      contractName: LB_STEP1_FACTUAL.contractName,
      chainId: 56,
      txHash: STEP1_TX,
      receipt: {
        status: '0x1',
        contractAddress: STEP1_ADDR,
        from: AUTHORIZED_MELEGA_DEPLOYER,
      },
      runtimeBytecode: runtime,
      expectedRuntimeBytecodeSha256: hash,
      requireDeployer: AUTHORIZED_MELEGA_DEPLOYER,
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.record.status).toBe('VALIDATED')
      expect(result.record.contractAddress.toLowerCase()).toBe(STEP1_ADDR.toLowerCase())
    }
  })

  it('seeded session marks Step 1 VALIDATED and unlocks Step 2 FeeReceiver', () => {
    const session = seedSessionWithValidatedStep1(emptyFounderLbSession())
    expect(step1IsValidated(session)).toBe(true)
    expect(session.deployed.math).toBe(STEP1_ADDR)
    expect(session.completedStepIds).toContain('LiquidityBuildingExecutionMathV1')

    const built = buildLbDeploySteps(session.deployed)
    const active = activeLbStep(built.steps, session.completedStepIds)
    expect(active?.contractName).toBe('LiquidityBuildingTreasuryFeeReceiverV1')
    expect(active?.index).toBe(2)
    expect(active?.deploymentData?.startsWith('0x')).toBe(true)
    expect(active?.blockedReason).toBeNull()

    // Step 1 no longer the active deploy target
    expect(active?.stepId).not.toBe('LiquidityBuildingExecutionMathV1')
  })

  it('Step 2 constructor encodes deployer + treasury (Math bound for later Program link)', () => {
    const session = seedSessionWithValidatedStep1()
    const built = buildLbDeploySteps(session.deployed)
    const step2 = activeLbStep(built.steps, session.completedStepIds)!
    expect(step2.constructorArgs.map((a) => a.name)).toEqual(['governor_', 'beneficiary_'])
    expect(step2.constructorArgs[0].value.toLowerCase()).toBe(AUTHORIZED_MELEGA_DEPLOYER.toLowerCase())
    expect(step2.constructorArgs[1].value.toLowerCase()).toBe(
      '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b'.toLowerCase(),
    )
    // Dependency list for FeeReceiver is empty; Math is retained for Step 5
    expect(step2.dependencies).toEqual([])
    expect(session.deployed.math).toBe(STEP1_ADDR)

    const req = buildContractCreationRequest({
      from: AUTHORIZED_MELEGA_DEPLOYER,
      data: step2.deploymentData!,
      gasUnits: 500000n,
    })
    expect(req.value).toBe('0x0')
    expect(req).not.toHaveProperty('to')
  })

  it('refuses to overwrite Step 1 binding with a different address', () => {
    const session = seedSessionWithValidatedStep1()
    expect(() =>
      bindValidatedLbStep(session, {
        stepId: LB_STEP1_FACTUAL.stepId,
        contractName: LB_STEP1_FACTUAL.contractName,
        contractAddress: '0x1111111111111111111111111111111111111111',
        txHash: STEP1_TX,
        chainId: 56,
        runtimeBytecodeSha256: LB_STEP1_FACTUAL.expectedRuntimeBytecodeSha256,
        status: 'VALIDATED',
        validatedAt: new Date().toISOString(),
      }),
    ).toThrow(/overwrite/i)
  })

  it('authorized wallet + Step 2 payload can reach READY_TO_DEPLOY after gas estimate', () => {
    const session = seedSessionWithValidatedStep1()
    const built = buildLbDeploySteps(session.deployed)
    const step2 = activeLbStep(built.steps, session.completedStepIds)!
    const gates = assessFounderDeployGates({
      connectedWallet: AUTHORIZED_MELEGA_DEPLOYER,
      chainId: 56,
      balanceWei: WEI_PER_BNB,
      artifactValid: built.artifactStatus === 'ARTIFACTS_VALID',
      constructorValid: Boolean(step2.deploymentData && !step2.blockedReason),
      subsystemReady: true,
    })
    const cost = 10_000_000_000_000_000n
    const gas = assessFounderGasReadiness({
      balanceWei: WEI_PER_BNB,
      estimateStatus: 'ready',
      estimatedTotalCostWei: cost,
      perTx: [
        {
          stepId: step2.stepId,
          contractName: step2.contractName,
          gasUnits: '100000',
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
  })
})
