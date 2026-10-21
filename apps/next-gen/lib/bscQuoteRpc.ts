import {
  assertReadonlyRpc,
  BNB_QUOTE_VENUES,
  BSC_CHAIN_ID,
  decodeGetAmountsOut,
  DEFAULT_BSC_READONLY_RPC,
  encodeGetAmountsOut,
  MAX_QUOTE_RPC_CALLS,
  parseDecimalAmount,
  QUOTE_TIMEOUT_MS,
  quotePaths,
  rejectQuote,
  STALE_QUOTE_MS,
  tokenBySymbol,
  type BnbQuoteRequest,
  type BnbQuoteResult,
  type FactualBnbQuote,
} from './bscQuote'

type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body: string; signal: AbortSignal }) => Promise<{
  ok: boolean
  json: () => Promise<{ result?: string; error?: { message?: string } }>
}>

export async function previewBnbQuote(
  request: BnbQuoteRequest,
  deps: { fetchImpl?: FetchLike; rpcUrl?: string; now?: () => number; timeoutMs?: number } = {},
): Promise<BnbQuoteResult> {
  const started = Date.now()
  const now = deps.now ?? (() => Date.now())
  const timeoutMs = deps.timeoutMs ?? QUOTE_TIMEOUT_MS
  const fetchImpl = deps.fetchImpl ?? (fetch as unknown as FetchLike)
  if (request.chainId !== undefined && request.chainId !== BSC_CHAIN_ID) return rejectQuote('CHAIN_MISMATCH', started, 0)
  const sell = tokenBySymbol(request.sell ?? '')
  const buy = tokenBySymbol(request.buy ?? '')
  const amountInRaw = sell && request.amount ? parseDecimalAmount(request.amount, sell.decimals) : null
  if (!sell || !buy || sell.symbol === buy.symbol || !amountInRaw) return rejectQuote('PAIR_REJECTED', started, 0)

  let rpc: string
  try {
    rpc = assertReadonlyRpc(deps.rpcUrl ?? process.env.BETA_BSC_READONLY_RPC ?? DEFAULT_BSC_READONLY_RPC)
  } catch {
    return rejectQuote('QUOTE_UNAVAILABLE', started, 0)
  }

  let rpcCalls = 0
  const call = async (method: 'eth_chainId' | 'eth_call', params: unknown[]): Promise<string | null> => {
    if (rpcCalls >= MAX_QUOTE_RPC_CALLS) return null
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
        throw new Error('QUOTE_TIMEOUT')
      }
      return null
    }
  }

  try {
    const chainHex = await call('eth_chainId', [])
    if (chainHex === null) return rejectQuote('QUOTE_UNAVAILABLE', started, rpcCalls)
    if (BigInt(chainHex) !== BigInt(BSC_CHAIN_ID)) return rejectQuote('CHAIN_MISMATCH', started, rpcCalls)

    let best: FactualBnbQuote | null = null
    const paths = quotePaths(sell.address, buy.address)
    for (const venue of BNB_QUOTE_VENUES) {
      for (const path of paths) {
        const data = encodeGetAmountsOut(amountInRaw, path)
        const result = await call('eth_call', [{ to: venue.router, data }, 'latest'])
        const amountOutRaw = result ? decodeGetAmountsOut(result) : null
        if (!amountOutRaw || amountOutRaw === '0') continue
        if (!best || BigInt(amountOutRaw) > BigInt(best.amountOutRaw)) {
          best = {
            ok: true,
            chainId: 56,
            kind: 'FACTUAL',
            executable: false,
            feeCollected: false,
            venueId: venue.id,
            venueLabel: venue.label,
            router: venue.router,
            sell: sell.symbol,
            buy: buy.symbol,
            amountInRaw,
            amountOutRaw,
            path,
            priceImpactPercent: null,
            gasUnits: null,
            quotedAt: new Date(now()).toISOString(),
            staleAfterMs: STALE_QUOTE_MS,
            rpcCalls,
            durationMs: Date.now() - started,
          }
        }
      }
    }
    if (!best) return rejectQuote('QUOTE_UNAVAILABLE', started, rpcCalls)
    return { ...best, rpcCalls, durationMs: Date.now() - started }
  } catch (cause) {
    if (cause instanceof Error && cause.message === 'QUOTE_TIMEOUT') return rejectQuote('QUOTE_TIMEOUT', started, rpcCalls)
    return rejectQuote('QUOTE_UNAVAILABLE', started, rpcCalls)
  }
}
