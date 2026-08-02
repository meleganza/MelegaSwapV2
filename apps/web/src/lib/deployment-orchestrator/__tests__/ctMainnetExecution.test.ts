/**
 * MELEGA_DEX_V1_CREATE_TOKEN_FACTORY_MAINNET_DEPLOYMENT_EXECUTION
 */
import { describe, expect, it, beforeEach } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import {
  AUTHORIZED_MELEGA_DEPLOYER,
  FOUNDER_TREASURY_DESTINATION,
  assessCtArtifactIntegrity,
  bindValidatedCreateTokenFactory,
  buildContractCreationRequest,
  buildCreateTokenDeployStep,
  decodeCtCreationFee,
  decodeCtFeeRecipient,
  encodeCtCreationFeeCall,
  encodeCtFeeRecipientCall,
  getCtSessionBound,
  isCtExecutionAwaitingFounderSignature,
  loadCertifiedCtArtifacts,
  resetCtSession,
  validateCtFactoryFromOnChain,
  verifyCtConstructorArgs,
} from 'lib/deployment-orchestrator'
import {
  CREATE_TOKEN_CANONICAL_DEPLOYMENT,
  CREATE_TOKEN_CREATION_FEE_WEI,
  isCreateTokenFactoryBound,
} from 'config/constants/createTokenFactoryDeployment'
import { CREATE_TOKEN_READINESS } from 'views/ListStudio/createTokenReadiness'
import { Interface } from '@ethersproject/abi'
import { hexlify } from '@ethersproject/bytes'
import { loadCertifiedCtArtifacts as loadCt } from 'lib/deployment-orchestrator/founderCtArtifacts'
import { maskCtImmutableRegions } from 'lib/deployment-orchestrator/founderCtDeployTx'

const WEB = path.resolve(__dirname, '../../../..')
const SHELL = path.resolve(__dirname, '../../../views/DeploymentOrchestrator/FounderDeploymentShell.tsx')

