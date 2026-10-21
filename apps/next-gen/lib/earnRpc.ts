import { assertReadonlyRpc, BSC_CHAIN_ID, DEFAULT_BSC_READONLY_RPC } from './bscQuote'
import {
  EARN_CHAIN_ID,
  EARN_EXPECTED_LP,
  EARN_LABEL,
  EARN_MASTER_CHEF,
  EARN_PID,
  EARN_TIMEOUT_MS,
  decodePoolInfo,
  encodePoolInfo,
  unavailableEarn,
  type EarnRead,
} from './earnRead'

type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body: string; signal: AbortSignal }) => Promise<{
  ok: boolean
  json: () => Promise<{ result?: string }>
}>

export async function readEarn(
  input: { chainId?: number } = {},
  deps: { fetchImpl?: FetchLike; rpcUrl?: string; timeoutMs?: number } = {},
): Promise<EarnRead> {
  const started = Date.now()
  if (input.chainId !== undefined && input.chainId !== EARN_CHAIN_ID) return unavailableEarn('CHAIN_MISMATCH', 0, started)
  let rpc: string
  try {
    rpc = assertReadonlyRpc(deps.rpcUrl ?? process.env.BETA_BSC_READONLY_RPC ?? DEFAULT_BSC_READONLY_RPC)
  } catch {
    return unavailableEarn('UNAVAILABLE', 0, started)
  }
  const fetchImpl = deps.fetchImpl ?? (fetch as unknown as FetchLike)
  const timeoutMs = deps.timeoutMs ?? EARN_TIMEOUT_MS
  let rpcCalls = 0
  let timedOut = false
  const call = async (method: 'eth_chainId' | 'eth_call', params: unknown[]): Promise<string | null> => {
    if (rpcCalls >= 2) return null
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
  if (chainHex === null) return unavailableEarn(timedOut ? 'QUOTE_TIMEOUT' : 'UNAVAILABLE', rpcCalls, started)
  if (BigInt(chainHex) !== BigInt(BSC_CHAIN_ID)) return unavailableEarn('CHAIN_MISMATCH', rpcCalls, started)
  const encoded = await call('eth_call', [{ to: EARN_MASTER_CHEF, data: encodePoolInfo(EARN_PID) }, 'latest'])
  const decoded = encoded ? decodePoolInfo(encoded) : null
  if (!decoded || decoded.lpToken !== EARN_EXPECTED_LP.toLowerCase()) {
    return unavailableEarn(timedOut ? 'QUOTE_TIMEOUT' : 'UNAVAILABLE', rpcCalls, started)
  }
  return {
    ok: true,
    chainId: 56,
    pid: 0,
    label: EARN_LABEL,
    chefAddress: EARN_MASTER_CHEF,
    lpToken: decoded.lpToken,
    allocPoint: decoded.allocPoint,
    aprPercent: null,
    tvlUsd: null,
    executable: false,
    deposit: false,
    withdraw: false,
    rpcCalls,
    durationMs: Date.now() - started,
  }
}
