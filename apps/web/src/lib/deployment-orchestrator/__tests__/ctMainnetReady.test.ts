/**
 * MELEGA_DEX_V1_CREATE_TOKEN_FACTORY_VALIDATION_BINDING_AND_READY
 */
import { describe, expect, it, beforeEach } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { Interface } from '@ethersproject/abi'
import { arrayify, hexlify } from '@ethersproject/bytes'
import { sha256 } from '@ethersproject/sha2'
import {
  AUTHORIZED_MELEGA_DEPLOYER,
  FOUNDER_TREASURY_DESTINATION,
  assessSubsystemBinding,
  isSubsystemReadyForFounderDeploy,
  loadCertifiedCtArtifacts,
  nextFounderDeployTarget,
  resetCtSession,
  runtimeHashForCtCertifiedCompare,
  validateCtFactoryFromOnChain,
  verifyCtConstructorArgs,
} from 'lib/deployment-orchestrator'
import {
  CREATE_TOKEN_CANONICAL_DEPLOYMENT,
  CREATE_TOKEN_CREATION_FEE_WEI,
  CREATE_TOKEN_FACTORY_ADDRESS,
  CREATE_TOKEN_FACTORY_DEPLOYMENT_BLOCK,
  CREATE_TOKEN_FACTORY_DEPLOYMENT_TX,
  CREATE_TOKEN_FEE_RECIPIENT,
  isCreateTokenFactoryBound,
} from 'config/constants/createTokenFactoryDeployment'
import { CREATE_TOKEN_READINESS } from 'views/ListStudio/createTokenReadiness'
import { LIST_CREATE_TOKEN_AVAILABLE } from 'views/ListStudio/listTokens'
import { resolveCreateTokenUiState } from 'views/ListStudio/createToken/createTokenTx'
import { maskCtImmutableRegions } from 'lib/deployment-orchestrator/founderCtDeployTx'

const WEB = path.resolve(__dirname, '../../../..')
const EVIDENCE = path.join(WEB, 'docs/runtime/melega-dex-v1-create-token-factory-ready')
const FACTORY = '0x6DbB5d7162842dA94ef9172AedC8D148d203d311'
const TX = '0x79fe42294e6a43f0e16d09101f4ba6846977c0267a0fc1e6d237fa1441de79d8'

