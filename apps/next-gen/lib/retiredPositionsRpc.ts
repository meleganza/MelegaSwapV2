import { assertReadonlyRpc } from './bscQuote'
import { isPublicAddress } from './portfolioRead'
import { nativeEarnChain } from './nativeEarnChains'
import {
  MAX_RETIRED_PIDS,
  RETIRED_CALL_TIMEOUT_MS,
  RETIRED_PAGE_DEADLINE_MS,
  RETIRED_PAGE_PIDS,
  RETIRED_RPC,
  classifyRetiredFarms,
  decodeUintWords,
  encodePending,
  encodePoolLength,
  encodeUserInfo,
  isRetiredPositionChain,
  presentRetiredPage,
  retiredPageEnd,
  type RetiredChainId,
  type RetiredPositionRead,
} from './retiredPositions'

type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body: string; signal: AbortSignal }) => Promise<{
  ok: boolean
  json: () => Promise<{ result?: string }>
}>

export interface RetiredReadDeps {
  fetchImpl?: FetchLike
  now?: () => number
  callTimeoutMs?: number
  deadlineMs?: number
  pageSize?: number
}

function empty(code: RetiredPositionRead['code'], chainId: RetiredChainId | null, rpcCalls: number, cursor = 0): RetiredPositionRead {
  return {
    ok: false,
    code,
    chainId,
    state: 'unknown',
    complete: false,
    cursor,
    nextCursor: null,
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
  input: { chainId?: number; address?: string; cursor?: number },
  deps: RetiredReadDeps = {},
): Promise<RetiredPositionRead> {
  const cursor = input.cursor ?? 0
  if (!Number.isInteger(cursor) || cursor < 0 || cursor > MAX_RETIRED_PIDS) return empty('CURSOR_REJECTED', null, 0, 0)
  if (input.chainId === undefined || !isRetiredPositionChain(input.chainId)) return empty('CHAIN_MISMATCH', null, 0, cursor)
  if (!input.address || !isPublicAddress(input.address)) return empty('ADDRESS_REJECTED', input.chainId, 0, cursor)
  const chain = nativeEarnChain(input.chainId)
  if (!chain?.farmContract) return empty('UNAVAILABLE', input.chainId, 0, cursor)
  let rpc: string
  try {
    rpc = assertReadonlyRpc(RETIRED_RPC[input.chainId])
  } catch {
    return empty('UNAVAILABLE', input.chainId, 0, cursor)
  }
  const fetchImpl = deps.fetchImpl ?? (fetch as unknown as FetchLike)
  const now = deps.now ?? Date.now
  const callTimeoutMs = deps.callTimeoutMs ?? RETIRED_CALL_TIMEOUT_MS
  const deadlineMs = deps.deadlineMs ?? RETIRED_PAGE_DEADLINE_MS
  const pageSize = deps.pageSize ?? RETIRED_PAGE_PIDS
  const started = now()
  let rpcCalls = 0
  const rpcCall = async (method: 'eth_chainId' | 'eth_call', params: unknown[]): Promise<string | null> => {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      if (now() - started >= deadlineMs) return null
      rpcCalls += 1
      const signal = AbortSignal.timeout(callTimeoutMs)
      try {
        const response = await fetchImpl(rpc, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: rpcCalls, method, params }),
          signal,
        })
        if (!response.ok) continue
        const payload = await response.json()
        if (typeof payload.result === 'string') return payload.result
      } catch {
        // One more attempt remains when the public host refuses or times out.
      }
    }
    return null
  }

  const chainIdHex = await rpcCall('eth_chainId', [])
  if (chainIdHex === null) return empty('UNAVAILABLE', input.chainId, rpcCalls, cursor)
  if (BigInt(chainIdHex) !== BigInt(input.chainId)) return empty('CHAIN_MISMATCH', null, rpcCalls, cursor)

  const lengthData = await rpcCall('eth_call', [{ to: chain.farmContract, data: encodePoolLength() }, 'latest'])
  const lengthWords = lengthData ? decodeUintWords(lengthData) : null
  const poolLength = lengthWords && lengthWords.length > 0 ? Number(lengthWords[0]) : null
  if (poolLength === null || !Number.isInteger(poolLength) || poolLength < 0) return empty('UNAVAILABLE', input.chainId, rpcCalls, cursor)
  if (poolLength > MAX_RETIRED_PIDS) return { ...empty('UNBOUNDED', input.chainId, rpcCalls, cursor), poolLength }
  if (cursor > poolLength) return { ...empty('CURSOR_REJECTED', input.chainId, rpcCalls, cursor), poolLength }

  const pageEnd = retiredPageEnd(poolLength, cursor, pageSize)
  const observed: Array<{ pid: number; staked: bigint | null; pending: bigint | null }> = []
  for (let pid = cursor; pid < pageEnd; pid += 1) {
    if (now() - started >= deadlineMs) {
      observed.push({ pid, staked: null, pending: null })
      continue
    }
    const stakedData = await rpcCall('eth_call', [{ to: chain.farmContract, data: encodeUserInfo(pid, input.address) }, 'latest'])
    const pendingData = await rpcCall('eth_call', [{ to: chain.farmContract, data: encodePending(pid, input.address) }, 'latest'])
    const stakedWords = stakedData ? decodeUintWords(stakedData) : null
    const pendingWords = pendingData ? decodeUintWords(pendingData) : null
    observed.push({
      pid,
      staked: stakedWords && stakedWords.length >= 1 ? stakedWords[0] : null,
      pending: pendingWords && pendingWords.length >= 1 ? pendingWords[0] : null,
    })
  }
  return presentRetiredPage({
    chainId: input.chainId,
    poolLength,
    cursor,
    classified: classifyRetiredFarms({ poolLength: observed.length, rows: observed }),
    rpcCalls,
    pageSize,
  })
}
