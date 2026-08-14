import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  buildPublicPoolAdapterArtifactGate,
  LEGACY_SMARTCHEF_INIT_CODE_HASH,
  PUBLIC_POOL_ADAPTER_CHAIN_ID,
  PUBLIC_POOL_ADAPTER_LEGACY_FACTORY,
  validatePublicPoolAdapterState,
} from '../publicPoolAdapterV1'
import {
  AUTHORIZED_MELEGA_DEPLOYER,
  poolCreationRequiresMelegaDeployer,
} from 'lib/deployment-orchestrator/founderDeployer'

const WEB = path.resolve(__dirname, '../../../..')
const REPO = path.resolve(WEB, '../..')

describe('Public Pool Factory Adapter V1', () => {
  it('certifies a complete BNB mainnet deployment payload', () => {
    const gate = buildPublicPoolAdapterArtifactGate()
    expect(PUBLIC_POOL_ADAPTER_CHAIN_ID).toBe(56)
    expect(PUBLIC_POOL_ADAPTER_LEGACY_FACTORY.toLowerCase()).toBe(
      '0x4c33eb3d40c78461dd1a079150fcac6da3c701cf',
    )
    expect(LEGACY_SMARTCHEF_INIT_CODE_HASH).toBe(
      '0x6a0d0b073d0d328d62f194cf061b2075570cf5d131eeb707cf7db52ae91c3f9b',
    )
    expect(gate.ok).toBe(true)
    expect(gate.reasons).toEqual([])
    expect(gate.deploymentData).toMatch(/^0x[0-9a-f]+$/i)
  })

  it('requires MELEGA DEPLOYER only when the reward token is MARCO', () => {
    expect(poolCreationRequiresMelegaDeployer(true)).toBe(true)
    expect(poolCreationRequiresMelegaDeployer(false)).toBe(false)
  })

  it('fails closed when any protected constructor binding differs', () => {
    const reasons = validatePublicPoolAdapterState({
      owner: AUTHORIZED_MELEGA_DEPLOYER,
      smartChefFactory: PUBLIC_POOL_ADAPTER_LEGACY_FACTORY,
      marcoToken: '0x0000000000000000000000000000000000000001',
      treasury: '0x0000000000000000000000000000000000000002',
      smartChefInitCodeHash: LEGACY_SMARTCHEF_INIT_CODE_HASH,
      creationPaused: false,
    })
    expect(reasons).toContain('Adapter MARCO mismatch')
    expect(reasons).toContain('Adapter treasury mismatch')
  })

  it('keeps user creation permissionless and reward funding atomic in source', () => {
    const contract = readFileSync(
      path.join(REPO, 'contracts/public-pool-adapter/PublicPoolFactoryAdapterV1.sol'),
      'utf8',
    )
    const createPool = readFileSync(
      path.join(WEB, 'src/views/PoolsStudio/components/CreatePoolCta.tsx'),
      'utf8',
    )
    expect(contract).toContain('rewardToken == marcoToken && msg.sender != owner()')
    expect(contract).toContain('safeTransferFrom(msg.sender, pool, rewardBudget)')
    expect(contract).toContain('function renounceOwnership() public pure override')
    expect(createPool).toContain('executePoolCreation')
    expect(createPool).not.toContain('No public deployment adapter is currently certified')
  })

  it('uses two explicit wallet signatures and no embedded private-key signer', () => {
    const protectedPage = readFileSync(
      path.join(WEB, 'src/views/DeploymentOrchestrator/FounderPoolAdapterDeployment.tsx'),
      'utf8',
    )
    expect(protectedPage).toContain('Signature 1 · Deploy adapter')
    expect(protectedPage).toContain('Signature 2 · Activate adapter')
    expect(protectedPage).toContain('walletSendDeployTransaction')
    expect(protectedPage).toContain('walletSendCallTransaction')
    expect(protectedPage).not.toMatch(/PRIVATE_KEY|process\.env.*KEY|new\s+Wallet\s*\(/i)
  })

  it('discovers adapter-created pools from on-chain enumeration', () => {
    const discovery = readFileSync(
      path.join(WEB, 'src/lib/bsc-indexer/registry/discoverSmartChefOnChain.ts'),
      'utf8',
    )
    expect(discovery).toContain("allPoolsLength: '0xefde4e64'")
    expect(discovery).toContain("allPools: '0x41d1de97'")
    expect(discovery).toContain('loadAdapterPoolAddresses')
    expect(discovery).toContain('pools.push(pool)')
  })
})
