/**
 * Canonical Melega DEX chain registry — single frontend source of truth.
 * Missing addresses ⇒ capability stays disabled. No cross-chain address fallbacks.
 */
import { ChainId } from '@pancakeswap/sdk'

export type MelegaChainStatus = 'LIVE' | 'PREPARING' | 'DISABLED'

export type MelegaChainCapabilities = {
  swap: boolean
  farms: boolean
  pools: boolean
  tokens: boolean
  liquidityBuilder: boolean
}

export type MelegaChainContracts = {
  factory: string | null
  router: string | null
  multicall: string | null
  masterBuilder: string | null
  vault: string | null
  poolDeploymentFactory: string | null
}

export type MelegaChainNative = {
  name: string
  symbol: string
  decimals: number
}

export type MelegaChainRecord = {
  chainId: number
  name: string
  shortLabel: string
  nativeCurrency: MelegaChainNative
  explorer: string
  logo: string
  status: MelegaChainStatus
  capabilities: MelegaChainCapabilities
  contracts: MelegaChainContracts
  notes?: string[]
}

/** Canonical Melega V2 Router on Base — must match packages/smart-router + web exchange.ts */
export const MELEGA_BASE_ROUTER = '0x1B30D21354a082EeBC66c4C5E56320759f7994e5'
export const MELEGA_BASE_FACTORY = '0x78fA7Fa39CF6544DD9768A75d8Ad8C45854aE530'
export const MELEGA_BASE_MULTICALL = '0x4fe5CBf4658d6Ca76431dD05D2D7aD6BbCD20891'
export const MELEGA_BASE_MASTER_BUILDER = '0x149EE9245E5eD52a89Ea777d19AD3A5D87873680'
export const MELEGA_BASE_VAULT = '0xFF8EBf8edf1C533A02d066f852788773BdCD631C'
export const MELEGA_BASE_POOL_DEPLOY = '0x9f421c4DEDD3B5C24EFff0FCB5AD2BEa0a577E83'

export const MELEGA_BNB_ROUTER = '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3'
export const MELEGA_BNB_FACTORY = '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C'

/** Canonical Melega V2 on Polygon — router.factory() verified on-chain */
export const MELEGA_POLYGON_ROUTER = '0x64935e2A3d8F3840445fB2DdF37FBBfc3b292EFe'
export const MELEGA_POLYGON_FACTORY = '0x2541DBEa199a22501D75EA141627776Bd4EefC80'
export const MELEGA_POLYGON_MASTER_BUILDER = '0x130d2BD998767B6091352dd71fEABa4460846D94'
export const MELEGA_POLYGON_VAULT = '0xd70bff1e6354c49adff9b0c9608364dcd2d5deb6'

export const MELEGA_ETH_ROUTER = '0xFF8EBf8edf1C533A02d066f852788773BdCD631C'
export const MELEGA_ETH_FACTORY = '0x149EE9245E5eD52a89Ea777d19AD3A5D87873680'
export const MELEGA_ETH_MASTER_BUILDER = '0x585364c747CaF6cF6441656F803796230fb1d61c'
export const MELEGA_ETH_VAULT = '0x4C11221D39FcE56D12E46deC799F73029859B974'

/**
 * Product statuses — Multichain Execution Program.
 * LIVE: BNB, Base, Polygon (+ Ethereum when activated). PREPARING: remaining chains.
 */
