import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import {
  AUTHORIZED_MELEGA_DEPLOYER,
  assessSubsystemBinding,
  FOUNDER_TREASURY_DESTINATION,
  loadCertifiedLbArtifacts,
  runtimeHashForCertifiedCompare,
  validateLbStepFromOnChain,
} from 'lib/deployment-orchestrator'
import {
  LB_STEP1_FACTUAL,
  LB_STEP2_FACTUAL,
  LB_STEP3_FACTUAL,
  LB_STEP4_FACTUAL,
  LB_STEP5_FACTUAL,
  LB_STEP6_FACTUAL,
  emptyFounderLbSession,
  liquidityBuilderMainnetReady,
  seedSessionWithValidatedStep6,
  verifyFactoryConstructorState,
} from 'lib/deployment-orchestrator/founderLbSession'
import {
  LB_CANONICAL_DEPLOYED_ADDRESSES,
  lbCoreContractsBound,
} from 'config/constants/liquidityBuildingDeployment'
import { assessExecutionReadiness } from 'views/LiquidityStudio/liquidityBuilding/addresses'
import { getCanaryStatus } from 'lib/deployment-orchestrator/canary'

const FACTORY = LB_STEP6_FACTUAL.contractAddress
const FACTORY_TX = LB_STEP6_FACTUAL.txHash

