/**
 * MELEGA_DEX_V1_PUBLIC_FARM_FACTORY_MAINNET_DEPLOYMENT_EXECUTION
 */
import { describe, expect, it, beforeEach } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import {
  AUTHORIZED_MELEGA_DEPLOYER,
  FOUNDER_TREASURY_DESTINATION,
  assessPffArtifactIntegrity,
  bindValidatedPublicFarmFactory,
  buildContractCreationRequest,
  buildPublicFarmDeployStep,
  getPffSessionBound,
  isPffExecutionAwaitingFounderSignature,
  loadCertifiedPffArtifacts,
  resetPffSession,
  validatePffFactoryFromOnChain,
  verifyPffConstructorArgs,
} from 'lib/deployment-orchestrator'
import {
  PUBLIC_FARM_ELIGIBILITY_SIGNER,
  PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT,
  PUBLIC_FARM_MARCO_TOKEN,
  PUBLIC_FARM_PAIR_FACTORY,
  isPublicFarmFactoryBound,
} from 'config/constants/publicFarmFactoryDeployment'
import { PUBLIC_FARM_FACTORY_READINESS } from 'views/FarmsStudio/modules/publicFarmFactoryReadiness'

const WEB = path.resolve(__dirname, '../../../..')
const SHELL = path.resolve(__dirname, '../../../views/DeploymentOrchestrator/FounderDeploymentShell.tsx')
const EVIDENCE = path.join(WEB, 'docs/runtime/melega-dex-v1-public-farm-factory-mainnet-deployment-execution')

