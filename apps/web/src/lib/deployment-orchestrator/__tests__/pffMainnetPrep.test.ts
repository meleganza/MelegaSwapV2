/**
 * MELEGA_DEX_V1_PUBLIC_FARM_FACTORY_MAINNET_DEPLOYMENT_PREPARATION
 */
import { describe, expect, it, beforeEach } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import {
  AUTHORIZED_MELEGA_DEPLOYER,
  FOUNDER_TREASURY_DESTINATION,
  assessPffArtifactIntegrity,
  buildContractCreationRequest,
  buildPublicFarmDeployStep,
  isPffExecutionAwaitingFounderSignature,
  isSubsystemReadyForFounderDeploy,
  loadCertifiedPffArtifacts,
  nextFounderDeployTarget,
  resetPffSession,
  verifyPffConstructorArgs,
} from 'lib/deployment-orchestrator'
import {
  PUBLIC_FARM_ELIGIBILITY_SIGNER,
  PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT,
  PUBLIC_FARM_FACTORY_FEE_RECIPIENT,
  isPublicFarmFactoryBound,
} from 'config/constants/publicFarmFactoryDeployment'
import { PUBLIC_FARM_FACTORY_READINESS } from 'views/FarmsStudio/modules/publicFarmFactoryReadiness'
import { PUBLIC_FARM_FACTORY_CAPABILITY } from 'views/FarmsStudio/modules/publicFarmFactoryCapability'
import {
  REQUIRE_LIQUIDITY_INCREASE,
  evaluatePublicFarmEligibility,
  publicFarmEligibilityAction,
} from 'views/FarmsStudio/modules/publicFarmEligibility'
import { resolvePublicFarmFactoryFee } from 'views/FarmsStudio/modules/publicFarmFactoryFee'
import { CREATE_TOKEN_CANONICAL_DEPLOYMENT } from 'config/constants/createTokenFactoryDeployment'

const WEB = path.resolve(__dirname, '../../../..')
const SHELL = path.resolve(__dirname, '../../../views/DeploymentOrchestrator/FounderDeploymentShell.tsx')
const EVIDENCE = path.join(WEB, 'docs/runtime/melega-dex-v1-public-farm-factory-mainnet-deployment')

