import { bsc, mainnet } from 'wagmi/chains'
import { Chain, configureChains, createClient } from 'wagmi'
import memoize from 'lodash/memoize'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { noopStorage } from '@wagmi/core'
import { BSC_TESTNET_RPC_URLS } from 'config/constants/rpc'
import { BSC_TESTNET_ADDRESSES } from 'config/constants/bscTestnet'

const arbitrum1: Chain = {
  id: 42161,
  name: 'Arbitrum One',
  network: 'arbitrum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    alchemy: { http: ['https://arb-mainnet.g.alchemy.com/v2'], webSocket: ['wss://arb-mainnet.g.alchemy.com/v2'] },
    infura: { http: ['https://arbitrum-mainnet.infura.io/v3'], webSocket: ['wss://arbitrum-mainnet.infura.io/ws/v3'] },
    default: { http: ['https://arbitrum.llamarpc.com'] },
  },
  blockExplorers: {
    etherscan: { name: 'Arbiscan', url: 'https://arbiscan.io' },
    default: { name: 'Arbiscan', url: 'https://arbiscan.io' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 7654707,
    },
  },
}

export const ethereum: Chain = {
  id: 1,
  name: 'Ethereum Chain',
  network: 'ethereum',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.ankr.com/eth'] },
  },
  blockExplorers: {
    etherscan: { name: 'EtherScan', url: 'https://etherscan.io' },
    default: { name: 'EtherScan', url: 'https://etherscan.io/' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 15921452,
    },
  },
}

const bsc1: Chain = {
  id: 56,
  name: 'BNB Smart Chain',
  network: 'bsc',
  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://bsc-rpc.publicnode.com'] },
  },
  blockExplorers: {
    etherscan: { name: 'BscScan', url: 'https://bscscan.com' },
    default: { name: 'BscScan', url: 'https://bscscan.com' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 15921452,
    },
  },
}

export const polygon1: Chain = {
  id: 137,
  name: 'Polygon',
  network: 'matic',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: {
    // alchemy: { http: ['https://polygon-mainnet.g.alchemy.com/v2'], webSocket: ['wss://polygon-mainnet.g.alchemy.com/v2'] },
    // infura: { http: ['https://polygon-mainnet.infura.io/v3'], webSocket: ['wss://polygon-mainnet.infura.io/ws/v3'] },
    // default: { http: ['https://polygon.llamarpc.com'] }
    default: { http: ['https://polygon-bor-rpc.publicnode.com'] },
  },
  blockExplorers: {
    etherscan: { name: 'PolygonScan', url: 'https://polygonscan.com' },
    default: { name: 'PolygonScan', url: 'https://polygonscan.com' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 60101024,
    },
  },
}

export const base: Chain = {
  id: 8453,
  name: 'Base',
  network: 'base',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://base-rpc.publicnode.com'] },
  },
  blockExplorers: {
    etherscan: { name: 'BaseScan', url: 'https://basescan.org' },
    default: { name: 'BaseScan', url: 'https://basescan.org' },
  },
  contracts: {
    multicall3: {
      address: '0x4fe5CBf4658d6Ca76431dD05D2D7aD6BbCD20891',
      blockCreated: 13912277,
    },
  },
}

const bscTestnet: Chain = {
  id: 97,
  name: 'BNB Testnet',
  network: 'bsc-testnet',
  testnet: true,
  nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_BNB_TESTNET_RPC_URL ?? BSC_TESTNET_RPC_URLS[0]] },
  },
  blockExplorers: {
    etherscan: { name: 'BscScan Testnet', url: BSC_TESTNET_ADDRESSES.explorer },
    default: { name: 'BscScan Testnet', url: BSC_TESTNET_ADDRESSES.explorer },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 17422483,
    },
  },
}

/** Avalanche C-Chain — required for wallet chain detection + Founder Router deploy (PREPARING product). */
const avalanche1: Chain = {
  id: 43114,
  name: 'Avalanche C-Chain',
  network: 'avalanche',
  nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://api.avax.network/ext/bc/C/rpc'] },
  },
  blockExplorers: {
    etherscan: { name: 'SnowTrace', url: 'https://snowtrace.io' },
    default: { name: 'SnowTrace', url: 'https://snowtrace.io' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 11907934,
    },
  },
}

// const CHAINS = [bsc1, mainnet, polygon, base]
const CHAINS = [bsc1, bscTestnet, base, polygon1, ethereum, arbitrum1, avalanche1]

const getNodeRealUrl = (networkName: string) => {
  let host = null

  switch (networkName) {
    case 'homestead':
      if (process.env.NEXT_PUBLIC_NODE_REAL_API_ETH) {
        host = `eth-mainnet.nodereal.io/v1/${process.env.NEXT_PUBLIC_NODE_REAL_API_ETH}`
      }
      break
    case 'goerli':
      if (process.env.NEXT_PUBLIC_NODE_REAL_API_GOERLI) {
        host = `eth-goerli.nodereal.io/v1/${process.env.NEXT_PUBLIC_NODE_REAL_API_GOERLI}`
      }
      break
    default:
      host = null
  }

  if (!host) {
    return null
  }

  const url = `https://${host}`
  return {
    http: url,
    webSocket: url.replace(/^http/i, 'wss').replace('.nodereal.io/v1', '.nodereal.io/ws/v1'),
  }
}

