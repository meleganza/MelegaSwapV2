import { assertReadonlyRpc, BSC_CHAIN_ID, DEFAULT_BSC_READONLY_RPC } from './bscQuote'
import { decodeQuantity, encodeBalanceOf } from './portfolioRead'
import {
  acceptShadowQuote,
  emptyShadow,
  encodeAllowance,
  finishShadowRead,
  MAX_SHADOW_RPC_CALLS,
  rejectAddress,
  SHADOW_EXECUTOR_ADDRESS,
  SHADOW_TIMEOUT_MS,
  type ShadowQuoteInput,
  type ShadowReadiness,
} from './shadowReadiness'

type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body: string; signal: AbortSignal }) => Promise<{
  ok: boolean
  json: () => Promise<{ result?: string }>
}>

export async function readShadowReadiness(
  input: { chainId?: number; address?: string; quote?: ShadowQuoteInput | null },
  deps: { fetchImpl?: FetchLike; rpcUrl?: string; now?: () => number; timeoutMs?: number } = {},
): Promise<ShadowReadiness> {
  const started = Date.now()
  const nowMs = (deps.now ?? Date.now)()
  if (input.chainId !== BSC_CHAIN_ID) return emptyShadow('CHAIN_MISMATCH', 0, started, nowMs, input.quote)
  if (rejectAddress(input.address)) return emptyShadow('ADDRESS_REJECTED', 0, started, nowMs, input.quote)
  const accepted = acceptShadowQuote(input.quote, nowMs)
  if (typeof accepted === 'string') return emptyShadow(accepted, 0, started, nowMs, input.quote)

  let rpc: string
  try {
    rpc = assertReadonlyRpc(deps.rpcUrl ?? process.env.BETA_BSC_READONLY_RPC ?? DEFAULT_BSC_READONLY_RPC)
  } catch {
    return emptyShadow('READ_FAILED', 0, started, nowMs, input.quote)
  }

  const fetchImpl = deps.fetchImpl ?? (fetch as unknown as FetchLike)
  const timeoutMs = deps.timeoutMs ?? SHADOW_TIMEOUT_MS
  let rpcCalls = 0
  let timedOut = false
  const call = async (method: 'eth_chainId' | 'eth_call', params: unknown[]): Promise<string | null> => {
    if (rpcCalls >= MAX_SHADOW_RPC_CALLS) return null
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
      if (signal.aborted || (cause instanceof Error && (cause.name === 'TimeoutError' || cause.name === 'AbortError'))) timedOut = true
      return null
    }
  }

  const chainHex = await call('eth_chainId', [])
  if (chainHex === null) return emptyShadow(timedOut ? 'QUOTE_TIMEOUT' : 'READ_FAILED', rpcCalls, started, nowMs, input.quote)
  if (BigInt(chainHex) !== BigInt(BSC_CHAIN_ID)) return emptyShadow('CHAIN_MISMATCH', rpcCalls, started, nowMs, input.quote)

  const address = input.address as string
  const balanceRaw = decodeQuantity(await call('eth_call', [{ to: accepted.token, data: encodeBalanceOf(address) }, 'latest']))
  const executorAllowanceRaw = decodeQuantity(
    await call('eth_call', [{ to: accepted.token, data: encodeAllowance(address, SHADOW_EXECUTOR_ADDRESS) }, 'latest']),
  )
  const routerAllowanceRaw = decodeQuantity(
    await call('eth_call', [{ to: accepted.token, data: encodeAllowance(address, accepted.router) }, 'latest']),
  )
  if (timedOut) return emptyShadow('QUOTE_TIMEOUT', rpcCalls, started, nowMs, input.quote)
  return finishShadowRead({
    quote: accepted,
    address,
    balanceRaw,
    executorAllowanceRaw,
    routerAllowanceRaw,
    rpcCalls,
    started,
  })
}
