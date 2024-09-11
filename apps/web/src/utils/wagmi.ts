import { BinanceWalletConnector } from '@pancakeswap/wagmi/connectors/binanceWallet'
import { BloctoConnector } from '@pancakeswap/wagmi/connectors/blocto'
import { TrustWalletConnector } from '@pancakeswap/wagmi/connectors/trustWallet'
import { bsc, mainnet, arbitrum, polygon, optimism, avalanche, fantom } from 'wagmi/chains'
import { Chain, configureChains, createClient } from 'wagmi'
import memoize from 'lodash/memoize'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { LedgerConnector } from 'wagmi/connectors/ledger'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { SafeConnector } from './safeConnector'

const arbitrum1 : Chain = {
  id: 42161,
  name: 'Arbitrum One',
  network: 'arbitrum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    alchemy: { http: ['https://arb-mainnet.g.alchemy.com/v2'], webSocket: ['wss://arb-mainnet.g.alchemy.com/v2'] },
    infura: { http: ['https://arbitrum-mainnet.infura.io/v3'], webSocket: ['wss://arbitrum-mainnet.infura.io/ws/v3'] },
    default: { http: ['https://arbitrum.llamarpc.com'] }
  },
  blockExplorers: {
    etherscan: { name: 'Arbiscan', url: 'https://arbiscan.io' },
    default: { name: 'Arbiscan', url: 'https://arbiscan.io' }
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 7654707
    }
  }
}

export const ethereum : Chain = {
  id: 1,
  name: 'Ethereum Chain',
  network: 'ethereum',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.ankr.com/eth'] }
  },
  blockExplorers: {
    etherscan: { name: 'EtherScan', url: 'https://etherscan.io' },
    default: { name: 'EtherScan', url: 'https://etherscan.io/' }
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 15921452      
    }
  }
}

const bsc1 : Chain = {
  id: 56,
  name: 'BNB Smart Chain',
  network: 'bsc',
  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://bsc-rpc.publicnode.com'] }
  },
  blockExplorers: {
    etherscan: { name: 'BscScan', url: 'https://bscscan.com' },
    default: { name: 'BscScan', url: 'https://bscscan.com' }
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 15921452      
    }
  }
}

export const polygon1 : Chain = {
  id: 137,
  name: 'Polygon',
  network: 'matic',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: {
    // alchemy: { http: ['https://polygon-mainnet.g.alchemy.com/v2'], webSocket: ['wss://polygon-mainnet.g.alchemy.com/v2'] },
    // infura: { http: ['https://polygon-mainnet.infura.io/v3'], webSocket: ['wss://polygon-mainnet.infura.io/ws/v3'] },
    // default: { http: ['https://polygon.llamarpc.com'] }
    default: { http: ['https://polygon-bor-rpc.publicnode.com'] }
  },
  blockExplorers: {
    etherscan: { name: 'PolygonScan', url: 'https://polygonscan.com' },
    default: { name: 'PolygonScan', url: 'https://polygonscan.com' }
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 60101024
    }
  }
}

const zksync : Chain = {
  id: 324,
  name: "zkSync Era",
  network: "zksync",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: { http: ["https://mainnet.era.zksync.io"] }
  },
  blockExplorers: {
    etherscan: { name: "zkSync Era Explorer", url: "https://era.zksync.network" },
    default: { name: "zkSync Era Explorer", url: "https://era.zksync.network" }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 6884829
    }
  }
};

const pulsechain : Chain = {
  id: 369,
  name: "PulseChain",
  network: "pulse",
  nativeCurrency: {
    decimals: 18,
    name: "Pulse",
    symbol: "PLS"
  },
  rpcUrls: {
    default: { http: ["https://rpc.pulsechain.com"] }
  },
  blockExplorers: {
    etherscan: { name: "PulseChain Explorer", url: "https://scan.pulsehotlist.com/#" },
    default: { name: "PulseChain Explorer", url: "https://scan.pulsehotlist.com/#" }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 14353601
    }
  }
};

const cronos : Chain = {
  id: 25,
  name: "Cronos",
  network: "cronos",
  nativeCurrency: {
    decimals: 18,
    name: "Cronos",
    symbol: "CRO"
  },
  rpcUrls: {
    default: { http: ["https://evm.cronos.org"] }
  },
  blockExplorers: {
    etherscan: { name: "CronoScan", url: "https://cronoscan.com" },
    default: { name: "CronoScan", url: "https://cronoscan.com" }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 1963112
    }
  }
};

export const base : Chain = {
  id: 8453,
  name: "Base",
  network: "base",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: { http: ["https://base-rpc.publicnode.com"] }
  },
  blockExplorers: {
    etherscan: { name: "BaseScan", url: "https://basescan.org" },
    default: { name: "BaseScan", url: "https://basescan.org" }
  },
  contracts: {
    multicall3: {
      address: "0x4fe5CBf4658d6Ca76431dD05D2D7aD6BbCD20891",
      blockCreated: 13912277
    }
  }
};

// const CHAINS = [bsc1, mainnet, polygon, base]
const CHAINS = [bsc1, base, polygon1, ethereum]

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
    shimChainChangedDisconnect: true,
  },
})

export const coinbaseConnector = new CoinbaseWalletConnector({
  chains,
  options: {
    appName: 'PancakeSwap',
    appLogoUrl: 'https://pancakeswap.com/logo.png',
  },
})

export const walletConnectConnector = new WalletConnectConnector({
  chains,
  options: {
    qrcode: true,
  },
})

export const walletConnectNoQrCodeConnector = new WalletConnectConnector({
  chains,
  options: {
    qrcode: false,
  },
})

export const metaMaskConnector = new MetaMaskConnector({
  chains,
  options: {
    shimDisconnect: false,
    shimChainChangedDisconnect: true,
  },
})

const bloctoConnector = new BloctoConnector({
  chains,
  options: {
    defaultChainId: 56,
    appId: 'e2f2f0cd-3ceb-4dec-b293-bb555f2ed5af',
  },
})

const ledgerConnector = new LedgerConnector({
  chains,
})

export const bscConnector = new BinanceWalletConnector({ chains })

export const trustWalletConnector = new TrustWalletConnector({
  chains,
  options: {
    shimDisconnect: false,
    shimChainChangedDisconnect: true,
  },
})

export const client = createClient({
  autoConnect: false,
  provider,
  connectors: [
    new SafeConnector({ chains }),
    metaMaskConnector,
    injectedConnector,
    coinbaseConnector,
    // walletConnectConnector,
    bscConnector,
    bloctoConnector,
    ledgerConnector,
    trustWalletConnector,
  ],
})

export const CHAIN_IDS = chains.map((c) => c.id)

export const isChainSupported = memoize((chainId: number) => CHAIN_IDS.includes(chainId))
export const isChainTestnet = memoize((chainId: number) => chains.find((c) => c.id === chainId)?.testnet)