export const { provider, chains } = configureChains(CHAINS, [
  jsonRpcProvider({
    rpc: (chain) => {
      if (!!process.env.NEXT_PUBLIC_NODE_PRODUCTION && chain.id === bsc.id) {
        return { http: process.env.NEXT_PUBLIC_NODE_PRODUCTION }
      }
      if (process.env.NODE_ENV === 'test' && chain.id === mainnet.id) {
        return { http: 'https://cloudflare-eth.com' }
      }

      return getNodeRealUrl(chain.network) || { http: chain.rpcUrls.default.http[0] }
    },
  }),
])

export const injectedConnector = new InjectedConnector({
  chains,
  options: {
    shimDisconnect: false,
    // A supported chain change is a session update, not a disconnect.
    // Disconnecting here made the header lose the wallet while navigating.
    shimChainChangedDisconnect: false,
  },
})

export const metaMaskConnector = new MetaMaskConnector({
  chains,
  options: {
    shimDisconnect: false,
    shimChainChangedDisconnect: false,
  },
})

export const client = createClient({
  autoConnect: false,
  provider,
  storage: typeof window === 'undefined' ? noopStorage : undefined,
  // Keep the synchronous boot path limited to injected wallets. Advanced
  // connector SDKs are loaded only for wallet intent or session restoration.
  connectors: [metaMaskConnector, injectedConnector],
})

type WalletConnector = (typeof client.connectors)[number]

const CONNECTOR_ORDER = [
  'safe',
  'metaMask',
  'injected',
  'coinbaseWallet',
  'walletConnect',
  'bsc',
  'blocto',
  'ledger',
  'trustWallet',
] as const

const connectorRegistry = new Map<string, WalletConnector>([
  [metaMaskConnector.id, metaMaskConnector],
  [injectedConnector.id, injectedConnector],
])
const connectorLoadPromises = new Map<string, Promise<WalletConnector>>()

function installConnectors(connectors: typeof client.connectors) {
  client.config.connectors = connectors
  client.setState((state) => ({ ...state, connectors }))
}

function installLoadedConnector(connector: WalletConnector): WalletConnector {
  connectorRegistry.set(connector.id, connector)
  const ordered = CONNECTOR_ORDER.flatMap((id) => {
    const registered = connectorRegistry.get(id)
    return registered ? [registered] : []
  })
  installConnectors(ordered)
  return connector
}

const connectorLoaders: Record<string, () => Promise<WalletConnector>> = {
  coinbaseWallet: () =>
    import('wagmi/connectors/coinbaseWallet').then(
      ({ CoinbaseWalletConnector }) =>
        new CoinbaseWalletConnector({
          chains,
          options: {
            appName: 'Melega DEX',
            appLogoUrl: 'https://melega.finance/main.jpg',
          },
        }),
    ),
  walletConnect: () =>
    import('wagmi/connectors/walletConnect').then(
      ({ WalletConnectConnector }) =>
        new WalletConnectConnector({
          chains,
          options: { qrcode: true },
        }),
    ),
  bsc: () =>
    import('@pancakeswap/wagmi/connectors/binanceWallet').then(
      ({ BinanceWalletConnector }) => new BinanceWalletConnector({ chains }),
    ),
  blocto: () =>
    import('@pancakeswap/wagmi/connectors/blocto').then(
      ({ BloctoConnector }) =>
        new BloctoConnector({
          chains,
          options: {
            defaultChainId: 56,
            appId: 'e2f2f0cd-3ceb-4dec-b293-bb555f2ed5af',
          },
        }),
    ),
  ledger: () => import('wagmi/connectors/ledger').then(({ LedgerConnector }) => new LedgerConnector({ chains })),
  trustWallet: () =>
    import('@pancakeswap/wagmi/connectors/trustWallet').then(
      ({ TrustWalletConnector }) =>
        new TrustWalletConnector({
          chains,
          options: {
            shimDisconnect: false,
            shimChainChangedDisconnect: false,
          },
        }),
    ),
  safe: () => import('./safeConnector').then(({ SafeConnector }) => new SafeConnector({ chains })),
}

/**
 * Load exactly one wallet SDK after that wallet is selected (or its persisted
 * session needs restoration). The chooser itself never downloads every SDK.
 */
export function loadWalletConnector(connectorId: string): Promise<WalletConnector | undefined> {
  const installed = connectorRegistry.get(connectorId)
  if (installed) return Promise.resolve(installed)

  const loader = connectorLoaders[connectorId]
  if (!loader) return Promise.resolve(undefined)

  const inFlight = connectorLoadPromises.get(connectorId)
  if (inFlight) return inFlight

  const promise = loader()
    .then(installLoadedConnector)
    .catch((error) => {
      connectorLoadPromises.delete(connectorId)
      throw error
    })
  connectorLoadPromises.set(connectorId, promise)
  return promise
}

/** Compatibility helper for diagnostics; customer flows use loadWalletConnector. */
export async function loadExtendedWalletConnectors(): Promise<void> {
  await Promise.all(Object.keys(connectorLoaders).map((connectorId) => loadWalletConnector(connectorId)))
}

export function getPersistedWalletConnectorId(): string | null {
  if (typeof window === 'undefined') return null
  if (window.parent !== window) return 'safe'
  const connectorId = client.storage?.getItem('wallet')
  return typeof connectorId === 'string' && connectorId ? connectorId : null
}

/** Restore only the connector SDK used by a persisted/embedded wallet session. */
export function requiresExtendedWalletSession(): boolean {
  const connectorId = getPersistedWalletConnectorId()
  return Boolean(connectorId && connectorId !== 'metaMask' && connectorId !== 'injected')
}

export const CHAIN_IDS = chains.map((c) => c.id)

export const isChainSupported = memoize((chainId: number) => CHAIN_IDS.includes(chainId))
export const isChainTestnet = memoize((chainId: number) => chains.find((c) => c.id === chainId)?.testnet)