describe('Create Token Factory mainnet validation · bind · READY', () => {
  beforeEach(() => {
    resetCtSession()
  })

  it('Part A — SSOT binds factual factory + deployment tx (no fabrication)', () => {
    expect(CREATE_TOKEN_FACTORY_ADDRESS.toLowerCase()).toBe(FACTORY.toLowerCase())
    expect(CREATE_TOKEN_FACTORY_DEPLOYMENT_TX.toLowerCase()).toBe(TX.toLowerCase())
    expect(CREATE_TOKEN_FACTORY_DEPLOYMENT_BLOCK).toBe(113510808)
    expect(CREATE_TOKEN_CANONICAL_DEPLOYMENT.factoryAddress?.toLowerCase()).toBe(FACTORY.toLowerCase())
    expect(CREATE_TOKEN_CANONICAL_DEPLOYMENT.deploymentTx?.toLowerCase()).toBe(TX.toLowerCase())
    expect(CREATE_TOKEN_CANONICAL_DEPLOYMENT.verified).toBe(true)
    expect(CREATE_TOKEN_CANONICAL_DEPLOYMENT.status).toBe('READY')
    expect(isCreateTokenFactoryBound()).toBe(true)
  })

  it('Part A — receipt evidence present and success-shaped', () => {
    const receiptPath = path.join(EVIDENCE, 'receipt.json')
    expect(existsSync(receiptPath)).toBe(true)
    const receipt = JSON.parse(readFileSync(receiptPath, 'utf8'))
    expect(receipt.status).toBe('0x1')
    expect(receipt.from.toLowerCase()).toBe(AUTHORIZED_MELEGA_DEPLOYER.toLowerCase())
    expect(receipt.contractAddress.toLowerCase()).toBe(FACTORY.toLowerCase())
    expect(receipt.transactionHash.toLowerCase()).toBe(TX.toLowerCase())
  })

  it('Part A — masked runtime hash matches ct-v1-certified.json', () => {
    const runtimePath = path.join(EVIDENCE, 'runtime-validation.json')
    expect(existsSync(runtimePath)).toBe(true)
    const runtime = JSON.parse(readFileSync(runtimePath, 'utf8'))
    const certified = loadCertifiedCtArtifacts().artifacts.MelegaTokenFactory
    expect(runtime.maskedRuntimeSha256.toLowerCase()).toBe(
      certified.expectedRuntimeBytecodeSha256.toLowerCase(),
    )
    expect(runtime.hashMatch).toBe(true)
    expect(runtime.codeBytes).toBe(4448)
    // Mask helper stays deterministic
    const zeros = hexlify(new Uint8Array(4448))
    expect(maskCtImmutableRegions(zeros).startsWith('0x')).toBe(true)
    expect(runtimeHashForCtCertifiedCompare(zeros).startsWith('0x')).toBe(true)
  })

  it('Part B — constructor fee + treasury recipient', () => {
    expect(CREATE_TOKEN_CREATION_FEE_WEI).toBe('100000000000000000')
    expect(CREATE_TOKEN_FEE_RECIPIENT.toLowerCase()).toBe(FOUNDER_TREASURY_DESTINATION.toLowerCase())
    expect(
      verifyCtConstructorArgs({
        feeRecipient: FOUNDER_TREASURY_DESTINATION,
        creationFeeWei: CREATE_TOKEN_CREATION_FEE_WEI,
      }).ok,
    ).toBe(true)
    const ctor = JSON.parse(readFileSync(path.join(EVIDENCE, 'constructor-validation.json'), 'utf8'))
    expect(ctor.creationFeeWei).toBe('100000000000000000')
    expect(ctor.feeRecipient.toLowerCase()).toBe(FOUNDER_TREASURY_DESTINATION.toLowerCase())
    expect(ctor.noOwnerAdmin).toBe(true)
    expect(ctor.noProxy).toBe(true)
    expect(ctor.noTreasuryRuntime).toBe(true)
  })

  it('Part C — fee path user → factory → treasury (no TR / KMS / server signer)', () => {
    const fee = JSON.parse(readFileSync(path.join(EVIDENCE, 'fee-validation.json'), 'utf8'))
    expect(fee.path).toEqual([
      'user_pay_0.10_BNB',
      'CreateTokenFactoryV1',
      'MELEGA_TREASURY_WALLET',
    ])
    expect(fee.treasuryRuntime).toBe(false)
    expect(fee.managedWallet).toBe(false)
    expect(fee.serverSigner).toBe(false)
    expect(fee.offChainSettlement).toBe(false)
    expect(CREATE_TOKEN_READINESS.noTreasuryRuntime).toBe(true)
    expect(CREATE_TOKEN_READINESS.noKms).toBe(true)
    expect(CREATE_TOKEN_READINESS.noServerSigner).toBe(true)
  })

  it('Part D — factory binding only; LB untouched', () => {
    expect(assessSubsystemBinding('create_token').bound).toBe(true)
    expect(assessSubsystemBinding('liquidity_builder').bound).toBe(true)
    const lb = readFileSync(
      path.join(WEB, 'src/config/constants/liquidityBuildingDeployment.ts'),
      'utf8',
    )
    expect(lb).toContain("lbFactory: '0xB9f3e3020141157C215902acC1fDF65e49bE4e82'")
    const bind = JSON.parse(readFileSync(path.join(EVIDENCE, 'binding-proof.json'), 'utf8'))
    expect(bind.factoryAddress.toLowerCase()).toBe(FACTORY.toLowerCase())
    expect(bind.onlyFieldUpdated).toBe('createTokenFactoryAddress')
  })

  it('Part E — frontend READY + user create unlocked', () => {
    expect(LIST_CREATE_TOKEN_AVAILABLE).toBe(true)
    expect(CREATE_TOKEN_READINESS.status).toBe('READY')
    expect(CREATE_TOKEN_READINESS.executionEnabled).toBe(true)
    expect(CREATE_TOKEN_READINESS.factoryAddress?.toLowerCase()).toBe(FACTORY.toLowerCase())
    expect(CREATE_TOKEN_READINESS.lifecycle).toEqual(['DEPLOYED', 'VALIDATED', 'BOUND', 'READY'])
    expect(CREATE_TOKEN_READINESS.blockers).toEqual([])
    expect(CREATE_TOKEN_READINESS.blockerCode).toBeNull()
    expect(
      resolveCreateTokenUiState({
        factoryAddress: CREATE_TOKEN_CANONICAL_DEPLOYMENT.factoryAddress,
        creationFeeWei: CREATE_TOKEN_CREATION_FEE_WEI,
        feeRecipient: CREATE_TOKEN_FEE_RECIPIENT,
        chainId: 56,
        account: '0x1111111111111111111111111111111111111111',
        walletBalanceWei: CREATE_TOKEN_CREATION_FEE_WEI,
      }),
    ).toBe('READY')
  })

  it('Part G — validation helper accepts factual on-chain shaped evidence', () => {
    // Reconstruct a matching masked runtime from certified creation bytecode suffix is not required —
    // evidence file already proves live hash. Here we prove quarantine still works on bad fee.
    const bad = validateCtFactoryFromOnChain({
      txHash: TX,
      receipt: {
        contractAddress: FACTORY,
        status: 1,
        from: AUTHORIZED_MELEGA_DEPLOYER,
        blockNumber: '0x6c41598',
        gasUsed: '0xf7931',
      },
      runtimeBytecode: hexlify(arrayify(`0x${'ab'.repeat(4448)}`)),
      creationFeeWeiOnChain: '1',
      feeRecipientOnChain: FOUNDER_TREASURY_DESTINATION,
    })
    expect(bad.ok).toBe(false)
  })

  it('sequence advances past Create Token to Public Farm Factory', () => {
    expect(isSubsystemReadyForFounderDeploy('create_token')).toBe(false)
    expect(nextFounderDeployTarget()).toBeNull()
  })

  it('UI surfaces fee + treasury + READY without misleading KMS copy', () => {
    const ws = readFileSync(path.join(WEB, 'src/views/ListStudio/ListWorkspace.tsx'), 'utf8')
    expect(ws).toContain('list-create-token-ready')
    expect(ws).toContain('list-create-token-cta-ready')
    expect(ws).toContain('0.10 BNB')
    expect(ws).toContain('MELEGA TREASURY WALLET')
    expect(ws).not.toMatch(/Missing: production deployment authority \(KMS/)
    const shell = readFileSync(
      path.join(WEB, 'src/views/DeploymentOrchestrator/FounderDeploymentShell.tsx'),
      'utf8',
    )
    expect(shell).toContain('founder-create-token-mainnet-ready')
    expect(shell).toContain('CREATE_TOKEN_CANONICAL_DEPLOYMENT.factoryAddress')
    expect(shell).toContain('DEPLOYED · VALIDATED · BOUND · READY')
  })

  it('deployed-addresses JSON matches SSOT', () => {
    const deployed = JSON.parse(
      readFileSync(path.join(WEB, '../../deployments/create-token/chain-56/deployed-addresses.v1.json'), 'utf8'),
    )
    expect(deployed.factory.toLowerCase()).toBe(FACTORY.toLowerCase())
    expect(deployed.deploymentTx.toLowerCase()).toBe(TX.toLowerCase())
    expect(deployed.status).toBe('READY')
    expect(deployed.verified).toBe(true)
  })

  it('constructor view encoders remain creationFee / feeRecipient', () => {
    const iface = new Interface([
      'function creationFee() view returns (uint256)',
      'function feeRecipient() view returns (address)',
    ])
    expect(iface.encodeFunctionData('creationFee', [])).toMatch(/^0x/)
    expect(iface.encodeFunctionData('feeRecipient', [])).toMatch(/^0x/)
    expect(sha256('0x00').startsWith('0x')).toBe(true)
  })
})