describe('Public Farm Factory mainnet deployment execution', () => {
  beforeEach(() => {
    resetPffSession()
  })

  it('Part A — pff-v1-certified.json valid; PublicFarmFactoryV1 schema locked', () => {
    const loaded = loadCertifiedPffArtifacts()
    expect(loaded.status).toBe('ARTIFACTS_VALID')
    expect(loaded.treasury).toBe(FOUNDER_TREASURY_DESTINATION)
    expect(loaded.deployer).toBe(AUTHORIZED_MELEGA_DEPLOYER)
    const art = loaded.artifacts.PublicFarmFactoryV1
    expect(assessPffArtifactIntegrity(art).ok).toBe(true)
    expect(existsSync(path.join(WEB, 'src/lib/deployment-orchestrator/artifacts/pff-v1-certified.json'))).toBe(
      true,
    )
  })

  it('Part B — economics + constructor: MARCO FREE / 0.25 BNB / treasury / MELEGA DEPLOYER', () => {
    const built = buildPublicFarmDeployStep()
    expect(built.review.constructorValid).toBe(true)
    expect(built.review.artifactValid).toBe(true)
    expect(built.step?.blockedReason).toBeNull()
    expect(built.economicReview.some((f) => f.value === 'FREE')).toBe(true)
    expect(built.economicReview.some((f) => f.value.includes('0.25'))).toBe(true)
    expect(built.step?.humanFields.some((f) => f.value.includes(FOUNDER_TREASURY_DESTINATION))).toBe(true)
    expect(
      verifyPffConstructorArgs({
        treasury: FOUNDER_TREASURY_DESTINATION,
        marcoToken: PUBLIC_FARM_MARCO_TOKEN,
        pairFactory: PUBLIC_FARM_PAIR_FACTORY,
        eligibilitySigner: PUBLIC_FARM_ELIGIBILITY_SIGNER,
      }).ok,
    ).toBe(true)
  })

  it('Part C — creation request READY_FOR_SIGNATURE shape (no to, no auto-broadcast)', () => {
    const built = buildPublicFarmDeployStep()
    const req = buildContractCreationRequest({
      from: AUTHORIZED_MELEGA_DEPLOYER,
      data: built.step!.deploymentData!,
      gasUnits: 3_000_000n,
    })
    expect(req.from).toBe(AUTHORIZED_MELEGA_DEPLOYER)
    expect('to' in req).toBe(false)
    expect(req.value).toBe('0x0')
    expect(req.data.startsWith('0x')).toBe(true)
    expect(PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.status).toBe('AWAITING_VALIDATION')
    expect(isPffExecutionAwaitingFounderSignature()).toBe(true)
  })

  it('Part E — validation rejects bad constructor; does not fabricate SSOT bind', () => {
    const bad = validatePffFactoryFromOnChain({
      txHash: `0x${'11'.repeat(32)}`,
      nonce: 7,
      receipt: {
        contractAddress: '0x2222222222222222222222222222222222222222',
        status: 1,
        from: AUTHORIZED_MELEGA_DEPLOYER,
        blockNumber: '0x10',
        gasUsed: '0x1000',
      },
      runtimeBytecode: `0x${'ab'.repeat(100)}`,
      treasuryOnChain: FOUNDER_TREASURY_DESTINATION,
      marcoTokenOnChain: PUBLIC_FARM_MARCO_TOKEN,
      pairFactoryOnChain: PUBLIC_FARM_PAIR_FACTORY,
      eligibilitySignerOnChain: '0x3333333333333333333333333333333333333333',
    })
    expect(bad.ok).toBe(false)
    expect(getPffSessionBound()).toBeNull()
    expect(isPublicFarmFactoryBound()).toBe(false)
    expect(PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.factoryAddress).toBeNull()
  })

  it('Part F — quarantined evidence cannot bind; SSOT stays null', () => {
    expect(() =>
      bindValidatedPublicFarmFactory({
        schema: 'melega.public-farm-factory.deployment-evidence.v1',
        chainId: 56,
        contractAlias: 'PublicFarmFactoryV1',
        contractName: 'PublicFarmFactoryV1',
        txHash: `0x${'22'.repeat(32)}`,
        nonce: 1,
        from: AUTHORIZED_MELEGA_DEPLOYER,
        contractAddress: '0x3333333333333333333333333333333333333333',
        blockNumber: 1,
        gasUsed: '1',
        receiptStatus: 'success',
        runtimeBytecodeSha256: '0x',
        runtimeHashMatchesCertified: true,
        treasury: FOUNDER_TREASURY_DESTINATION,
        marcoToken: PUBLIC_FARM_MARCO_TOKEN,
        pairFactory: PUBLIC_FARM_PAIR_FACTORY,
        eligibilitySigner: PUBLIC_FARM_ELIGIBILITY_SIGNER,
        constructorStateOk: true,
        validatedAt: new Date().toISOString(),
        status: 'QUARANTINED',
        quarantineReason: 'test',
      }),
    ).toThrow(/quarantined/i)
    expect(PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.factoryAddress).toBeNull()
  })

  it('Founder shell wires gas · READY_FOR_SIGNATURE · Deploy Public Farm Factory · capture · AWAITING_VALIDATION', () => {
    const ui = readFileSync(SHELL, 'utf8')
    expect(ui).toContain('Deploy Public Farm Factory')
    expect(ui).toContain('READY_FOR_SIGNATURE')
    expect(ui).toContain('validatePffFactoryFromOnChain')
    expect(ui).toContain('bindValidatedPublicFarmFactory')
    expect(ui).toContain('founder-pff-awaiting-validation')
    expect(ui).toContain('founder-pff-captured-address')
    expect(ui).toContain('founder-pff-receipt-status')
    expect(ui).toContain('walletGetTransactionReceipt')
    expect(ui).toContain('AWAITING_VALIDATION')
    expect(ui).not.toMatch(/Missing KMS|KMS signer|use KMS/i)
    expect(ui).not.toMatch(/Treasury Runtime/i)
  })

  it('readiness is AWAITING_VALIDATION — user create disabled — factoryAddress null', () => {
    expect(PUBLIC_FARM_FACTORY_READINESS.status).toBe('AWAITING_VALIDATION')
    expect(PUBLIC_FARM_FACTORY_READINESS.executionEnabled).toBe(false)
    expect(PUBLIC_FARM_FACTORY_READINESS.factoryAddress).toBeNull()
    expect(PUBLIC_FARM_FACTORY_READINESS.blockerCode).toBe('PUBLIC_FARM_FACTORY_AWAITING_VALIDATION')
    expect(PUBLIC_FARM_FACTORY_READINESS.readyForFounderSignature).toBe(true)
    expect(PUBLIC_FARM_FACTORY_READINESS.noTreasuryRuntime).toBe(true)
  })

  it('execution evidence pack present', () => {
    expect(existsSync(path.join(EVIDENCE, 'MISSION_REPORT.md'))).toBe(true)
    expect(existsSync(path.join(EVIDENCE, 'readiness.json'))).toBe(true)
    expect(existsSync(path.join(EVIDENCE, 'deployment-request.json'))).toBe(true)
    expect(existsSync(path.join(EVIDENCE, 'artifact-validation.json'))).toBe(true)
  })
})
