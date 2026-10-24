import { BNB_QUOTE_TOKENS, BNB_QUOTE_VENUES, BSC_CHAIN_ID, formatUnits } from './bscQuote'

export const PORTFOLIO_CHAIN_ID = BSC_CHAIN_ID
export const MAX_PORTFOLIO_RPC_CALLS = 10
export const PORTFOLIO_TIMEOUT_MS = 1_200
export const LIVE_WITHDRAWAL_LINKS = [
  { label: 'Remove liquidity on the live DEX', href: 'https://www.melega.finance/liquidity-studio?view=remove' },
  { label: 'Farm positions on the live DEX', href: 'https://www.melega.finance/farms?view=my' },
  { label: 'Pool positions on the live DEX', href: 'https://www.melega.finance/pools?view=positions' },
] as const

const BALANCE_OF = '70a08231'

export function isPublicAddress(value: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(value.trim())
}

export function encodeBalanceOf(account: string): string {
  const address = account.toLowerCase().replace(/^0x/, '').padStart(64, '0')
  return `0x${BALANCE_OF}${address}`
}

export function decodeQuantity(data: string | null): string | null {
  if (!data || data === '0x') return null
  if (!/^0x[0-9a-fA-F]+$/.test(data)) return null
  try {
    return BigInt(data).toString()
  } catch {
    return null
  }
}

export interface PortfolioAsset {
  symbol: string
  chainId: 56
  status: 'ok' | 'unavailable'
  raw: string | null
  display: string | null
  usdtQuoteRaw: string | null
  usd: null
}

export interface PortfolioRead {
  ok: boolean
  code?: 'ADDRESS_REJECTED' | 'CHAIN_MISMATCH' | 'QUOTE_TIMEOUT' | 'READ_FAILED'
  chainId: 56
  address: string | null
  executable: false
  custody: false
  walletConnected: false
  lpPositionsSupported: false
  farmPositionsSupported: false
  assets: PortfolioAsset[]
  rpcCalls: number
  durationMs: number
}

export function emptyPortfolio(code: PortfolioRead['code'], rpcCalls: number, started: number): PortfolioRead {
  return {
    ok: false,
    code,
    chainId: 56,
    address: null,
    executable: false,
    custody: false,
    walletConnected: false,
    lpPositionsSupported: false,
    farmPositionsSupported: false,
    assets: [],
    rpcCalls,
    durationMs: Date.now() - started,
  }
}

export function displayAsset(symbol: string, raw: string | null, usdtQuoteRaw: string | null): PortfolioAsset {
  return {
    symbol,
    chainId: 56,
    status: raw === null ? 'unavailable' : 'ok',
    raw,
    display: raw === null ? null : formatUnits(raw, 18),
    usdtQuoteRaw,
    usd: null,
  }
}

export const PORTFOLIO_TOKENS = BNB_QUOTE_TOKENS
export const PORTFOLIO_PRICE_VENUES = BNB_QUOTE_VENUES
