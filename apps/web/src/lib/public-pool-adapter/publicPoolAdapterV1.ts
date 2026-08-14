import { Interface } from '@ethersproject/abi'
import { arrayify, hexlify } from '@ethersproject/bytes'
import { sha256 } from '@ethersproject/sha2'
import { AUTHORIZED_MELEGA_DEPLOYER, FOUNDER_TREASURY_DESTINATION } from 'lib/deployment-orchestrator/founderDeployer'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import { MELEGA_SMARTCHEF_FACTORY_BSC } from 'lib/bsc-indexer/constants'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const certified = require('../deployment-orchestrator/artifacts/ppfa-v1-certified.json') as {
  schema: string
  chainId: number
  deployer: string
  legacyFactory: string
  marcoToken: string
  treasury: string
  smartChefInitCodeHash: string
  immutableByteRanges: Array<{ start: number; length: number }>
  artifacts: Record<
    string,
    {
      contractName: string
      creationBytecode: string
      creationBytecodeSha256: string
      expectedRuntimeBytecodeSha256: string
      constructorInputs: Array<{ name: string; type: string; internalType?: string }>
      abi: unknown[]
    }
  >
}

export const PUBLIC_POOL_ADAPTER_CONTRACT = 'PublicPoolFactoryAdapterV1' as const
export const PUBLIC_POOL_ADAPTER_CHAIN_ID = 56 as const
export const PUBLIC_POOL_ADAPTER_LEGACY_FACTORY = MELEGA_SMARTCHEF_FACTORY_BSC
export const PUBLIC_POOL_ADAPTER_MARCO = MARCO_BSC_ADDRESS
export const PUBLIC_POOL_ADAPTER_TREASURY = FOUNDER_TREASURY_DESTINATION
export const LEGACY_SMARTCHEF_INIT_CODE_HASH =
  '0x6a0d0b073d0d328d62f194cf061b2075570cf5d131eeb707cf7db52ae91c3f9b' as const

export const PUBLIC_POOL_ADAPTER_IFACE = new Interface([
  'function owner() view returns (address)',
  'function smartChefFactory() view returns (address)',
  'function marcoToken() view returns (address)',
  'function treasury() view returns (address)',
  'function smartChefInitCodeHash() view returns (bytes32)',
  'function creationPaused() view returns (bool)',
  'function creationFeeFor(address stakedToken) view returns (uint256)',
  'function predictPoolAddress(address stakedToken,address rewardToken,uint256 startBlock) view returns (address)',
  'function createPool(address stakedToken,address rewardToken,uint256 rewardBudget,uint256 rewardPerBlock,uint256 startBlock,uint256 bonusEndBlock,uint256 poolLimitPerUser) payable returns (address)',
  'event PoolCreated(address indexed creator,address indexed pool,address indexed stakedToken,address rewardToken,uint256 rewardBudget,uint256 rewardPerBlock,uint256 startBlock,uint256 bonusEndBlock,uint256 poolLimitPerUser,uint256 creationFee)',
])

export const LEGACY_SMARTCHEF_FACTORY_IFACE = new Interface([
  'function owner() view returns (address)',
  'function transferOwnership(address newOwner)',
])

function normalize(value: string): string {
  return value.toLowerCase()
}

function constructorValues(): string[] {
  return [
    AUTHORIZED_MELEGA_DEPLOYER,
    PUBLIC_POOL_ADAPTER_LEGACY_FACTORY,
    PUBLIC_POOL_ADAPTER_MARCO,
    PUBLIC_POOL_ADAPTER_TREASURY,
    LEGACY_SMARTCHEF_INIT_CODE_HASH,
  ]
}

export type PublicPoolAdapterArtifactGate = {
  ok: boolean
  reasons: string[]
  creationBytecodeSha256: string
  expectedRuntimeBytecodeSha256: string
  deploymentData: string | null
}

