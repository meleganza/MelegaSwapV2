import { PROJECT_REGISTRY_AS_OF, PROJECT_REGISTRY_DISCLAIMER } from './constants'
import { StaticProjectRecord } from './types'

const melegaDex: StaticProjectRecord = {
  upi: 'upi://melega/project/melega-dex@1',
  slug: 'melega-dex',
  displayName: 'Melega DEX',
  tagline: 'AI-native liquidity surface of Melega AI | KIRI Civilization',
  description:
    'Melega DEX is the decentralized economic execution layer for swap, liquidity, farms, and pools across BSC, Ethereum, Polygon, and Base. MARCO is the native coordination token across the platform.',
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
    { type: 'twitter', url: 'https://twitter.com/meleganews' },
  ],
  resources: {
    tokens: [
      {
        chainId: 56,
        address: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
        symbol: 'MARCO',
        ref: 'token://56/0x963556de0eb8138E97A85F0A86eE0acD159D210b',
      },
      {
        chainId: 1,
        address: '0x5911Dc98a9E1A4FfFD802C3A57cdA6bbd26Cdb76',
        symbol: 'MARCO',
        ref: 'token://1/0x5911Dc98a9E1A4FfFD802C3A57cdA6bbd26Cdb76',
      },
      {
        chainId: 137,
        address: '0xD3e28c74177B812d1543A406aD1A97ee3C398AC2',
        symbol: 'MARCO',
        ref: 'token://137/0xD3e28c74177B812d1543A406aD1A97ee3C398AC2',
      },
      {
        chainId: 8453,
        address: '0x56e46bE7714550A4Cb7bD0863BaB2680c099d8d7',
        symbol: 'MARCO',
        ref: 'token://8453/0x56e46bE7714550A4Cb7bD0863BaB2680c099d8d7',
      },
    ],
    liquidityPools: [],
    farms: [],
    stakingPools: [],
  },
  capabilities: {
    tradable: { status: 'live', notes: 'MARCO on legacy default token lists' },
    liquidity: { status: 'live', notes: 'Platform liquidity routes via /liquidity' },
    farm: { status: 'live', notes: 'Legacy MasterChef farms via /farms' },
    pool: { status: 'live', notes: 'MARCO staking pools via /pools' },
    lock: { status: 'planned', notes: 'Lock Center indexing — Phase 2' },
    vesting: { status: 'planned', notes: 'Vesting disclosures — Phase 2' },
    launch: { status: 'partial', notes: 'ILO route /ilo on BSC' },
    smartdrop: { status: 'planned', notes: 'SmartDrop campaigns — Phase 2' },
    radar: { status: 'planned', notes: 'Radar incident feed — Phase 2' },
    space: { status: 'partial', notes: 'Community link only; bind not live' },
    labs: { status: 'planned', notes: 'Labs experiments — Phase 2' },
    aiReport: { status: 'planned', notes: 'AI verification pipeline not live in MVP' },
    machineManifest: { status: 'live', notes: 'Static JSON at /registry/projects/melega-dex.json' },
    treasuryCompatible: { status: 'planned', notes: 'MARCO fee SKUs — Treasury Runtime Phase 2' },
  },
  primaryTokenRefs: [
    'token://56/0x963556de0eb8138E97A85F0A86eE0acD159D210b',
    'token://1/0x5911Dc98a9E1A4FfFD802C3A57cdA6bbd26Cdb76',
    'token://137/0xD3e28c74177B812d1543A406aD1A97ee3C398AC2',
    'token://8453/0x56e46bE7714550A4Cb7bD0863BaB2680c099d8d7',
  ],
  deepLinks: {
    swap: '/swap',
    liquidity: '/liquidity',
    farms: '/farms',
    pools: '/pools',
    buyMarco: '/swap?outputCurrency=0x963556de0eb8138E97A85F0A86eE0acD159D210b',
  },
  disclaimer: PROJECT_REGISTRY_DISCLAIMER,
  asOf: PROJECT_REGISTRY_AS_OF,
}

export const STATIC_PROJECTS: StaticProjectRecord[] = [melegaDex]
