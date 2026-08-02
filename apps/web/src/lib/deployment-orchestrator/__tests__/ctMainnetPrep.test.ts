import { describe, expect, it } from 'vitest'
import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { Interface } from '@ethersproject/abi'
import {
  AUTHORIZED_MELEGA_DEPLOYER,
  FOUNDER_TREASURY_DESTINATION,
  assessCtArtifactIntegrity,
  buildContractCreationRequest,
  buildCreateTokenDeployStep,
  buildCreateTokenTransactionReview,
  encodeCtConstructor,
  isSubsystemReadyForFounderDeploy,
  loadCertifiedCtArtifacts,
  nextFounderDeployTarget,
  verifyCtConstructorArgs,
} from 'lib/deployment-orchestrator'
import {
  CREATE_TOKEN_CANONICAL_DEPLOYMENT,
  CREATE_TOKEN_CREATION_FEE_WEI,
  isCreateTokenFactoryBound,
} from 'config/constants/createTokenFactoryDeployment'
import { CREATE_TOKEN_READINESS } from 'views/ListStudio/createTokenReadiness'
import { LIST_CREATE_TOKEN_AVAILABLE } from 'views/ListStudio/listTokens'

const WEB = path.resolve(__dirname, '../../../..')
const SHELL = path.resolve(__dirname, '../../../views/DeploymentOrchestrator/FounderDeploymentShell.tsx')