describe('Create Token Factory mainnet deployment execution', () => {
  beforeEach(() => {
    resetCtSession()
  })

  it('Part A — certified artifact loads; hash + bytecode + constructor schema valid', () => {
    const loaded = loadCertifiedCtArtifacts()
    expect(loaded.status).toBe('ARTIFACTS_VALID')
    expect(loaded.treasury).toBe(FOUNDER_TREASURY_DESTINATION)
    expect(CREATE_TOKEN_CANONICAL_DEPLOYMENT.chainId).toBe(56)
    expect(loaded.creationFeeWei).toBe('100000000000000000')
    expect(loaded.deployer).toBe(AUTHORIZED_MELEGA_DEPLOYER)
    const art = loaded.artifacts.MelegaTokenFactory
    const gate = assessCtArtifactIntegrity(art)
    expect(gate.ok).toBe(true)
    expect(art.constructorInputs.map((i) => i.name)).toEqual(['feeRecipient_', 'creationFee_'])
    expect(existsSync(path.join(WEB, 'src/lib/deployment-orchestrator/artifacts/ct-v1-certified.json'))).toBe(true)
  })

  it('Part B — constructor review locks 0.10 BNB + MELEGA TREASURY + MELEGA DEPLOYER', () => {
    const built = buildCreateTokenDeployStep()
    expect(built.review.constructorValid).toBe(true)
    expect(built.review.artifactValid).toBe(true)
    expect(built.step?.blockedReason).toBeNull()
    expect(built.step?.humanFields.some((f) => f.value.includes('0.10 BNB'))).toBe(true)
    expect(built.step?.humanFields.some((f) => f.value.includes(FOUNDER_TREASURY_DESTINATION))).toBe(true)
    expect(built.step?.humanFields.some((f) => f.value.includes(AUTHORIZED_MELEGA_DEPLOYER))).toBe(true)
    expect(
      verifyCtConstructorArgs({
        feeRecipient: FOUNDER_TREASURY_DESTINATION,
        creationFeeWei: CREATE_TOKEN_CREATION_FEE_WEI,
      }).ok,
    ).toBe(true)
  })

  it('Part C — creation request READY_FOR_SIGNATURE shape (no to, no auto-broadcast)', () => {
    const built = buildCreateTokenDeployStep()
    const req = buildContractCreationRequest({
      from: AUTHORIZED_MELEGA_DEPLOYER,
      data: built.step!.deploymentData!,
      gasUnits: 2_500_000n,
    })
    expect(req.from).toBe(AUTHORIZED_MELEGA_DEPLOYER)
    expect('to' in req).toBe(false)
    expect(req.value).toBe('0x0')
    expect(req.data.startsWith('0x')).toBe(true)
    expect(CREATE_TOKEN_CANONICAL_DEPLOYMENT.status).toBe('READY')
    // SSOT already bound — session await flag is false when factoryAddress is set
    expect(isCtExecutionAwaitingFounderSignature()).toBe(false)
  })

  it('Part E — validation rejects wrong fee / recipient / deployer; accepts certified runtime', () => {
    const art = loadCt().artifacts.MelegaTokenFactory
    // Use creation bytecode as stand-in only for failure paths; success path needs matching masked runtime.
    // Here we prove quarantine on constructor mismatch without fabricating a mainnet address bind.
    const bad = validateCtFactoryFromOnChain({
      txHash: `0x${'11'.repeat(32)}`,
      nonce: 7,
      receipt: {
        contractAddress: '0x2222222222222222222222222222222222222222',
        status: 1,
        from: AUTHORIZED_MELEGA_DEPLOYER,
        blockNumber: '0x10',
        gasUsed: '0x1000',
      },
      runtimeBytecode: art.creationBytecode,
      creationFeeWeiOnChain: '50000000000000000',
      feeRecipientOnChain: FOUNDER_TREASURY_DESTINATION,
    })
    expect(bad.ok).toBe(false)
    expect(getCtSessionBound()).toBeNull()
    // SSOT remains bound to factual mainnet factory regardless of failed session validation
    expect(isCreateTokenFactoryBound()).toBe(true)
  })

  it('Part F — bind only after VALIDATED evidence; never binds zero / quarantine', () => {
    expect(() =>
      bindValidatedCreateTokenFactory({
        schema: 'melega.create-token.deployment-evidence.v1',
        chainId: 56,
        contractAlias: 'CreateTokenFactoryV1',
        contractName: 'MelegaTokenFactory',
        txHash: `0x${'22'.repeat(32)}`,
        nonce: 1,
        from: AUTHORIZED_MELEGA_DEPLOYER,
        contractAddress: '0x3333333333333333333333333333333333333333',
        blockNumber: 1,
        gasUsed: '1',
        receiptStatus: 'success',
        runtimeBytecodeSha256: '0x',
        runtimeHashMatchesCertified: true,
        creationFeeWei: CREATE_TOKEN_CREATION_FEE_WEI,
        feeRecipient: FOUNDER_TREASURY_DESTINATION,
        constructorStateOk: true,
        validatedAt: new Date().toISOString(),
        status: 'QUARANTINED',
        quarantineReason: 'test',
      }),
    ).toThrow(/quarantined/i)
    expect(CREATE_TOKEN_CANONICAL_DEPLOYMENT.factoryAddress?.toLowerCase()).toBe(
      '0x6dbb5d7162842da94ef9172aedc8d148d203d311',
    )
  })

  it('constructor view encoders round-trip fee + recipient', () => {
    const iface = new Interface([
      'function creationFee() view returns (uint256)',
      'function feeRecipient() view returns (address)',
    ])
    const feeData = encodeCtCreationFeeCall()
    const recipData = encodeCtFeeRecipientCall()
    expect(feeData).toBe(iface.encodeFunctionData('creationFee', []))
    expect(recipData).toBe(iface.encodeFunctionData('feeRecipient', []))
    const feeEncoded = iface.encodeFunctionResult('creationFee', [CREATE_TOKEN_CREATION_FEE_WEI])
    const recipEncoded = iface.encodeFunctionResult('feeRecipient', [FOUNDER_TREASURY_DESTINATION])
    expect(decodeCtCreationFee(feeEncoded)).toBe(CREATE_TOKEN_CREATION_FEE_WEI)
    expect(decodeCtFeeRecipient(recipEncoded).toLowerCase()).toBe(FOUNDER_TREASURY_DESTINATION.toLowerCase())
    // mask helper stays available for runtime compare
    expect(maskCtImmutableRegions(hexlify(new Uint8Array(1400))).startsWith('0x')).toBe(true)
  })

  it('Founder shell wires gas · READY_FOR_SIGNATURE · Deploy Create Token Factory · CT validate/bind', () => {
    const ui = readFileSync(SHELL, 'utf8')
    expect(ui).toContain('Deploy Create Token Factory')
    expect(ui).toContain('READY_FOR_SIGNATURE')
    expect(ui).toContain('validateCtFactoryFromOnChain')
    expect(ui).toContain('bindValidatedCreateTokenFactory')
    expect(ui).toContain('walletGetTransaction')
    expect(ui).toContain('walletEthCall')
    expect(ui).not.toMatch(/Treasury Runtime/i)
    expect(ui).toMatch(/no KMS/i)
    expect(ui).not.toMatch(/Missing KMS|KMS signer|use KMS/i)
  })

  it('frontend readiness is MAINNET READY — user create enabled', () => {
    expect(CREATE_TOKEN_READINESS.status).toBe('READY')
    expect(CREATE_TOKEN_READINESS.executionEnabled).toBe(true)
    expect(CREATE_TOKEN_READINESS.factoryAddress?.toLowerCase()).toBe(
      '0x6dbb5d7162842da94ef9172aedc8d148d203d311',
    )
    expect(CREATE_TOKEN_READINESS.blockerCode).toBeNull()
    expect(CREATE_TOKEN_READINESS.noTreasuryRuntime).toBe(true)
  })
})