describe('Public Farm Factory mainnet deployment preparation', () => {
  beforeEach(() => {
    resetPffSession()
  })

  it('Part A — certified artifact loads; hash + bytecode + constructor schema valid', () => {
    const loaded = loadCertifiedPffArtifacts()
    expect(loaded.status).toBe('ARTIFACTS_VALID')
    expect(loaded.treasury).toBe(FOUNDER_TREASURY_DESTINATION)
    expect(loaded.deployer).toBe(AUTHORIZED_MELEGA_DEPLOYER)
    expect(loaded.eligibilitySigner).toBe(PUBLIC_FARM_ELIGIBILITY_SIGNER)
    const art = loaded.artifacts.PublicFarmFactoryV1
    const gate = assessPffArtifactIntegrity(art)
    expect(gate.ok).toBe(true)
    expect(art.constructorInputs.map((i) => i.name)).toEqual([
      'treasury_',
      'marcoToken_',
      'pairFactory_',
      'eligibilitySigner_',
    ])
    expect(existsSync(path.join(WEB, 'src/lib/deployment-orchestrator/artifacts/pff-v1-certified.json'))).toBe(
      true,
    )
  })

  it('Part B — economics: MARCO FREE / otherwise 0.25 BNB / treasury / min TVL / REQUIRE_LIQUIDITY_INCREASE', () => {
    expect(PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.feePolicy.marcoPair).toBe('FREE')
    expect(PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.feePolicy.otherwiseBnb).toBe('0.25')
    expect(PUBLIC_FARM_FACTORY_FEE_RECIPIENT).toBe(FOUNDER_TREASURY_DESTINATION)
    const marcoPair = resolvePublicFarmFactoryFee({
      rewardToken: '0x1111111111111111111111111111111111111111',
      pairContainsMarco: true,
    })
    expect(marcoPair.ok).toBe(true)
    if (marcoPair.ok) expect(marcoPair.isFree).toBe(true)
    const other = resolvePublicFarmFactoryFee({
      rewardToken: '0x1111111111111111111111111111111111111111',
      pairContainsMarco: false,
    })
    expect(other.ok).toBe(true)
    if (other.ok) expect(other.feeBnb).toBe('0.25')
    const marcoReward = resolvePublicFarmFactoryFee({
      rewardToken: 'MARCO',
      pairContainsMarco: true,
    })
    expect(marcoReward.ok).toBe(false)
    const low = evaluatePublicFarmEligibility({
      pairAddress: '0x2222222222222222222222222222222222222222',
      token0: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
      token1: '0x1111111111111111111111111111111111111111',
      reserve0: String(0.05e18),
      reserve1: '1',
      classification: 'tradeable',
      indexed: true,
    })
    expect(publicFarmEligibilityAction(low)).toBe(REQUIRE_LIQUIDITY_INCREASE)
  })

  it('Part C/D — constructor review + deploy step READY_FOR_SIGNATURE (no broadcast)', () => {
    const built = buildPublicFarmDeployStep()
    expect(built.review.constructorValid).toBe(true)
    expect(built.review.artifactValid).toBe(true)
    expect(built.step?.blockedReason).toBeNull()
    expect(built.step?.deploymentData?.startsWith('0x')).toBe(true)
    expect(built.step?.humanFields.some((f) => f.value.includes('0.25 BNB'))).toBe(true)
    expect(built.step?.humanFields.some((f) => f.value.includes(FOUNDER_TREASURY_DESTINATION))).toBe(true)
    expect(built.step?.humanFields.some((f) => f.value.includes(AUTHORIZED_MELEGA_DEPLOYER))).toBe(true)
    expect(
      verifyPffConstructorArgs({
        treasury: FOUNDER_TREASURY_DESTINATION,
        marcoToken: PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.marcoToken,
        pairFactory: PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.pairFactory,
        eligibilitySigner: PUBLIC_FARM_ELIGIBILITY_SIGNER,
      }).ok,
    ).toBe(true)
    const req = buildContractCreationRequest({
      from: AUTHORIZED_MELEGA_DEPLOYER,
      data: built.step!.deploymentData!,
      gasUnits: 3_000_000n,
    })
    expect(req.from).toBe(AUTHORIZED_MELEGA_DEPLOYER)
    expect('to' in req).toBe(false)
    expect(req.value).toBe('0x0')
  })

  it('Part F — factoryAddress remains null; no fabricated ready', () => {
    expect(PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.factoryAddress).toBeNull()
    expect(PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.status).toBe('READY_FOR_FOUNDER_SIGNATURE')
    expect(isPublicFarmFactoryBound()).toBe(false)
    expect(isPffExecutionAwaitingFounderSignature()).toBe(true)
    expect(PUBLIC_FARM_FACTORY_READINESS.status).toBe('READY_FOR_FOUNDER_SIGNATURE')
    expect(PUBLIC_FARM_FACTORY_READINESS.executionEnabled).toBe(false)
    expect(PUBLIC_FARM_FACTORY_READINESS.noTreasuryRuntime).toBe(true)
    expect(PUBLIC_FARM_FACTORY_CAPABILITY.readiness.walletCanExecute).toBe(false)
  })

  it('sequence: CT READY unlocks PFF; LB/CT addresses untouched', () => {
    expect(CREATE_TOKEN_CANONICAL_DEPLOYMENT.status).toBe('READY')
    expect(isSubsystemReadyForFounderDeploy('public_farm_factory')).toBe(true)
    expect(nextFounderDeployTarget()).toBe('public_farm_factory')
    const lb = readFileSync(path.join(WEB, 'src/config/constants/liquidityBuildingDeployment.ts'), 'utf8')
    expect(lb).toContain("lbFactory: '0xB9f3e3020141157C215902acC1fDF65e49bE4e82'")
    const ct = readFileSync(path.join(WEB, 'src/config/constants/createTokenFactoryDeployment.ts'), 'utf8')
    expect(ct).toContain('0x6DbB5d7162842dA94ef9172AedC8D148d203d311')
  })

  it('Founder shell wires PFF READY_FOR_SIGNATURE · Deploy Public Farm Factory · no KMS', () => {
    const ui = readFileSync(SHELL, 'utf8')
    expect(ui).toContain('buildPublicFarmDeployStep')
    expect(ui).toContain('Deploy Public Farm Factory')
    expect(ui).toContain('READY_FOR_SIGNATURE')
    expect(ui).toContain('founder-public-farm-ready')
    expect(ui).toContain('validatePffFactoryFromOnChain')
    expect(ui).toContain('no KMS')
    expect(ui).not.toMatch(/Missing KMS|KMS signer|use KMS/i)
    expect(ui).not.toMatch(/Treasury Runtime/i)
  })

  it('evidence directory present for package + economics audits', () => {
    expect(existsSync(path.join(EVIDENCE, 'package-audit.json'))).toBe(true)
    expect(existsSync(path.join(EVIDENCE, 'economics-validation.json'))).toBe(true)
    expect(existsSync(path.join(EVIDENCE, 'constructor-review.json'))).toBe(true)
    expect(existsSync(path.join(EVIDENCE, 'deployment-readiness.json'))).toBe(true)
  })
})
