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

const MARCO_ARB = {
  chainId: 42161,
  address: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
  symbol: 'MARCO',
  ref: 'token://42161/0x963556de0eb8138E97A85F0A86eE0acD159D210b',
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
  supportedChains: [56, 1, 137, 8453, 42161],
  websiteUrl: 'https://www.melega.finance',
  docsUrl: 'https://www.melega.finance/about',
  spaceProfileUrl: 'https://melega.space/',
  socialLinks: [
    { type: 'telegram', url: 'https://t.me/melegacommunity' },
    { type: 'twitter', url: 'https://x.com/meleganews' },
    { type: 'instagram', url: 'https://www.instagram.com/melega.finance/' },
  ],
  resources: {
    tokens: [MARCO_BSC, MARCO_ETH, MARCO_POLYGON, MARCO_BASE, MARCO_ARB],
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
    treasuryCompatible: {
      status: 'planned',
      notes: 'MARCO fee SKUs settle to the canonical Melega Treasury Wallet',
    },
  },
  primaryTokenRefs: [MARCO_BSC.ref, MARCO_ETH.ref, MARCO_POLYGON.ref, MARCO_BASE.ref, MARCO_ARB.ref],
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
    treasuryCompatible: {
      status: 'planned',
      notes: 'Fee SKUs settle to the canonical Melega Treasury Wallet',
    },
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

const listedTokenDefaults = {
  registryStatus: 'listed' as const,
  phase: 'legacy_import' as const,
  verificationStatus: 'observed' as const,
  trustBadges: ['canonical', 'observed'] as const,
  endorsementStatus: 'none' as const,
  riskTier: 'unknown' as const,
  legacyImport: true,
  isCanonical: true,
  mvpStatic: true as const,
  supportedChains: [56],
  disclaimer: PROJECT_REGISTRY_DISCLAIMER,
  asOf: PROJECT_REGISTRY_AS_OF,
  capabilities: {
    tradable: { status: 'live' as const, notes: 'Listed on Melega DEX token list' },
    liquidity: { status: 'partial' as const },
    farm: { status: 'none' as const },
    pool: { status: 'none' as const },
    lock: { status: 'none' as const },
    vesting: { status: 'none' as const },
    launch: { status: 'none' as const },
    smartdrop: { status: 'none' as const },
    radar: { status: 'none' as const },
    space: { status: 'none' as const },
    labs: { status: 'none' as const },
    aiReport: { status: 'none' as const },
    machineManifest: { status: 'live' as const },
    treasuryCompatible: { status: 'none' as const },
  },
}

function listedBscTokenProject(input: {
  slug: string
  displayName: string
  symbol: string
  address: string
  logoUrl: string
  tagline: string
  description: string
  sectorTags: string[]
}): StaticProjectRecord {
  const token = {
    chainId: 56,
    address: input.address,
    symbol: input.symbol,
    ref: `token://56/${input.address}`,
  }
  return {
    upi: `upi://melega/project/${input.slug}@1`,
    slug: input.slug,
    displayName: input.displayName,
    tagline: input.tagline,
    description: input.description,
    projectType: 'Cryptocurrency',
    lifecycleStatus: 'operational',
    logoUrl: input.logoUrl,
    ...listedTokenDefaults,
    trustBadges: [...listedTokenDefaults.trustBadges],
    sectorTags: input.sectorTags,
    websiteUrl: 'https://www.melega.finance',
    resources: { tokens: [token], liquidityPools: [], farms: [], stakingPools: [] },
    primaryTokenRefs: [token.ref],
    relatedProjectSlugs: ['melega-dex'],
    deepLinks: {
      swap: `/trade?chain=bsc&inputCurrency=BNB&outputCurrency=${input.address}`,
      liquidity: '/liquidity',
      farms: '/farms',
      pools: '/pools',
    },
  }
}

/** Founder-acceptance featured listings — identities from canonical BSC token list. */
const mm72 = listedBscTokenProject({
  slug: 'mm72',
  displayName: 'MM72',
  symbol: 'MM72',
  address: '0xdF9e1A85dB4f985D5BB5644aD07d9D7EE5673B5E',
  logoUrl: 'https://melega.finance/images/tokens/0xdF9e1A85dB4f985D5BB5644aD07d9D7EE5673B5E.png',
  tagline: 'Listed Melega DEX project token',
  description: 'MM72 is a listed project token on Melega DEX (BNB Smart Chain).',
  sectorTags: ['DeFi'],
})

const eyed = listedBscTokenProject({
  slug: 'eyed',
  displayName: 'EYED',
  symbol: 'EYED',
  address: '0xeDd9f422bC4D8E55c93a4E2fE64615f8dAb27223',
  logoUrl: 'https://melega.finance/images/tokens/0xeDd9f422bC4D8E55c93a4E2fE64615f8dAb27223.png',
  tagline: 'Listed Melega DEX project token',
  description: 'EYED is a listed project token on Melega DEX (BNB Smart Chain).',
  sectorTags: ['DeFi'],
})

const youngDegens = listedBscTokenProject({
  slug: 'young-degens',
  displayName: 'Young Degens',
  symbol: 'YD',
  address: '0x7D1481568c72891bb87A964c3a6E6213Bd73d114',
  logoUrl: 'https://melega.finance/images/tokens/0x7D1481568c72891bb87A964c3a6E6213Bd73d114.png',
  tagline: 'Listed Melega DEX project token',
  description: 'Young Degens (YD) is a listed project token on Melega DEX (BNB Smart Chain).',
  sectorTags: ['Community'],
})

const blion = listedBscTokenProject({
  slug: 'blion',
  displayName: 'BLION',
  symbol: 'BLION',
  address: '0xd1Ff6De8297DB3839DFC3356F020d63a2E72BbD2',
  logoUrl:
    'https://github.com/meleganza/MelegaSwapV2/blob/main/apps/web/public/images/56/tokens/0xd1Ff6De8297DB3839DFC3356F020d63a2E72BbD2.png?raw=true',
  tagline: 'Listed Melega DEX project token',
  description: 'BLION is a listed project token on Melega DEX (BNB Smart Chain).',
  sectorTags: ['Community'],
})

/** Canonical projects — MARCO listed first so token lookups prefer the token project. */
export const STATIC_PROJECTS: StaticProjectRecord[] = [marco, melegaDex, mm72, eyed, youngDegens, blion]
