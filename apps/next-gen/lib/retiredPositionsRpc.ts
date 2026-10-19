import { assertReadonlyRpc } from './bscQuote'
import { isPublicAddress } from './portfolioRead'
import { nativeEarnChain } from './nativeEarnChains'
import {
  MAX_RETIRED_PIDS,
  RETIRED_RPC,
  classifyRetiredFarms,
  decodeUintWords,
  encodePending,
  encodePoolLength,
  encodeUserInfo,
  isRetiredPositionChain,
  type RetiredChainId,
  type RetiredPositionRead,
} from './retiredPositions'

const CALL_TIMEOUT_MS = 2_000
const DEADLINE_MS = 8_000
const BATCH = 6

type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body: string; signal: AbortSignal }) => Promise<{
  ok: boolean
  json: () => Promise<{ result?: string }>
}>

function empty(code: RetiredPositionRead['code'], chainId: RetiredChainId | null, rpcCalls: number): RetiredPositionRead {
  return {
    ok: false,
    code,
    chainId,
    state: 'unknown',
    poolLength: null,
    readPids: 0,
    failedPids: 0,
    rows: [],
    deposit: false,
    withdraw: false,
    executable: false,
    rpcCalls,
  }
}

export async function readRetiredPositions(
  input: { chainId?: number; address?: string },
  deps: { fetchImpl?: FetchLike } = {},
): Promise<RetiredPositionRead> {
  if (input.chainId === undefined || !isRetiredPositionChain(input.chainId)) return empty('CHAIN_MISMATCH', null, 0)
  if (!input.address || !isPublicAddress(input.address)) return empty('ADDRESS_REJECTED', input.chainId, 0)
  const chain = nativeEarnChain(input.chainId)
  if (!chain?.farmContract) return empty('UNAVAILABLE', input.chainId, 0)
  let rpc: string
  try {
    rpc = assertReadonlyRpc(RETIRED_RPC[input.chainId])
  } catch {
    return empty('UNAVAILABLE', input.chainId, 0)
  }
  const fetchImpl = deps.fetchImpl ?? (fetch as unknown as FetchLike)
  const started = Date.now()
  let rpcCalls = 0
  const call = async (to: string, data: string): Promise<string | null> => {
    if (Date.now() - started > DEADLINE_MS) return null
    rpcCalls += 1
    const signal = AbortSignal.timeout(CALL_TIMEOUT_MS)
    try {
      const response = await fetchImpl(rpc, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: rpcCalls, method: 'eth_call', params: [{ to, data }, 'latest'] }),
        signal,
      })
      if (!response.ok) return null
      const payload = await response.json()
      return typeof payload.result === 'string' ? payload.result : null
    } catch {
      return null
    }
  }

  const chainIdHex = await (async () => {
    if (Date.now() - started > DEADLINE_MS) return null
    rpcCalls += 1
    const signal = AbortSignal.timeout(CALL_TIMEOUT_MS)
    try {
      const response = await fetchImpl(rpc, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: rpcCalls, method: 'eth_chainId', params: [] }),
        signal,
      })
      if (!response.ok) return null
      const payload = await response.json()
      return typeof payload.result === 'string' ? payload.result : null
    } catch {
      return null
    }
  })()
  if (chainIdHex === null) return empty('UNAVAILABLE', input.chainId, rpcCalls)
  if (BigInt(chainIdHex) !== BigInt(input.chainId)) return empty('CHAIN_MISMATCH', null, rpcCalls)

  const lengthData = await call(chain.farmContract, encodePoolLength())
  const lengthWords = lengthData ? decodeUintWords(lengthData) : null
  const poolLength = lengthWords && lengthWords.length > 0 ? Number(lengthWords[0]) : null
  if (poolLength === null || !Number.isInteger(poolLength) || poolLength < 0) return empty('UNAVAILABLE', input.chainId, rpcCalls)
  if (poolLength > MAX_RETIRED_PIDS) return { ...empty('UNBOUNDED', input.chainId, rpcCalls), poolLength }

  const observed: Array<{ pid: number; staked: bigint | null; pending: bigint | null }> = []
  for (let start = 0; start < poolLength; start += BATCH) {
    const slice = Array.from({ length: Math.min(BATCH, poolLength - start) }, (_, offset) => start + offset)
    const batch = await Promise.all(slice.map(async (pid) => {
      const [stakedData, pendingData] = await Promise.all([
        call(chain.farmContract as string, encodeUserInfo(pid, input.address as string)),
        call(chain.farmContract as string, encodePending(pid, input.address as string)),
      ])
      const stakedWords = stakedData ? decodeUintWords(stakedData) : null
      const pendingWords = pendingData ? decodeUintWords(pendingData) : null
      return {
        pid,
        staked: stakedWords && stakedWords.length >= 1 ? stakedWords[0] : null,
        pending: pendingWords && pendingWords.length >= 1 ? pendingWords[0] : null,
      }
    }))
    observed.push(...batch)
  }
  const classified = classifyRetiredFarms({ poolLength, rows: observed })
  return {
    ok: classified.state !== 'unknown',
    code: classified.state === 'unknown' ? 'UNAVAILABLE' : classified.failedPids > 0 ? 'PARTIAL' : undefined,
    chainId: input.chainId,
    ...classified,
    poolLength,
    deposit: false,
    withdraw: false,
    executable: false,
    rpcCalls,
  }
}