export const MELEGA_CHAIN_REGISTRY: readonly MelegaChainRecord[] = [
  {
    chainId: ChainId.BSC,
    name: 'BNB Smart Chain',
    shortLabel: 'BNB',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    explorer: 'https://bscscan.com',
    logo: '/images/chains/56.png',
    status: 'LIVE',
    capabilities: {
      swap: true,
      farms: true,
      pools: true,
      tokens: true,
      liquidityBuilder: true,
    },
    contracts: {
      factory: '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C',
      router: MELEGA_BNB_ROUTER,
      multicall: '0xcA11bde05977b3631167028862bE2a173976CA11',
      masterBuilder: '0x41D5487836452d23f2c467070244E5842B412794',
      vault: '0xb2d57B1A40E61AAb3F88361228E1188E0fB6A21C',
      poolDeploymentFactory: null,
    },
  },
  {
    chainId: ChainId.BASE,
    name: 'Base',
    shortLabel: 'Base',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    explorer: 'https://basescan.org',
    logo: '/images/chains/8453.png',
    status: 'LIVE',
    capabilities: {
      swap: true,
      farms: true,
      pools: true,
      tokens: true,
      liquidityBuilder: false,
    },
    contracts: {
      factory: MELEGA_BASE_FACTORY,
      router: MELEGA_BASE_ROUTER,
      multicall: MELEGA_BASE_MULTICALL,
      masterBuilder: MELEGA_BASE_MASTER_BUILDER,
      vault: MELEGA_BASE_VAULT,
      poolDeploymentFactory: MELEGA_BASE_POOL_DEPLOY,
    },
    notes: [
      'Liquidity Builder remains BNB-only (BETA).',
      'Smart Swap fee settles as native ETH to MELEGA TREASURY (same EOA; 25% of gas unchanged).',
      'Melega Base liquidity only — no multi-DEX claims.',
    ],
  },
  {
    chainId: ChainId.POLYGON,
    name: 'Polygon',
    shortLabel: 'Polygon',
    nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
    explorer: 'https://polygonscan.com',
    logo: '/images/chains/137.png',
    status: 'LIVE',
    capabilities: {
      swap: true,
      farms: true,
      pools: true,
      tokens: true,
      liquidityBuilder: false,
    },
    contracts: {
      factory: MELEGA_POLYGON_FACTORY,
      router: MELEGA_POLYGON_ROUTER,
      multicall: '0xcA11bde05977b3631167028862bE2a173976CA11',
      masterBuilder: MELEGA_POLYGON_MASTER_BUILDER,
      vault: MELEGA_POLYGON_VAULT,
      poolDeploymentFactory: null,
    },
    notes: [
      'Liquidity Builder remains BNB-only (BETA).',
      'Smart Swap fee settles as native POL to MELEGA TREASURY (same EOA; 25% of gas unchanged).',
      'Router SSOT: web exchange + smart-router package + registry (not stale 0x3BC722…).',
    ],
  },
  {
    chainId: ChainId.ETHEREUM,
    name: 'Ethereum',
    shortLabel: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    explorer: 'https://etherscan.io',
    logo: '/images/chains/1.png',
    status: 'LIVE',
    capabilities: {
      swap: true,
      farms: true,
      pools: true,
      tokens: true,
      liquidityBuilder: false,
    },
    contracts: {
      factory: MELEGA_ETH_FACTORY,
      router: MELEGA_ETH_ROUTER,
      multicall: '0xcA11bde05977b3631167028862bE2a173976CA11',
      masterBuilder: MELEGA_ETH_MASTER_BUILDER,
      vault: MELEGA_ETH_VAULT,
      poolDeploymentFactory: null,
    },
    notes: [
      'Liquidity Builder remains BNB-only (BETA).',
      'Smart Swap fee settles as native ETH to MELEGA TREASURY (same EOA; 25% of gas unchanged).',
      'Router.factory() verified against Melega ETH Factory on-chain.',
    ],
  },
  {
    chainId: ChainId.ARBITRUM,
    name: 'Arbitrum One',
    shortLabel: 'Arbitrum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    explorer: 'https://arbiscan.io',
    logo: '/images/chains/42161.png',
    status: 'PREPARING',
    capabilities: {
      swap: false,
      farms: false,
      pools: false,
      tokens: false,
      liquidityBuilder: false,
    },
    contracts: {
      factory: null,
      router: null,
      multicall: '0xcA11bde05977b3631167028862bE2a173976CA11',
      masterBuilder: '0x0Ac09AbdC688fd67863bf0f62DD0e243dbdf6894',
      vault: null,
      poolDeploymentFactory: null,
    },
    notes: [
      'MasterChef present on-chain; Factory + Router canonical addresses required from Founder before LIVE.',
      'Stale router 0x3BC722… has no bytecode on Arbitrum.',
    ],
  },
  {
    chainId: 43114,
    name: 'Avalanche',
    shortLabel: 'Avalanche',
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
    explorer: 'https://snowtrace.io',
    logo: '/images/chains/43114.png',
    status: 'PREPARING',
    capabilities: {
      swap: false,
      farms: false,
      pools: false,
      tokens: false,
      liquidityBuilder: false,
    },
    contracts: {
      factory: null,
      router: null,
      multicall: null,
      masterBuilder: null,
      vault: null,
      poolDeploymentFactory: null,
    },
    notes: ['PREPARING / not LIVE — Coming soon. No half-enabled switch.'],
  },
] as const

const BY_ID = new Map(MELEGA_CHAIN_REGISTRY.map((c) => [c.chainId, c]))

export function getMelegaChain(chainId: number | null | undefined): MelegaChainRecord | undefined {
  if (chainId == null) return undefined
  return BY_ID.get(chainId)
}

export function isMelegaChainLive(chainId: number): boolean {
  return getMelegaChain(chainId)?.status === 'LIVE'
}

export function isMelegaCapabilityEnabled(
  chainId: number,
  capability: keyof MelegaChainCapabilities,
): boolean {
  const row = getMelegaChain(chainId)
  return Boolean(row && row.status === 'LIVE' && row.capabilities[capability])
}

/** Chains users may switch into (fully LIVE only). */
export function getMelegaLiveSwitcherChainIds(): readonly number[] {
  return MELEGA_CHAIN_REGISTRY.filter((c) => c.status === 'LIVE').map((c) => c.chainId)
}

/** PREPARING rows shown as disabled Coming soon entries. */
export function getMelegaPreparingChains(): readonly MelegaChainRecord[] {
  return MELEGA_CHAIN_REGISTRY.filter((c) => c.status === 'PREPARING')
}

export function getMelegaRouterAddress(chainId: number): string | null {
  const addr = getMelegaChain(chainId)?.contracts.router
  return addr && addr.length > 0 ? addr : null
}

export function getMelegaFactoryAddress(chainId: number): string | null {
  const addr = getMelegaChain(chainId)?.contracts.factory
  return addr && addr.length > 0 ? addr : null
}

export function requireMelegaContract(
  chainId: number,
  key: keyof MelegaChainContracts,
): string {
  const addr = getMelegaChain(chainId)?.contracts[key]
  if (!addr) {
    throw new Error(`Melega chain ${chainId}: contract ${key} missing — capability disabled`)
  }
  return addr
}
