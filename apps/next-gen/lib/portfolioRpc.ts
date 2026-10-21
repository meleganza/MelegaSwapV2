import {
  assertReadonlyRpc,
  BSC_CHAIN_ID,
  decodeGetAmountsOut,
  DEFAULT_BSC_READONLY_RPC,
  encodeGetAmountsOut,
  tokenBySymbol,
} from './bscQuote'
import {
  PORTFOLIO_PRICE_VENUES,
  PORTFOLIO_TIMEOUT_MS,
  PORTFOLIO_TOKENS,
  decodeQuantity,
  displayAsset,
  emptyPortfolio,
  encodeBalanceOf,
  isPublicAddress,
  type PortfolioAsset,
  type PortfolioRead,
} from './portfolioRead'

type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body: string; signal: AbortSignal }) => Promise<{
  ok: boolean
  json: () => Promise<{ result?: string }>
}>

const ONE = '1000000000000000000'

export async function readPortfolio(
  input: { address?: string; chainId?: number },
  deps: { fetchImpl?: FetchLike; rpcUrl?: string; timeoutMs?: number } = {},
): Promise<PortfolioRead> {
  const started = Date.now()
  if (input.chainId !== undefined && input.chainId !== BSC_CHAIN_ID) return emptyPortfolio('CHAIN_MISMATCH', 0, started)
  const address = input.address?.trim() ?? ''
  if (!isPublicAddress(address)) return emptyPortfolio('ADDRESS_REJECTED', 0, started)
  let rpc: string
  try {
    rpc = assertReadonlyRpc(deps.rpcUrl ?? process.env.BETA_BSC_READONLY_RPC ?? DEFAULT_BSC_READONLY_RPC)
  } catch {
    return emptyPortfolio('READ_FAILED', 0, started)
  }
  const fetchImpl = deps.fetchImpl ?? (fetch as unknown as FetchLike)
  const timeoutMs = deps.timeoutMs ?? PORTFOLIO_TIMEOUT_MS
  let rpcCalls = 0
  let timedOut = false

  const call = async (method: 'eth_chainId' | 'eth_getBalance' | 'eth_call', params: unknown[]): Promise<string | null> => {
    rpcCalls += 1
    const signal = AbortSignal.timeout(timeoutMs)
    try {
      const response = await fetchImpl(rpc, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: rpcCalls, method, params }),
        signal,
      })
      if (!response.ok) return null
      const payload = await response.json()
      return typeof payload.result === 'string' ? payload.result : null
    } catch (cause) {
      if (signal.aborted || (cause instanceof Error && (cause.name === 'TimeoutError' || cause.name === 'AbortError'))) {
        timedOut = true
      }
      return null
    }
  }

  const chainHex = await call('eth_chainId', [])
  if (chainHex === null) return emptyPortfolio(timedOut ? 'QUOTE_TIMEOUT' : 'READ_FAILED', rpcCalls, started)
  if (BigInt(chainHex) !== BigInt(BSC_CHAIN_ID)) return emptyPortfolio('CHAIN_MISMATCH', rpcCalls, started)

  const nativeRaw = decodeQuantity(await call('eth_getBalance', [address, 'latest']))
  const tokenReads = await Promise.all(
    PORTFOLIO_TOKENS.map(async (token) => {
      const raw = decodeQuantity(await call('eth_call', [{ to: token.address, data: encodeBalanceOf(address) }, 'latest']))
      return { symbol: token.symbol, raw }
    }),
  )

  const wbnb = tokenBySymbol('WBNB')
  const marco = tokenBySymbol('MARCO')
  const usdt = tokenBySymbol('USDT')
  const priceWbnb =
    (nativeRaw !== null && nativeRaw !== '0') ||
    tokenReads.some((row) => row.symbol === 'WBNB' && row.raw !== null && row.raw !== '0')
  const priceMarco = tokenReads.some((row) => row.symbol === 'MARCO' && row.raw !== null && row.raw !== '0')
  const priceFor = async (tokenAddress: string): Promise<string | null> => {
    if (!usdt) return null
    for (const venue of PORTFOLIO_PRICE_VENUES) {
      const data = encodeGetAmountsOut(ONE, [tokenAddress, usdt.address])
      const encoded = await call('eth_call', [{ to: venue.router, data }, 'latest'])
      const decoded = encoded ? decodeGetAmountsOut(encoded) : null
      if (decoded && decoded !== '0') return decoded
    }
    return null
  }
  const [wbnbPrice, marcoPrice] = await Promise.all([
    priceWbnb && wbnb ? priceFor(wbnb.address) : Promise.resolve(null),
    priceMarco && marco ? priceFor(marco.address) : Promise.resolve(null),
  ])

  const quote = (symbol: string, raw: string | null): string | null => {
    if (raw === null) return null
    if (raw === '0') return '0'
    if (symbol === 'BNB' || symbol === 'WBNB') return wbnbPrice ? ((BigInt(raw) * BigInt(wbnbPrice)) / BigInt(ONE)).toString() : null
    if (symbol === 'MARCO') return marcoPrice ? ((BigInt(raw) * BigInt(marcoPrice)) / BigInt(ONE)).toString() : null
    return null
  }

  const assets: PortfolioAsset[] = [
    displayAsset('BNB', nativeRaw, quote('BNB', nativeRaw)),
    ...tokenReads.map((row) => displayAsset(row.symbol, row.raw, quote(row.symbol, row.raw))),
  ]
  return {
    ok: assets.some((asset) => asset.status === 'ok'),
    code: assets.some((asset) => asset.status === 'ok') ? undefined : timedOut ? 'QUOTE_TIMEOUT' : 'READ_FAILED',
    chainId: 56,
    address,
    executable: false,
    custody: false,
    walletConnected: false,
    lpPositionsSupported: false,
    farmPositionsSupported: false,
    assets,
    rpcCalls,
    durationMs: Date.now() - started,
  }
}
