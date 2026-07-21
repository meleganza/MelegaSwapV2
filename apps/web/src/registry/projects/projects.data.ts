import { PROJECT_REGISTRY_AS_OF, PROJECT_REGISTRY_DISCLAIMER } from './constants'
import { StaticProjectRecord } from './types'

const MARCO_BSC = {
  chainId: 56,
  address: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
  symbol: 'MARCO',
  ref: 'token://56/0x963556de0eb8138E97A85F0A86eE0acD159D210b',
} as const

const MARCO_ETH = {
  chainId: 1,
  address: '0x5911Dc98a9E1A4FfFD802C3A57cdA6bbd26Cdb76',
  symbol: 'MARCO',
  ref: 'token://1/0x5911Dc98a9E1A4FfFD802C3A57cdA6bbd26Cdb76',
} as const

const MARCO_POLYGON = {
  chainId: 137,
  address: '0xD3e28c74177B812d1543A406aD1A97ee3C398AC2',
  symbol: 'MARCO',
  ref: 'token://137/0xD3e28c74177B812d1543A406aD1A97ee3C398AC2',
} as const

const MARCO_BASE = {
  chainId: 8453,
  address: '0x56e46bE7714550A4Cb7bD0863BaB2680c099d8d7',
  symbol: 'MARCO',
  ref: 'token://8453/0x56e46bE7714550A4Cb7bD0863BaB2680c099d8d7',
} as const

/**
 * Canonical MARCO crypto-project / token identity.
 * Distinct immutable projectId from Melega DEX.
 */
const marco: StaticProjectRecord = {
  upi: 'upi://melega/project/marco@1',
  slug: 'marco',
  displayName: 'MARCO',
  tagline: 'Coordination token of the Melega ecosystem',
  description:
    'MARCO is the native coordination token of the Melega ecosystem. It powers trading, liquidity, farming, and staking utilities on Melega DEX across BNB Smart Chain and related networks. MARCO is a crypto-asset project identity — not the Melega DEX exchange itself.',
  projectType: 'Cryptocurrency',
  lifecycleStatus: 'operational',
  logoUrl: 'https://www.melega.finance/images/melega.png',
  registryStatus: 'listed',
  phase: 'legacy_import',
  verificationStatus: 'observed',
  trustBadges: ['canonical', 'observed'],
  endorsementStatus: 'none',
  riskTier: 'low',
  legacyImport: true,
  isCanonical: true,
  mvpStatic: true,
  sectorTags: ['DeFi', 'Utility Token'],
  supportedChains: [56, 1, 137, 8453],
  websiteUrl: 'https://www.melega.finance',
  docsUrl: 'https://www.melega.finance/about',
  spaceProfileUrl: 'https://melega.space/',
  socialLinks: [
    { type: 'telegram', url: 'https://t.me/melegacommunity' },
    { type: 'twitter', url: 'https://x.com/meleganews' },
    { type: 'instagram', url: 'https://www.instagram.com/melega.finance/' },
  ],
  resources: {
    tokens: [MARCO_BSC, MARCO_ETH, MARCO_POLYGON, MARCO_BASE],
    liquidityPools: [],
    farms: [],
    stakingPools: [],
  },
  capabilities: {
    tradable: { status: 'live', notes: 'MARCO on Melega DEX default token lists' },
    liquidity: { status: 'live', notes: 'MARCO/WBNB liquidity via /liquidity' },
    farm: { status: 'live', notes: 'MARCO farms via /farms' },
    pool: { status: 'live', notes: 'MARCO staking pools via /pools' },
    lock: { status: 'planned', notes: 'Lock Center indexing — Phase 2' },
    vesting: { status: 'planned', notes: 'Vesting disclosures — Phase 2' },
    launch: { status: 'partial', notes: 'Historical ILO surface on BSC' },
    smartdrop: { status: 'planned', notes: 'SmartDrop campaigns — Phase 2' },
    radar: { status: 'planned', notes: 'Radar incident feed — Phase 2' },
    space: { status: 'partial', notes: 'Community link only; bind not live' },
    labs: { status: 'planned', notes: 'Labs experiments — Phase 2' },
    aiReport: { status: 'planned', notes: 'AI verification pipeline not live in MVP' },
    machineManifest: { status: 'live', notes: 'Static JSON at /registry/projects/marco.json' },
    treasuryCompatible: { status: 'planned', notes: 'MARCO fee SKUs — Treasury Runtime Phase 2' },
  },
  primaryTokenRefs: [MARCO_BSC.ref, MARCO_ETH.ref, MARCO_POLYGON.ref, MARCO_BASE.ref],
  relatedProjectSlugs: ['melega-dex'],
  deepLinks: {
    swap: '/trade?chain=bsc&inputCurrency=BNB&outputCurrency=0x963556de0eb8138E97A85F0A86eE0acD159D210b',
    liquidity: '/liquidity',
    farms: '/farms',
    pools: '/pools',
    buyMarco: '/trade?chain=bsc&inputCurrency=BNB&outputCurrency=0x963556de0eb8138E97A85F0A86eE0acD159D210b',
  },
  disclaimer: PROJECT_REGISTRY_DISCLAIMER,
  asOf: PROJECT_REGISTRY_AS_OF,
}

