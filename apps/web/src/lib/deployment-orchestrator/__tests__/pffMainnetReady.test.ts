/**
 * MELEGA_DEX_V1_PUBLIC_FARM_FACTORY_VALIDATION_BINDING_AND_READY
 */
import { describe, expect, it, beforeEach } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import {
  AUTHORIZED_MELEGA_DEPLOYER,
  FOUNDER_TREASURY_DESTINATION,
  assessSubsystemBinding,
  isSubsystemReadyForFounderDeploy,
  loadCertifiedPffArtifacts,
  nextFounderDeployTarget,
  resetPffSession,
  runtimeHashForPffCertifiedCompare,
  verifyPffConstructorArgs,
} from 'lib/deployment-orchestrator'
import {
  PUBLIC_FARM_ELIGIBILITY_SIGNER,
  PUBLIC_FARM_FACTORY_ADDRESS,
  PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT,
  PUBLIC_FARM_FACTORY_DEPLOYMENT_BLOCK,
  PUBLIC_FARM_FACTORY_DEPLOYMENT_TX,
  PUBLIC_FARM_FACTORY_FEE_RECIPIENT,
  PUBLIC_FARM_MARCO_TOKEN,
  PUBLIC_FARM_PAIR_FACTORY,
  isPublicFarmFactoryBound,
} from 'config/constants/publicFarmFactoryDeployment'
import { PUBLIC_FARM_FACTORY_READINESS } from 'views/FarmsStudio/modules/publicFarmFactoryReadiness'
import { PUBLIC_FARM_FACTORY_CAPABILITY } from 'views/FarmsStudio/modules/publicFarmFactoryCapability'
import {
  REQUIRE_LIQUIDITY_INCREASE,
  evaluatePublicFarmEligibility,
  publicFarmEligibilityAction,
  rejectMarcoReward,
} from 'views/FarmsStudio/modules/publicFarmEligibility'
import { resolvePublicFarmFactoryFee } from 'views/FarmsStudio/modules/publicFarmFactoryFee'
import { CREATE_FARM_UX } from 'views/FarmsStudio/modules/createFarmUxCopy'
import { CREATE_TOKEN_CANONICAL_DEPLOYMENT } from 'config/constants/createTokenFactoryDeployment'

const WEB = path.resolve(__dirname, '../../../..')
const EVIDENCE = path.join(WEB, 'docs/runtime/melega-dex-v1-public-farm-factory-ready')
const FACTORY = '0x89Ffa439B197FE98f0F5388E00EdF1eBfD80D7E9'
const TX = '0xe610b16eaf2b94a3b69fce7a684b099eaa4e9ffdb9200c1007df4f2544a61603'

