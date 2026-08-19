import { Interface } from '@ethersproject/abi'
import { SHADOW_QUOTE_KIND, type ShadowQuoteObservation, type ShadowQuoteSource } from './shadowQuoteSource'

const V2_ROUTER = new Interface([
  'function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)',
])

export function encodeGetAmountsOut(amountInRaw: string, path: string[]): string {
  return V2_ROUTER.encodeFunctionData('getAmountsOut', [amountInRaw, path])
}

export function decodeGetAmountsOut(data: string): string {
  const decoded = V2_ROUTER.decodeFunctionResult('getAmountsOut', data)
  const amounts = decoded[0] as Array<{ toString(): string }>
  const last = amounts[amounts.length - 1]
  if (!last) throw new Error('NO_ROUTE')
  return last.toString()
}

/**
 * Optional factual eth_call source. Read-only. Never broadcasts.
 */
export function createFactualV2QuoteSource(input: {
  rpcUrlByChain: Partial<Record<number, string>>
  fetchImpl?: typeof fetch
}): ShadowQuoteSource {
  const fetchImpl = input.fetchImpl ?? fetch
  return {
    async fetch(request) {
      const rpc = input.rpcUrlByChain[request.chainId]
      if (!rpc) throw new Error('RPC_UNAVAILABLE')
      const data = encodeGetAmountsOut(request.amountInRaw, request.path)
      const response = await fetchImpl(rpc, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_call',
          params: [{ to: request.router, data }, 'latest'],
        }),
        signal: request.signal,
      })
      const payload = (await response.json()) as { result?: string; error?: { message?: string } }
      if (!payload.result || payload.result === '0x') {
        throw new Error(payload.error?.message || 'NO_ROUTE')
      }
      return {
        kind: SHADOW_QUOTE_KIND.FACTUAL,
        amountOutRaw: decodeGetAmountsOut(payload.result),
        path: request.path,
        gasUnits: null,
        priceImpactPercent: null,
        quotedAt: new Date().toISOString(),
      }
    },
  }
}