/**
 * Canonical Melega DEX exchange project identity.
 * Related to MARCO as native ecosystem token — never the same projectId.
 */
const melegaDex: StaticProjectRecord = {
  upi: 'upi://melega/project/melega-dex@1',
  slug: 'melega-dex',
  aliases: ['melega'],
  displayName: 'Melega DEX',
  tagline: 'AI-native liquidity surface of Melega AI | KIRI Civilization',
  description:
    'Melega DEX is the decentralized exchange for swap, liquidity, farms, and pools across BNB Smart Chain, Ethereum, Polygon, and Base. MARCO is the related native coordination token of the Melega ecosystem — see /@marco for the MARCO crypto-project page.',
  projectType: 'Decentralized exchange',
  lifecycleStatus: 'operational',
  logoUrl: 'https://www.melega.finance/images/melega.png',
  registryStatus: 'listed',
  phase: 'legacy_import',
  verificationStatus: 'observed',
  trustBadges: ['canonical', 'observed'],
  endorsementStatus: 'none',
  riskTier: 'low',
  legacyImport: true,
  isCanonical: true,
  mvpStatic: true,
  sectorTags: ['Infrastructure', 'DeFi'],
  supportedChains: [56, 1, 137, 8453],
  websiteUrl: 'https://www.melega.finance',
  docsUrl: 'https://www.melega.finance/about',
  spaceProfileUrl: 'https://melega.space/',
  socialLinks: [
    { type: 'telegram', url: 'https://t.me/melegacommunity' },
    { type: 'twitter', url: 'https://x.com/meleganews' },
    { type: 'instagram', url: 'https://www.instagram.com/melega.finance/' },
  ],
  resources: {
    // Token contracts live on the MARCO project identity to avoid cross-project collisions.
    tokens: [],
    liquidityPools: [],
    farms: [],
    stakingPools: [],
  },
  capabilities: {
    tradable: { status: 'live', notes: 'Swap routing via /trade' },
    liquidity: { status: 'live', notes: 'Platform liquidity routes via /liquidity' },
    farm: { status: 'live', notes: 'Legacy MasterChef farms via /farms' },
    pool: { status: 'live', notes: 'Staking pools via /pools' },
    lock: { status: 'planned', notes: 'Lock Center indexing — Phase 2' },
    vesting: { status: 'planned', notes: 'Vesting disclosures — Phase 2' },
    launch: { status: 'partial', notes: 'ILO route /ilo on BSC' },
    smartdrop: { status: 'planned', notes: 'SmartDrop campaigns — Phase 2' },
    radar: { status: 'planned', notes: 'Radar incident feed — Phase 2' },
    space: { status: 'partial', notes: 'Community link only; bind not live' },
    labs: { status: 'planned', notes: 'Labs experiments — Phase 2' },
    aiReport: { status: 'planned', notes: 'AI verification pipeline not live in MVP' },
    machineManifest: { status: 'live', notes: 'Static JSON at /registry/projects/melega-dex.json' },
    treasuryCompatible: { status: 'planned', notes: 'Treasury Runtime Phase 2' },
  },
  primaryTokenRefs: [],
  relatedProjectSlugs: ['marco'],
  deepLinks: {
    swap: '/trade',
    liquidity: '/liquidity',
    farms: '/farms',
    pools: '/pools',
    buyMarco: '/trade?chain=bsc&inputCurrency=BNB&outputCurrency=0x963556de0eb8138E97A85F0A86eE0acD159D210b',
  },
  disclaimer: PROJECT_REGISTRY_DISCLAIMER,
  asOf: PROJECT_REGISTRY_AS_OF,
}

/** Canonical projects — MARCO listed first so token lookups prefer the token project. */
export const STATIC_PROJECTS: StaticProjectRecord[] = [marco, melegaDex]
