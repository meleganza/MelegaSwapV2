import { getConstitutionalCanonicalEconomy } from 'lib/economic-activation'
import { LAUNCH_CAPABILITY_IDS, statusToAvailability, USER_LAUNCH_AS_OF, USER_LAUNCH_DISCLAIMER } from './launch-capabilities'
import { LAUNCH_REQUIREMENTS } from './launch-requirements'
import { LaunchCapability, LaunchReadModel } from './launch-types'

const manifestFor = (id: string): string => `manifest://melega/platform/user-launch/${id}@0.1.0`

const multiChainSupport = (notes: string) => ({
  chains: ['BNB Chain', 'Ethereum', 'Polygon', 'Base'],
  canonicalChain: 'BNB Chain',
  notes,
})

const buildCapability = (capability: LaunchCapability): LaunchCapability => ({
  ...capability,
  requiredInputs: capability.requiredInputs.map((input) => ({ ...input })),
  warnings: [...capability.warnings],
})

const LAUNCH_CAPABILITIES: LaunchCapability[] = [
  buildCapability({
    id: 'create_token',
    label: 'Create a Token',
    description:
      'Deploy a new fungible token. Not exposed as a DEX-native deployer — planned via Melega Labs handoff.',
    status: 'PLANNED',
    availability: statusToAvailability('PLANNED'),
    requiredInputs: LAUNCH_REQUIREMENTS.create_token,
    walletRequirement: 'required',
    chainSupport: multiChainSupport('Deployment chain selected at Labs validation — canonical economy remains BNB Chain / MARCO'),
    contractDependency: {
      kind: 'contract',
      label: 'Token deployment contract',
      reference: 'labs://token/deploy',
      status: 'PLANNED',
    },
    executionDependency: {
      kind: 'execution',
      label: 'On-chain deployment',
      reference: 'manifest://melega/platform/execution@0.2.0',
      status: 'PLANNED',
    },
    warnings: [
      'NOT LIVE on DEX — no fake deploy button',
      'Anyone can deploy tokens externally; DEX does not verify legitimacy',
    ],
    machineManifest: manifestFor('create_token'),
  }),
  buildCapability({
    id: 'submit_token_metadata',
    label: 'Submit Token Metadata',
    description: 'Submit metadata for token list indexing and discovery surfaces.',
    status: 'PLANNED',
    availability: statusToAvailability('PLANNED'),
    requiredInputs: LAUNCH_REQUIREMENTS.submit_token_metadata,
    walletRequirement: 'optional',
    chainSupport: multiChainSupport('Metadata indexed per chain — not canonical economy binding'),
    contractDependency: {
      kind: 'registry',
      label: 'Asset registry',
      reference: 'manifest://melega/platform/asset-registry@0.1.0',
      status: 'indexed',
    },
    executionDependency: {
      kind: 'execution',
      label: 'Metadata submission pipeline',
      reference: 'labs://metadata/submit',
      status: 'PLANNED',
    },
    warnings: ['Token list governance not automated in this build'],
    registryHref: '/assets',
    machineManifest: manifestFor('submit_token_metadata'),
  }),
  buildCapability({
    id: 'upload_logo',
    label: 'Upload Logo',
    description: 'Upload brand logo for token list and registry surfaces.',
    status: 'PLANNED',
    availability: statusToAvailability('PLANNED'),
    requiredInputs: LAUNCH_REQUIREMENTS.upload_logo,
    walletRequirement: 'none',
    chainSupport: multiChainSupport('Logo assets bound to asset registry entries'),
    contractDependency: {
      kind: 'registry',
      label: 'Asset registry media',
      reference: 'manifest://melega/platform/asset-registry@0.1.0#media',
      status: 'indexed',
    },
    executionDependency: {
      kind: 'manifest',
      label: 'CDN upload pipeline',
      reference: 'labs://brand/logo',
      status: 'PLANNED',
    },
    warnings: ['No upload UI in this build — read model only'],
    machineManifest: manifestFor('upload_logo'),
  }),
  buildCapability({
    id: 'create_liquidity',
    label: 'Create Liquidity',
    description: 'Add liquidity to an existing or new V2 pair via the legacy Add Liquidity flow.',
    status: 'AVAILABLE_EXISTING_FLOW',
    availability: statusToAvailability('AVAILABLE_EXISTING_FLOW'),
    requiredInputs: LAUNCH_REQUIREMENTS.create_liquidity,
    walletRequirement: 'required',
    chainSupport: multiChainSupport('Uses connected wallet on active chain'),
    contractDependency: {
      kind: 'contract',
      label: 'PancakeSwap V2 Router / Factory',
      reference: 'legacy://router-v2',
      status: 'LIVE',
    },
    executionDependency: {
      kind: 'execution',
      label: 'On-chain addLiquidity',
      reference: 'legacy://add-liquidity',
      status: 'LIVE',
    },
    warnings: ['User executes real on-chain transaction via existing /add flow'],
    existingFlowHref: '/add',
    machineManifest: manifestFor('create_liquidity'),
  }),
  buildCapability({
    id: 'create_pool',
    label: 'Create Pool',
    description: 'Create a new liquidity pool by adding initial liquidity for a token pair.',
    status: 'AVAILABLE_EXISTING_FLOW',
    availability: statusToAvailability('AVAILABLE_EXISTING_FLOW'),
    requiredInputs: LAUNCH_REQUIREMENTS.create_pool,
    walletRequirement: 'required',
    chainSupport: multiChainSupport('Pool created on first liquidity add for unseen pair'),
    contractDependency: {
      kind: 'contract',
      label: 'PancakeSwap V2 Factory',
      reference: 'legacy://factory-v2',
      status: 'LIVE',
    },
    executionDependency: {
      kind: 'execution',
      label: 'On-chain pair creation + mint',
      reference: 'legacy://add-liquidity',
      status: 'LIVE',
    },
    warnings: ['Same flow as Create Liquidity — no separate pool wizard'],
    existingFlowHref: '/add',
    machineManifest: manifestFor('create_pool'),
  }),
  buildCapability({
    id: 'create_farm',
    label: 'Create Farm',
    description: 'Create a MasterChef farm for an LP token. Protocol-governed — not user-deployable in legacy DEX.',
    status: 'BLOCKED',
    availability: statusToAvailability('BLOCKED'),
    requiredInputs: LAUNCH_REQUIREMENTS.create_farm,
    walletRequirement: 'required',
    chainSupport: multiChainSupport('Existing farms indexed in venue registry only'),
    contractDependency: {
      kind: 'contract',
      label: 'MasterChef',
      reference: 'legacy://masterchef',
      status: 'LIVE',
    },
    executionDependency: {
      kind: 'execution',
      label: 'Governance / ops farm allocation',
      reference: 'manifest://melega/platform/treasury-runtime@0.2.0',
      status: 'PLANNED',
    },
    warnings: [
      'NOT user-creatable in current DEX — browse existing farms at /farms',
      'No fake farm creation button',
    ],
    existingFlowHref: '/farms',
    registryHref: '/venues',
    machineManifest: manifestFor('create_farm'),
  }),
  buildCapability({
    id: 'create_staking_pool',
    label: 'Create Staking Pool',
    description: 'Create a Sous Chef staking pool. Legacy pools are protocol-indexed; users stake in existing pools.',
    status: 'PLANNED',
    availability: statusToAvailability('PLANNED'),
    requiredInputs: LAUNCH_REQUIREMENTS.create_staking_pool,
    walletRequirement: 'required',
    chainSupport: multiChainSupport('Stake in existing pools — creation pipeline Phase 2'),
    contractDependency: {
      kind: 'contract',
      label: 'Sous Chef / SmartChef',
      reference: 'legacy://sous-chef',
      status: 'LIVE',
    },
    executionDependency: {
      kind: 'execution',
      label: 'Pool creation governance',
      reference: 'manifest://melega/platform/venue-registry@0.1.0',
      status: 'PLANNED',
    },
    warnings: ['Participate in existing pools at /pools — creation not exposed'],
    existingFlowHref: '/pools',
    registryHref: '/venues',
    machineManifest: manifestFor('create_staking_pool'),
  }),
  buildCapability({
    id: 'launch_through_labs',
    label: 'Launch through Labs',
    description: 'Labs → DEX constitutional handoff for project narrative validation and listing.',
    status: 'PLANNED',
    availability: statusToAvailability('PLANNED'),
    requiredInputs: LAUNCH_REQUIREMENTS.launch_through_labs,
    walletRequirement: 'optional',
    chainSupport: {
      chains: ['BNB Chain'],
      canonicalChain: 'BNB Chain',
      notes: 'Labs handoff targets canonical economy first',
    },
    contractDependency: {
      kind: 'manifest',
      label: 'Labs narrative surface',
      reference: 'labs://narrative/validated',
      status: 'PLANNED',
    },
    executionDependency: {
      kind: 'registry',
      label: 'Activation runtime',
      reference: 'manifest://melega/platform/economic-activation@0.1.0',
      status: 'indexed',
    },
    warnings: ['Labs connection not indexed in this build'],
    registryHref: '/new-project',
    machineManifest: manifestFor('launch_through_labs'),
  }),
  buildCapability({
    id: 'activate_economic_presence',
    label: 'Activate Economic Presence',
    description: 'Read-model activation pipeline for Economic Presence targets — not canonical economy replacement.',
    status: 'LIVE',
    availability: statusToAvailability('LIVE'),
    requiredInputs: LAUNCH_REQUIREMENTS.activate_economic_presence,
    walletRequirement: 'none',
    chainSupport: {
      chains: ['BNB Chain', 'Ethereum', 'Polygon', 'Base', 'Solana'],
      canonicalChain: 'BNB Chain',
      notes: 'Presence targets staged — MARCO on BNB Chain immutable',
    },
    contractDependency: {
      kind: 'registry',
      label: 'Presence registry',
      reference: 'manifest://melega/platform/presence-registry@0.1.0',
      status: 'indexed',
    },
    executionDependency: {
      kind: 'registry',
      label: 'Activation runtime',
      reference: 'manifest://melega/platform/economic-runtime@0.1.0',
      status: 'indexed',
    },
    warnings: [
      'Read model only — no blockchain writes',
      'Economic Presence is NOT Canonical Economy',
    ],
    existingFlowHref: '/new-project',
    registryHref: '/presence',
    machineManifest: manifestFor('activate_economic_presence'),
  }),
]