describe('Public Farm Factory mainnet validation · bind · READY', () => {
  beforeEach(() => {
    resetPffSession()
  })

  it('Part A — SSOT binds factual factory + tx (no fabrication)', () => {
    expect(PUBLIC_FARM_FACTORY_ADDRESS.toLowerCase()).toBe(FACTORY.toLowerCase())
    expect(PUBLIC_FARM_FACTORY_DEPLOYMENT_TX.toLowerCase()).toBe(TX.toLowerCase())
    expect(PUBLIC_FARM_FACTORY_DEPLOYMENT_BLOCK).toBe(113533796)
    expect(PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.factoryAddress?.toLowerCase()).toBe(FACTORY.toLowerCase())
    expect(PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.verified).toBe(true)
    expect(PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.status).toBe('READY')
    expect(isPublicFarmFactoryBound()).toBe(true)
  })

  it('Part A — receipt evidence success-shaped', () => {
    const receipt = JSON.parse(readFileSync(path.join(EVIDENCE, 'receipt.json'), 'utf8'))
    expect(receipt.status).toBe('0x1')
    expect(receipt.from.toLowerCase()).toBe(AUTHORIZED_MELEGA_DEPLOYER.toLowerCase())
    expect(receipt.contractAddress.toLowerCase()).toBe(FACTORY.toLowerCase())
    expect(receipt.transactionHash.toLowerCase()).toBe(TX.toLowerCase())
  })

  it('Part A — masked runtime hash matches pff-v1-certified.json', () => {
    const runtime = JSON.parse(readFileSync(path.join(EVIDENCE, 'runtime-validation.json'), 'utf8'))
    const certified = loadCertifiedPffArtifacts().artifacts.PublicFarmFactoryV1
    expect(runtime.maskedRuntimeSha256.toLowerCase()).toBe(
      certified.expectedRuntimeBytecodeSha256.toLowerCase(),
    )
    expect(runtime.hashMatch).toBe(true)
    expect(runtime.codeBytes).toBe(5870)
    expect(runtimeHashForPffCertifiedCompare(`0x${'00'.repeat(5870)}`).startsWith('0x')).toBe(true)
  })

  it('Part B — constructor economics + treasury + no proxy/TR', () => {
    expect(PUBLIC_FARM_FACTORY_FEE_RECIPIENT).toBe(FOUNDER_TREASURY_DESTINATION)
    expect(
      verifyPffConstructorArgs({
        treasury: FOUNDER_TREASURY_DESTINATION,
        marcoToken: PUBLIC_FARM_MARCO_TOKEN,
        pairFactory: PUBLIC_FARM_PAIR_FACTORY,
        eligibilitySigner: PUBLIC_FARM_ELIGIBILITY_SIGNER,
      }).ok,
    ).toBe(true)
    const ctor = JSON.parse(readFileSync(path.join(EVIDENCE, 'constructor-validation.json'), 'utf8'))
    expect(ctor.freeFee).toBe('0')
    expect(ctor.defaultFee).toBe('250000000000000000')
    expect(ctor.treasury.toLowerCase()).toBe(FOUNDER_TREASURY_DESTINATION.toLowerCase())
    expect(ctor.noOwnerAdmin).toBe(true)
    expect(ctor.noProxy).toBe(true)
    expect(ctor.noTreasuryRuntime).toBe(true)
  })

  it('Part C — liquidity eligibility REQUIRE_LIQUIDITY_INCREASE', () => {
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
    expect(CREATE_FARM_UX.requireLiquidityIncrease).toBe('REQUIRE_LIQUIDITY_INCREASE')
  })

  it('Part D — MARCO pair FREE; MARCO reward rejected; no MasterBuilder', () => {
    const free = resolvePublicFarmFactoryFee({
      rewardToken: '0x1111111111111111111111111111111111111111',
      pairContainsMarco: true,
    })
    expect(free.ok).toBe(true)
    if (free.ok) expect(free.isFree).toBe(true)
    const paid = resolvePublicFarmFactoryFee({
      rewardToken: '0x1111111111111111111111111111111111111111',
      pairContainsMarco: false,
    })
    expect(paid.ok).toBe(true)
    if (paid.ok) expect(paid.feeBnb).toBe('0.25')
    expect(rejectMarcoReward('MARCO').rejected).toBe(true)
    expect(PUBLIC_FARM_FACTORY_CAPABILITY.readiness.masterBuilderExposed).toBe(false)
  })

  it('Part E — factory binding only; LB + CT untouched', () => {
    expect(assessSubsystemBinding('public_farm_factory').bound).toBe(true)
    expect(assessSubsystemBinding('liquidity_builder').bound).toBe(true)
    expect(assessSubsystemBinding('create_token').bound).toBe(true)
    expect(CREATE_TOKEN_CANONICAL_DEPLOYMENT.factoryAddress?.toLowerCase()).toBe(
      '0x6dbb5d7162842da94ef9172aedc8d148d203d311',
    )
    const lb = readFileSync(path.join(WEB, 'src/config/constants/liquidityBuildingDeployment.ts'), 'utf8')
    expect(lb).toContain("lbFactory: '0xB9f3e3020141157C215902acC1fDF65e49bE4e82'")
    const bind = JSON.parse(readFileSync(path.join(EVIDENCE, 'binding-proof.json'), 'utf8'))
    expect(bind.factoryAddress.toLowerCase()).toBe(FACTORY.toLowerCase())
    expect(bind.onlyFieldUpdated).toBe('publicFarmFactoryAddress')
  })

  it('Part F — frontend READY + Create Farm unlocked', () => {
    expect(PUBLIC_FARM_FACTORY_CAPABILITY.outcome).toBe('A_PERMISSIONLESS_FACTORY_AVAILABLE')
    expect(PUBLIC_FARM_FACTORY_CAPABILITY.readiness.walletCanExecute).toBe(true)
    expect(PUBLIC_FARM_FACTORY_READINESS.status).toBe('READY')
    expect(PUBLIC_FARM_FACTORY_READINESS.executionEnabled).toBe(true)
    expect(PUBLIC_FARM_FACTORY_READINESS.factoryAddress?.toLowerCase()).toBe(FACTORY.toLowerCase())
    expect(PUBLIC_FARM_FACTORY_READINESS.lifecycle).toEqual(['DEPLOYED', 'VALIDATED', 'BOUND', 'READY'])
    expect(PUBLIC_FARM_FACTORY_READINESS.blockers).toEqual([])
    expect(PUBLIC_FARM_FACTORY_READINESS.noTreasuryRuntime).toBe(true)
  })

  it('sequence complete — no further Founder deploy target', () => {
    expect(isSubsystemReadyForFounderDeploy('public_farm_factory')).toBe(false)
    expect(nextFounderDeployTarget()).toBeNull()
  })

  it('UI surfaces READY without MasterBuilder / KMS', () => {
    const ws = readFileSync(path.join(WEB, 'src/views/FarmsStudio/modules/PublicFarmFactoryWorkspace.tsx'), 'utf8')
    expect(ws).toContain('CREATE_FARM_UX.increaseLiquidity')
    expect(ws).toContain('CREATE_FARM_UX.requireLiquidityIncrease')
    expect(ws).not.toMatch(/MasterBuilder/)
    const shell = readFileSync(
      path.join(WEB, 'src/views/DeploymentOrchestrator/FounderDeploymentShell.tsx'),
      'utf8',
    )
    expect(shell).toContain('founder-public-farm-mainnet-ready')
    expect(shell).toContain('PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.factoryAddress')
    expect(shell).toContain('Create Farm unlocked')
  })

  it('evidence pack complete', () => {
    for (const f of [
      'receipt.json',
      'runtime-validation.json',
      'constructor-validation.json',
      'economics-validation.json',
      'liquidity-eligibility-proof.json',
      'reward-rules-proof.json',
      'binding-proof.json',
      'frontend-sync-proof.json',
      'readiness.json',
      'MISSION_REPORT.md',
    ]) {
      expect(existsSync(path.join(EVIDENCE, f))).toBe(true)
    }
  })
})
