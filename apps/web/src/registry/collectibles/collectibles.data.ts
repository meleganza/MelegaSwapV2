import {
  buildCollectibleId,
  COLLECTIBLES_REGISTRY_AS_OF,
  COLLECTIBLES_REGISTRY_DISCLAIMER,
  DETECTED_BABYMARCO_GENESIS_NFT_BSC,
  DETECTED_BABYMARCO_IMAGE_PATTERN,
  DETECTED_BABYMARCO_PINATA_GATEWAY,
  DETECTED_NFT_ROUTES,
} from './collectible-constants'
import { StaticCollectibleRecord } from './collectible-types'

export const STATIC_COLLECTIBLE_RECORDS: StaticCollectibleRecord[] = [
  {
    slug: 'babymarco-genesis',
    collectibleId: buildCollectibleId('babymarco-genesis'),
    displayName: 'BabyMarco Genesis',
    description:
      'Legacy ecosystem mascot collectible. Existing DNFT collection on BNB Chain — reframed as a Civilization Collectible, not generic NFT minting. Historical mint, wallet, and market surfaces remain at their original routes.',
    status: 'live_or_legacy_existing',
    category: 'mascot_ecosystem',
    role: 'Human engagement and ecosystem identity — priority airdrop participation and DAO voting rights per legacy marketing copy.',
    contract: {
      indexed: true,
      chainId: 56,
      address: DETECTED_BABYMARCO_GENESIS_NFT_BSC,
      label: 'DNFT (Nft) — detected from contracts.ts',
      notes: 'Contract reference only — minting logic untouched. BSC mainnet address from legacy config.',
    },
    metadata: {
      status: 'pinata_ipfs',
      gateway: DETECTED_BABYMARCO_PINATA_GATEWAY,
      ipfsCid: 'QmRqb3TUnbxjLPzJqhgKkzpysfFmdsvSdiUBqVYFCKSYxb',
      imagePattern: DETECTED_BABYMARCO_IMAGE_PATTERN,
      tokenUriSource: 'on_chain',
      notes:
        'Legacy UI uses Pinata gateway for PNG previews; JSON metadata fetched from on-chain tokenURI. No fake metadata URIs in this read model.',
    },
    supply: {
      mode: 'existing_collection',
      statedMaxSupply: 1000,
      supplySource: 'ui_marketing_copy',
      mintedCountIndexed: false,
      notes:
        '1,000-piece cap stated on legacy /nft/ marketing copy. Minted count not indexed in this read model — no fake totals.',
    },
    mint: {
      status: 'indexed',
      route: DETECTED_NFT_ROUTES.mint,
      chainLabel: 'BNB Chain',
      notes: 'Real mint via legacy /nft/ page (BSC only). This registry does not execute mints.',
    },
    relatedRoutes: [DETECTED_NFT_ROUTES.mint, DETECTED_NFT_ROUTES.wallet, DETECTED_NFT_ROUTES.market],
    warnings: [
      'Legacy mint surface — not a new launch mechanism',
      'No ownership or mint counts indexed here',
      'Mint cost and quota are on-chain dynamic values on /nft/',
    ],
    links: {
      detail: '/collectibles/babymarco-genesis',
      mint: DETECTED_NFT_ROUTES.mint,
      wallet: DETECTED_NFT_ROUTES.wallet,
      market: DETECTED_NFT_ROUTES.market,
      external: 'https://www.melegaswap.finance/babymarco',
      collectiblesRegistry: '/collectibles',
    },
    disclaimer: COLLECTIBLES_REGISTRY_DISCLAIMER,
    dataSource: 'collectibles-registry-static-audit',
    asOf: COLLECTIBLES_REGISTRY_AS_OF,
    mvpStatic: true,
  },
  {
    slug: 'masterm-identity',
    collectibleId: buildCollectibleId('masterm-identity'),
    displayName: 'MasterM Identity',
    description:
      'Planned civilization identity collectible linked to the MasterM ecosystem. MXMX fungible token exists on Base and BSC — no NFT collectible contract indexed in this repository.',
    status: 'planned_or_external',
    category: 'identity',
    role: 'Civilization identity and future linked collectible — external MasterM surface, not an active DEX mint.',
    contract: {
      indexed: false,
      notes:
        'No NFT contract detected for MasterM in repo. MXMX token references only — not a collectible mint surface.',
    },
    metadata: {
      status: 'not_indexed',
      notes: 'Metadata pipeline not indexed. External references: masterm.world, linktr.ee/mastermworld.',
    },
    supply: {
      mode: 'not_indexed',
      mintedCountIndexed: false,
      notes: 'No supply figures — planned or external identity collectible.',
    },
    mint: {
      status: 'not_indexed',
      notes: 'No mint route in this DEX build. External ecosystem only.',
    },
    relatedRoutes: [],
    warnings: [
      'No fake contract address',
      'Not an active mint surface on MelegaSwap',
      'Identity collectible — planned linkage to civilization layer',
    ],
    links: {
      detail: '/collectibles/masterm-identity',
      external: 'https://www.masterm.world/',
      collectiblesRegistry: '/collectibles',
    },
    disclaimer: COLLECTIBLES_REGISTRY_DISCLAIMER,
    dataSource: 'collectibles-registry-static',
    asOf: COLLECTIBLES_REGISTRY_AS_OF,
    mvpStatic: true,
  },
  {
    slug: 'achievement-collectibles',
    collectibleId: buildCollectibleId('achievement-collectibles'),
    displayName: 'Future Achievement & Participation Collectibles',
    description:
      'Planned proof-of-participation and achievement collectibles for economic activity signals. Includes future AI-agent identity collectibles as a civilization participation layer — not indexed in this build.',
    status: 'planned',
    category: 'participation_proof',
    role: 'Economic participation signals, achievement proofs, and future AI-agent identity bindings.',
    contract: {
      indexed: false,
      notes: 'No contracts deployed or indexed. Phase 2 civilization collectible layer.',
    },
    metadata: {
      status: 'not_indexed',
      notes: 'Metadata standard and storage TBD — no fake IPFS CIDs.',
    },
    supply: {
      mode: 'planned_collection',
      mintedCountIndexed: false,
      notes: 'Supply policy not defined in this read model.',
    },
    mint: {
      status: 'not_indexed',
      notes: 'No mint route — planned collectible class.',
    },
    relatedRoutes: ['/workspace', '/launch'],
    warnings: [
      'Planned only — no mint buttons',
      'Will bind to workspace economic activity when indexed',
      'AI-agent identity collectibles are future scope',
    ],
    links: {
      detail: '/collectibles/achievement-collectibles',
      collectiblesRegistry: '/collectibles',
    },
    disclaimer: COLLECTIBLES_REGISTRY_DISCLAIMER,
    dataSource: 'collectibles-registry-static',
    asOf: COLLECTIBLES_REGISTRY_AS_OF,
    mvpStatic: true,
  },
]