export function buildPublicPoolAdapterArtifactGate(): PublicPoolAdapterArtifactGate {
  const reasons: string[] = []
  const artifact = certified.artifacts[PUBLIC_POOL_ADAPTER_CONTRACT]
  if (!artifact) reasons.push('Certified adapter artifact missing')
  if (certified.schema !== 'melega.dex.v1.ppfa-certified-bytecode') reasons.push('Certified schema mismatch')
  if (certified.chainId !== PUBLIC_POOL_ADAPTER_CHAIN_ID) reasons.push('Certified chain mismatch')
  if (normalize(certified.deployer) !== normalize(AUTHORIZED_MELEGA_DEPLOYER)) reasons.push('Deployer mismatch')
  if (normalize(certified.legacyFactory) !== normalize(PUBLIC_POOL_ADAPTER_LEGACY_FACTORY)) {
    reasons.push('Legacy factory mismatch')
  }
  if (normalize(certified.marcoToken) !== normalize(PUBLIC_POOL_ADAPTER_MARCO)) reasons.push('MARCO mismatch')
  if (normalize(certified.treasury) !== normalize(PUBLIC_POOL_ADAPTER_TREASURY)) reasons.push('Treasury mismatch')
  if (normalize(certified.smartChefInitCodeHash) !== normalize(LEGACY_SMARTCHEF_INIT_CODE_HASH)) {
    reasons.push('SmartChef init-code hash mismatch')
  }
  const creation = artifact?.creationBytecode || ''
  const observedCreationHash = creation.startsWith('0x') ? sha256(creation) : ''
  if (normalize(observedCreationHash) !== normalize(artifact?.creationBytecodeSha256 || '')) {
    reasons.push('Creation bytecode checksum mismatch')
  }
  if (artifact?.constructorInputs?.length !== 5) reasons.push('Constructor schema mismatch')

  let deploymentData: string | null = null
  if (!reasons.length && artifact) {
    const constructor = new Interface([{ type: 'constructor', inputs: artifact.constructorInputs as any }])
    deploymentData = `${artifact.creationBytecode}${constructor.encodeDeploy(constructorValues()).slice(2)}`
  }
  return {
    ok: reasons.length === 0,
    reasons,
    creationBytecodeSha256: artifact?.creationBytecodeSha256 || '',
    expectedRuntimeBytecodeSha256: artifact?.expectedRuntimeBytecodeSha256 || '',
    deploymentData,
  }
}

export function maskedPublicPoolAdapterRuntimeHash(runtimeBytecode: string): string {
  const bytes = arrayify(runtimeBytecode)
  const copy = Uint8Array.from(bytes)
  for (const range of certified.immutableByteRanges || []) {
    for (let i = 0; i < range.length; i += 1) {
      if (range.start + i < copy.length) copy[range.start + i] = 0
    }
  }
  return sha256(hexlify(copy))
}

export function decodeFactoryOwner(result: string): string {
  return String(LEGACY_SMARTCHEF_FACTORY_IFACE.decodeFunctionResult('owner', result)[0])
}

export function encodeFactoryOwnerCall(): string {
  return LEGACY_SMARTCHEF_FACTORY_IFACE.encodeFunctionData('owner', [])
}

export function encodeFactoryTransferOwnership(adapterAddress: string): string {
  return LEGACY_SMARTCHEF_FACTORY_IFACE.encodeFunctionData('transferOwnership', [adapterAddress])
}

export function encodeAdapterViewCall(
  field: 'owner' | 'smartChefFactory' | 'marcoToken' | 'treasury' | 'smartChefInitCodeHash' | 'creationPaused',
): string {
  return PUBLIC_POOL_ADAPTER_IFACE.encodeFunctionData(field, [])
}

export function decodeAdapterViewResult(
  field: 'owner' | 'smartChefFactory' | 'marcoToken' | 'treasury' | 'smartChefInitCodeHash' | 'creationPaused',
  result: string,
): string | boolean {
  return PUBLIC_POOL_ADAPTER_IFACE.decodeFunctionResult(field, result)[0] as string | boolean
}

export type PublicPoolAdapterOnChainState = {
  owner: string
  smartChefFactory: string
  marcoToken: string
  treasury: string
  smartChefInitCodeHash: string
  creationPaused: boolean
}

export function validatePublicPoolAdapterState(state: PublicPoolAdapterOnChainState): string[] {
  const reasons: string[] = []
  if (normalize(state.owner) !== normalize(AUTHORIZED_MELEGA_DEPLOYER)) reasons.push('Adapter owner mismatch')
  if (normalize(state.smartChefFactory) !== normalize(PUBLIC_POOL_ADAPTER_LEGACY_FACTORY)) {
    reasons.push('Adapter legacy factory mismatch')
  }
  if (normalize(state.marcoToken) !== normalize(PUBLIC_POOL_ADAPTER_MARCO)) reasons.push('Adapter MARCO mismatch')
  if (normalize(state.treasury) !== normalize(PUBLIC_POOL_ADAPTER_TREASURY)) reasons.push('Adapter treasury mismatch')
  if (normalize(state.smartChefInitCodeHash) !== normalize(LEGACY_SMARTCHEF_INIT_CODE_HASH)) {
    reasons.push('Adapter SmartChef init-code hash mismatch')
  }
  if (state.creationPaused) reasons.push('Adapter creation is paused')
  return reasons
}

export function isPublicPoolAdapterAddress(value: string | null | undefined): value is string {
  return Boolean(value && /^0x[a-fA-F0-9]{40}$/.test(value))
}
