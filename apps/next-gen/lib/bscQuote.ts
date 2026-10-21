/**
 * BNB read-only quote rules. The AMM math stays on the certified routers.
 * Addresses are copied from the cited sources so this app does not import the live DEX.
 */

export const BSC_CHAIN_ID = 56
export const STALE_QUOTE_MS = 15_000
export const QUOTE_TIMEOUT_MS = 1_200
export const MAX_QUOTE_RPC_CALLS = 5
export const DEFAULT_BSC_READONLY_RPC = 'https://bsc-dataseed.bnbchain.org'

export const BNB_QUOTE_TOKENS = [
  {
    symbol: 'WBNB',
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    decimals: 18,
  },
  {
    symbol: 'MARCO',
    address: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
    decimals: 18,
  },
  {
    symbol: 'USDT',
    address: '0x55d398326f99059fF775485246999027B3197955',
    decimals: 18,
  },
  {
    symbol: 'USDC',
    address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    decimals: 18,
  },
] as const

export type BnbQuoteSymbol = (typeof BNB_QUOTE_TOKENS)[number]['symbol']

/** Certified venues on chain 56. Pancake is quote-only. Melega is the supported venue. */
export const BNB_QUOTE_VENUES = [
  {
    id: 'melega-dex',
    label: 'Melega DEX',
    router: '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3',
  },
  {
    id: 'pancakeswap',
    label: 'PancakeSwap',
    router: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
  },
] as const

const WBNB = BNB_QUOTE_TOKENS[0].address
const GET_AMOUNTS_OUT = 'd06ca61f'

export interface BnbQuoteRequest {
  chainId?: number
  sell?: string
  buy?: string
  amount?: string
}

export type QuoteFailure = 'CHAIN_MISMATCH' | 'PAIR_REJECTED' | 'QUOTE_TIMEOUT' | 'QUOTE_UNAVAILABLE'

export interface FactualBnbQuote {
  ok: true
  chainId: 56
  kind: 'FACTUAL'
  executable: false
  feeCollected: false
  venueId: (typeof BNB_QUOTE_VENUES)[number]['id']
  venueLabel: string
  router: string
  sell: BnbQuoteSymbol
  buy: BnbQuoteSymbol
  amountInRaw: string
  amountOutRaw: string
  path: string[]
  priceImpactPercent: null
  gasUnits: null
  quotedAt: string
  staleAfterMs: number
  rpcCalls: number
  durationMs: number
}

export interface FailedBnbQuote {
  ok: false
  code: QuoteFailure
  executable: false
  feeCollected: false
  priceImpactPercent: null
  gasUnits: null
  rpcCalls: number
  durationMs: number
}

export type BnbQuoteResult = FactualBnbQuote | FailedBnbQuote

export function tokenBySymbol(symbol: string): (typeof BNB_QUOTE_TOKENS)[number] | null {
  return BNB_QUOTE_TOKENS.find((token) => token.symbol === symbol) ?? null
}

export function parseDecimalAmount(amount: string, decimals: number): string | null {
  const trimmed = amount.trim()
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null
  const [whole, fraction = ''] = trimmed.split('.')
  if (fraction.length > decimals) return null
  if (whole.length > 12) return null
  const raw = `${whole}${fraction.padEnd(decimals, '0')}`.replace(/^0+/, '')
  if (!raw || raw === '0') return null
  return raw
}

export function formatUnits(raw: string, decimals: number): string {
  const padded = raw.padStart(decimals + 1, '0')
  const split = padded.length - decimals
  const head = padded.slice(0, split)
  const fraction = padded.slice(split).replace(/0+$/, '')
  return fraction ? `${head}.${fraction}` : head
}

export function quotePaths(sell: string, buy: string): string[][] {
  const tokenIn = sell.toLowerCase()
  const tokenOut = buy.toLowerCase()
  const paths = [[tokenIn, tokenOut]]
  const wrapped = WBNB.toLowerCase()
  if (tokenIn !== wrapped && tokenOut !== wrapped) paths.push([tokenIn, wrapped, tokenOut])
  return paths
}

export function encodeGetAmountsOut(amountInRaw: string, path: string[]): string {
  const head = word(BigInt(amountInRaw))
  const offset = word(BigInt(64))
  const length = word(BigInt(path.length))
  const addresses = path.map((address) => address.toLowerCase().replace(/^0x/, '').padStart(64, '0')).join('')
  return `0x${GET_AMOUNTS_OUT}${head}${offset}${length}${addresses}`
}

export function decodeGetAmountsOut(data: string): string | null {
  const hex = data.startsWith('0x') ? data.slice(2) : data
  if (hex.length < 64 * 3 || hex.length % 64 !== 0) return null
  const words = hex.match(/.{64}/g)
  if (!words || words.length < 3) return null
  const length = Number(BigInt(`0x${words[1]}`))
  if (!Number.isInteger(length) || length < 1 || words.length < 2 + length) return null
  const last = words[1 + length]
  if (!last) return null
  return BigInt(`0x${last}`).toString()
}

export function quoteIsStale(quotedAt: string, nowMs: number, staleAfterMs = STALE_QUOTE_MS): boolean {
  const quoted = Date.parse(quotedAt)
  if (!Number.isFinite(quoted)) return true
  return nowMs - quoted > staleAfterMs
}

export function assertReadonlyRpc(url: string): string {
  const parsed = new URL(url)
  if (parsed.protocol !== 'https:') throw new Error('RPC_REJECTED')
  if (parsed.username || parsed.password || parsed.search) throw new Error('RPC_REJECTED')
  return `${parsed.origin}${parsed.pathname}`
}

function word(value: bigint): string {
  return value.toString(16).padStart(64, '0')
}

export function rejectQuote(code: QuoteFailure, started: number, rpcCalls: number): FailedBnbQuote {
  return {
    ok: false,
    code,
    executable: false,
    feeCollected: false,
    priceImpactPercent: null,
    gasUnits: null,
    rpcCalls,
    durationMs: Date.now() - started,
  }
}
