import { IdentityArchetype, IdentityArchetypeRecord } from './identity-types'

export const ECONOMIC_IDENTITY_VERSION = '0.1.0'

export const ECONOMIC_IDENTITY_AS_OF = '2026-06-28'

export const ECONOMIC_IDENTITY_DISCLAIMER =
  'Economic Identity read model only. Not a social profile, KYC, or account system. No wallet balances, NFT holdings, or on-chain writes indexed in this build.'

export const IDENTITY_EMPTY_MESSAGE = 'No address-bound economic activity indexed.'

export const IDENTITY_ARCHETYPE_ORDER: IdentityArchetype[] = [
  'human_operator',
  'ai_agent',
  'project_operator',
  'liquidity_provider',
  'collector',
  'launcher',
  'observer',
]

export const IDENTITY_ARCHETYPE_SEEDS: IdentityArchetypeRecord[] = [
  {
    id: 'human_operator',
    label: 'Human Operator',
    description: 'A person navigating Melega economic surfaces — workspace, launch, and activation.',
    status: 'available',
    notes: 'Default archetype when no wallet binding is indexed.',
  },
  {
    id: 'ai_agent',
    label: 'AI Agent',
    description: 'Future autonomous economic actor — agent-readiness scored from indexed surfaces only.',
    status: 'planned',
    notes: 'No agent wallet binding in this build. Readiness score is illustrative.',
  },
  {
    id: 'project_operator',
    label: 'Project Operator',
    description: 'Operates project registry entries, activation handoffs, and economic presence targets.',
    status: 'indexed',
    notes: 'Project registry indexed — operator binding not wallet-verified.',
  },
  {
    id: 'liquidity_provider',
    label: 'Liquidity Provider',
    description: 'Provides liquidity via legacy DEX flows — venue registry indexed, balances not.',
    status: 'available',
    notes: 'LP venues indexed in workspace — no TVL or balance figures.',
  },
  {
    id: 'collector',
    label: 'Collector',
    description: 'Civilization collectible holder archetype — BabyMarco Genesis and future participation proofs.',
    status: 'indexed',
    notes: 'Collectibles registry indexed — ownership not verified without wallet reads.',
  },
  {
    id: 'launcher',
    label: 'Launcher',
    description: 'Uses launch capabilities for token, pool, farm, and collectible surfaces.',
    status: 'indexed',
    notes: 'Launch layer indexed — execution remains on existing flows only.',
  },
  {
    id: 'observer',
    label: 'Observer',
    description: 'Read-only participant — graph, query, presence, and identity surfaces without execution.',
    status: 'available',
    notes: 'Default when wallet_not_connected.',
  },
]

export const PLACEHOLDER_ADDRESS_SLUG = 'placeholder'

export const isEvmAddressShape = (value: string): boolean => /^0x[a-fA-F0-9]{40}$/.test(value)