describe('Create Token Factory mainnet deployment preparation', () => {
  it('certified CT artifact loads with hash + fee destination integrity', () => {
    const loaded = loadCertifiedCtArtifacts()
    expect(loaded.status).toBe('ARTIFACTS_VALID')
    expect(loaded.statusLabels).toContain('Certified artifact loaded')
    expect(loaded.statusLabels).toContain('Artifact hash verified')
    expect(loaded.treasury).toBe(FOUNDER_TREASURY_DESTINATION)
    expect(loaded.creationFeeWei).toBe('100000000000000000')
    expect(loaded.deployer).toBe(AUTHORIZED_MELEGA_DEPLOYER)
    const art = loaded.artifacts.MelegaTokenFactory
    const gate = assessCtArtifactIntegrity(art)
    expect(gate.ok).toBe(true)
    expect(gate.feeRecipientOk).toBe(true)
    expect(gate.creationFeeOk).toBe(true)
    expect(art.creationBytecode.startsWith('0x')).toBe(true)
  })

  it('manifest --check-committed passes without Forge out/', () => {
    const script = path.join(WEB, 'scripts/generate-ct-certified-manifest.mjs')
    expect(existsSync(script)).toBe(true)
    execSync(`node ${script} --check-committed`, { cwd: WEB, stdio: 'pipe' })
  })

  it('constructor encoding matches ethers Interface.encodeDeploy for treasury + 0.10 BNB', () => {
    const loaded = loadCertifiedCtArtifacts()
    const art = loaded.artifacts.MelegaTokenFactory
    const args = [FOUNDER_TREASURY_DESTINATION, CREATE_TOKEN_CREATION_FEE_WEI]
    const encoded = encodeCtConstructor(art.constructorInputs, args)
    const iface = new Interface([{ type: 'constructor', inputs: art.constructorInputs as any }])
    expect(encoded).toBe(iface.encodeDeploy(args))
    const built = buildCreateTokenDeployStep()
    expect(built.step?.deploymentData).toBe(art.creationBytecode + encoded.slice(2))
    expect(built.step?.blockedReason).toBeNull()
    expect(built.artifactStatus).toBe('ARTIFACTS_VALID')
  })

  it('constructor review rejects wrong fee destination / fee amount', () => {
    expect(
      verifyCtConstructorArgs({
        feeRecipient: FOUNDER_TREASURY_DESTINATION,
        creationFeeWei: '100000000000000000',
      }).ok,
    ).toBe(true)
    expect(
      verifyCtConstructorArgs({
        feeRecipient: AUTHORIZED_MELEGA_DEPLOYER,
        creationFeeWei: '100000000000000000',
      }).ok,
    ).toBe(false)
    expect(
      verifyCtConstructorArgs({
        feeRecipient: FOUNDER_TREASURY_DESTINATION,
        creationFeeWei: '50000000000000000',
      }).ok,
    ).toBe(false)
  })

  it('deployment readiness: CT factory bound + READY; sequence advances to Public Farm Factory', () => {
    expect(isSubsystemReadyForFounderDeploy('create_token')).toBe(false)
    expect(nextFounderDeployTarget()).toBeNull()
    expect(isCreateTokenFactoryBound()).toBe(true)
    expect(CREATE_TOKEN_CANONICAL_DEPLOYMENT.factoryAddress?.toLowerCase()).toBe(
      '0x6dbb5d7162842da94ef9172aedc8d148d203d311',
    )
    expect(CREATE_TOKEN_CANONICAL_DEPLOYMENT.status).toBe('READY')
    expect(CREATE_TOKEN_READINESS.status).toBe('READY')
    expect(CREATE_TOKEN_READINESS.bytecodePresent).toBe(true)
    expect(CREATE_TOKEN_READINESS.deploymentAuthorityReady).toBe(true)
    expect(CREATE_TOKEN_READINESS.executionEnabled).toBe(true)
    expect(LIST_CREATE_TOKEN_AVAILABLE).toBe(true)
  })

  it('wallet signature flow builds creation request without to / value / auto-broadcast', () => {
    const built = buildCreateTokenDeployStep()
    expect(built.step?.deploymentData).toBeTruthy()
    const req = buildContractCreationRequest({
      from: AUTHORIZED_MELEGA_DEPLOYER,
      data: built.step!.deploymentData!,
      gasUnits: 2_000_000n,
    })
    expect(req.from).toBe(AUTHORIZED_MELEGA_DEPLOYER)
    expect(req.data.startsWith('0x')).toBe(true)
    expect(req.value).toBe('0x0')
    expect('to' in req).toBe(false)
  })

  it('Founder shell wires Create Token stage without manual bytecode upload / KMS / server signer', () => {
    const ui = readFileSync(SHELL, 'utf8')
    expect(ui).toContain('buildCreateTokenDeployStep')
    expect(ui).toContain('Deploy Create Token Factory')
    expect(ui).toContain('Ready for Founder signature')
    expect(ui).toContain('no KMS')
    expect(ui).toContain('no server signer')
    expect(ui).not.toMatch(/Load certified creation bytecode/i)
    expect(ui).not.toMatch(/Attach certified creation bytecode/i)
    expect(ui).not.toMatch(/Treasury Runtime/i)
  })

  it('transaction review documents 0.10 BNB fee to MELEGA TREASURY WALLET', () => {
    const review = buildCreateTokenTransactionReview()
    expect(review.constructorValid).toBe(true)
    expect(review.feeConfiguration.creationFeeWei).toBe('100000000000000000')
    expect(review.treasuryDestination.toLowerCase()).toBe(FOUNDER_TREASURY_DESTINATION.toLowerCase())
    expect(review.packagePath).toBe('contracts/create-token/')
  })

  it('package sources and deploy script exist', () => {
    const root = path.resolve(WEB, '../..')
    expect(existsSync(path.join(root, 'contracts/create-token/MelegaTokenFactory.sol'))).toBe(true)
    expect(existsSync(path.join(root, 'contracts/create-token/MelegaFixedSupplyToken.sol'))).toBe(true)
    expect(existsSync(path.join(root, 'script/create-token/DeployMelegaTokenFactoryMainnet.s.sol'))).toBe(true)
    expect(
      existsSync(path.join(WEB, 'src/lib/deployment-orchestrator/artifacts/ct-v1-certified.json')),
    ).toBe(true)
  })
})