describe('LB Factory validation + MAINNET READY', () => {
  it('canonical registry has no null core LB addresses', () => {
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbFactory).toBe(FACTORY)
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbAuthorizer).toBe(LB_STEP3_FACTUAL.contractAddress)
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbFeeSink).toBe(LB_STEP4_FACTUAL.contractAddress)
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbFeeReceiver).toBe(LB_STEP2_FACTUAL.contractAddress)
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbProgramImplementation).toBe(LB_STEP5_FACTUAL.contractAddress)
    expect(LB_CANONICAL_DEPLOYED_ADDRESSES.lbExecutionMathLibrary).toBe(LB_STEP1_FACTUAL.contractAddress)
    expect(lbCoreContractsBound()).toBe(true)
  })

  it('deployed-addresses artifact binds Factory and preserves priors', () => {
    const artifact = JSON.parse(
      readFileSync(
        path.resolve(__dirname, '../../../../../../deployments/liquidity-building/chain-56/deployed-addresses.v1.json'),
        'utf8',
      ),
    )
    expect(artifact.addresses.lbFactory).toBe(FACTORY)
    expect(artifact.deployments.LiquidityBuildingFactoryV1.transactionHash).toBe(FACTORY_TX)
    expect(artifact.deployments.LiquidityBuildingFactoryV1.status).toBe('VALIDATED')
    expect(artifact.deployments.LiquidityBuildingFactoryV1.successFeeBps).toBe(1000)
    expect(artifact.addresses.lbExecutionMathLibrary).toBe(LB_STEP1_FACTUAL.contractAddress)
    expect(artifact.addresses.lbFeeReceiver).toBe(LB_STEP2_FACTUAL.contractAddress)
    expect(artifact.addresses.lbAuthorizer).toBe(LB_STEP3_FACTUAL.contractAddress)
    expect(artifact.addresses.lbFeeSink).toBe(LB_STEP4_FACTUAL.contractAddress)
    expect(artifact.addresses.lbProgramImplementation).toBe(LB_STEP5_FACTUAL.contractAddress)
    expect(artifact.status).toMatch(/ALL_SIX|READY|VALIDATED/i)
  })

  it('factory constructor verifier accepts factual Program/Authorizer/FeeSink + 1000 bps', () => {
    const ok = verifyFactoryConstructorState({
      implementation: LB_STEP5_FACTUAL.contractAddress,
      executionAuthorizer: LB_STEP3_FACTUAL.contractAddress,
      treasuryFeeSink: LB_STEP4_FACTUAL.contractAddress,
      successFeeBps: 1000,
    })
    expect(ok.ok).toBe(true)
    const bad = verifyFactoryConstructorState({
      implementation: LB_STEP5_FACTUAL.contractAddress,
      executionAuthorizer: LB_STEP3_FACTUAL.contractAddress,
      treasuryFeeSink: FOUNDER_TREASURY_DESTINATION,
      successFeeBps: 1000,
    })
    expect(bad.ok).toBe(false)
  })

  it('validateLbStepFromOnChain accepts Factory when masked runtime matches certified', () => {
    const runtime = `0x${'ab'.repeat(8052)}`
    const expected = runtimeHashForCertifiedCompare('LiquidityBuildingFactoryV1', runtime)
    const result = validateLbStepFromOnChain({
      stepId: LB_STEP6_FACTUAL.stepId,
      contractName: LB_STEP6_FACTUAL.contractName,
      chainId: 56,
      txHash: FACTORY_TX,
      receipt: {
        status: '0x1',
        contractAddress: FACTORY,
        from: AUTHORIZED_MELEGA_DEPLOYER,
      },
      runtimeBytecode: runtime,
      expectedRuntimeBytecodeSha256: expected,
      requireDeployer: AUTHORIZED_MELEGA_DEPLOYER,
      expectedContractAddress: FACTORY,
      constructorStateOk: true,
    })
    expect(result.ok).toBe(true)
    expect(loadCertifiedLbArtifacts().artifacts.LiquidityBuildingFactoryV1.expectedRuntimeBytecodeSha256).toBe(
      LB_STEP6_FACTUAL.expectedRuntimeBytecodeSha256,
    )
  })

  it('execution readiness is READY; orchestrator LB binding is true', () => {
    const r = assessExecutionReadiness()
    expect(r.ready).toBe(true)
    expect(r.status).toBe('READY')
    expect(r.missing).toEqual([])
    expect(assessSubsystemBinding('liquidity_builder').bound).toBe(true)
  })

  it('seeded session marks all six steps and MAINNET READY; canary remains Pending', () => {
    const session = seedSessionWithValidatedStep6(emptyFounderLbSession())
    expect(liquidityBuilderMainnetReady(session)).toBe(true)
    expect(session.completedStepIds).toHaveLength(6)
    expect(session.deployed.factory).toBe(FACTORY)
    expect(getCanaryStatus('liquidity_builder')).toBe('Pending')
  })

  it('Create Token and Public Farm Factory remain independently unbound', () => {
    expect(assessSubsystemBinding('create_token').bound).toBe(false)
    expect(assessSubsystemBinding('public_farm_factory').bound).toBe(false)
  })

  it('inputs.json preserves 1000 bps and records Factory/FeeSink/FeeReceiver without Treasury Runtime', () => {
    const inputs = JSON.parse(
      readFileSync(
        path.resolve(__dirname, '../../../../../../deployments/liquidity-building/chain-56/LiquidityBuildingV1.inputs.json'),
        'utf8',
      ),
    )
    expect(inputs.protocolParameters.successFeeBps).toBe(1000)
    expect(inputs.deploymentReadinessState).toBe('DEPLOYED')
    expect(inputs.factory.address).toBe(FACTORY)
    expect(inputs.treasury.feeSinkAddress).toBe(LB_STEP4_FACTUAL.contractAddress)
    expect(inputs.treasury.receiverAddress).toBe(LB_STEP2_FACTUAL.contractAddress)
    expect(inputs.activationAuthorized).toBe(false)
    // Historical handoff notes may mention Treasury Runtime / KMS; production fee path must not depend on them.
    expect(inputs.founderFeeSchedule.note).toMatch(/not Treasury Runtime/i)
    expect(inputs.runtimeIngestion.status).toBe('NOT_IMPLEMENTED')
    expect(inputs.signatureNormalization.productionKmsVerified).toBe(false)
    expect(inputs.productionAuthority.verdict).not.toBe('PRODUCTION_READY')
  })
})