export const getLaunchCapabilities = (): LaunchCapability[] =>
  LAUNCH_CAPABILITIES.map((capability) => buildCapability(capability))

export const getLaunchCapabilityById = (id: string): LaunchCapability | undefined =>
  getLaunchCapabilities().find((capability) => capability.id === id)

export const resolveUserLaunchReadModel = (): LaunchReadModel => {
  const capabilities = getLaunchCapabilities()
  const constitutional = getConstitutionalCanonicalEconomy()

  const summary = {
    total: capabilities.length,
    live: capabilities.filter((capability) => capability.status === 'LIVE').length,
    availableExistingFlow: capabilities.filter(
      (capability) => capability.status === 'AVAILABLE_EXISTING_FLOW',
    ).length,
    planned: capabilities.filter((capability) => capability.status === 'PLANNED').length,
    blocked: capabilities.filter((capability) => capability.status === 'BLOCKED').length,
    notSupported: capabilities.filter((capability) => capability.status === 'NOT_SUPPORTED').length,
  }

  return {
    asOf: USER_LAUNCH_AS_OF,
    disclaimer: USER_LAUNCH_DISCLAIMER,
    readOnly: true,
    executionEnabled: false,
    constitutional,
    capabilities,
    summary,
  }
}

export const assertLaunchCapabilityCoverage = (): void => {
  const ids = getLaunchCapabilities().map((capability) => capability.id)
  LAUNCH_CAPABILITY_IDS.forEach((id) => {
    if (!ids.includes(id)) {
      throw new Error(`Missing launch capability: ${id}`)
    }
  })
}
