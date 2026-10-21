/**
 * Read-only staked-farm classification for retired native chains.
 * A failed pid is never reported as zero.
 */

export const RETIRED_POSITION_CHAINS = [1, 137, 8453] as const
export type RetiredChainId = (typeof RETIRED_POSITION_CHAINS)[number]
export const MAX_RETIRED_PIDS = 48
/**
 * Four farms per request, one call at a time, eight seconds for that page.
 * Measured 2026-10-20: Polygon has 42 farms. Six-wide rounds at 2s each need 14s,
 * so the old 8s budget cannot finish. Concurrency 2 still returned 403 and 429
 * from the public Polygon and Ethereum hosts. Base answered 24 of 24 calls.
 */
export const RETIRED_PAGE_PIDS = 4
export const RETIRED_CALL_TIMEOUT_MS = 2_500
export const RETIRED_PAGE_DEADLINE_MS = 8_000
export const MAX_RETIRED_PAGES = Math.ceil(MAX_RETIRED_PIDS / RETIRED_PAGE_PIDS)

export const RETIRED_RPC: Record<RetiredChainId, string> = {
  1: 'https://1rpc.io/eth',
  137: 'https://1rpc.io/matic',
  8453: 'https://mainnet.base.org',
}

const USER_INFO = '93f1a40b'
const PENDING = '9700edcc'
const POOL_LENGTH = '081e3eda'

export type PositionState = 'unknown' | 'zero' | 'nonzero'

export interface RetiredFarmRow {
  pid: number
  stakedRaw: string
  pendingRaw: string | null
}

export interface RetiredPositionRead {
  ok: boolean
  code?: 'CHAIN_MISMATCH' | 'ADDRESS_REJECTED' | 'CURSOR_REJECTED' | 'UNAVAILABLE' | 'UNBOUNDED' | 'PARTIAL'
  chainId: RetiredChainId | null
  state: PositionState
  /** True only when every farm in poolLength was read and none failed. */
  complete: boolean
  cursor: number
  nextCursor: number | null
  poolLength: number | null
  readPids: number
  failedPids: number
  rows: RetiredFarmRow[]
  deposit: false
  withdraw: false
  executable: false
  rpcCalls: number
}

export interface RetiredLookupIdentity {
  id: number
  chainId: number
  address: string
}

export function isRetiredPositionChain(chainId: number): chainId is RetiredChainId {
  return (RETIRED_POSITION_CHAINS as readonly number[]).includes(chainId)
}

export function encodeWord(value: bigint | number): string {
  return BigInt(value).toString(16).padStart(64, '0')
}

export function encodePoolLength(): string {
  return `0x${POOL_LENGTH}`
}

export function encodeUserInfo(pid: number, account: string): string {
  return `0x${USER_INFO}${encodeWord(pid)}${account.toLowerCase().replace(/^0x/, '').padStart(64, '0')}`
}

export function encodePending(pid: number, account: string): string {
  return `0x${PENDING}${encodeWord(pid)}${account.toLowerCase().replace(/^0x/, '').padStart(64, '0')}`
}

export function decodeUintWords(data: string): bigint[] | null {
  const hex = data.startsWith('0x') ? data.slice(2) : data
  if (!hex || !/^[0-9a-fA-F]+$/.test(hex) || hex.length < 64 || hex.length % 64 !== 0) return null
  const words: bigint[] = []
  for (let index = 0; index < hex.length; index += 64) words.push(BigInt(`0x${hex.slice(index, index + 64)}`))
  return words
}

export function classifyRetiredFarms(input: {
  poolLength: number
  rows: Array<{ pid: number; staked: bigint | null; pending: bigint | null }>
}): Pick<RetiredPositionRead, 'state' | 'readPids' | 'failedPids' | 'rows'> {
  const rows: RetiredFarmRow[] = []
  let readPids = 0
  let failedPids = 0
  for (const row of input.rows) {
    if (row.staked === null || row.pending === null) {
      failedPids += 1
      if (row.staked !== null && row.staked > BigInt(0)) {
        rows.push({ pid: row.pid, stakedRaw: row.staked.toString(), pendingRaw: null })
      }
      continue
    }
    readPids += 1
    if (row.staked > BigInt(0) || row.pending > BigInt(0)) {
      rows.push({
        pid: row.pid,
        stakedRaw: row.staked.toString(),
        pendingRaw: row.pending.toString(),
      })
    }
  }
  const unread = input.poolLength - input.rows.length
  failedPids += unread > 0 ? unread : 0
  if (rows.length > 0) return { state: 'nonzero', readPids, failedPids, rows }
  if (failedPids > 0) return { state: 'unknown', readPids, failedPids, rows }
  return { state: 'zero', readPids, failedPids, rows }
}

export function retiredPageEnd(poolLength: number, cursor: number, pageSize = RETIRED_PAGE_PIDS): number {
  return Math.min(poolLength, cursor + pageSize)
}

/** A zero is valid only when this page is the entire farm list and every pid was read. */
export function presentRetiredPage(input: {
  chainId: RetiredChainId
  poolLength: number
  cursor: number
  classified: Pick<RetiredPositionRead, 'state' | 'readPids' | 'failedPids' | 'rows'>
  rpcCalls: number
  pageSize?: number
}): RetiredPositionRead {
  const pageEnd = retiredPageEnd(input.poolLength, input.cursor, input.pageSize)
  const nextCursor = pageEnd < input.poolLength ? pageEnd : null
  const complete = input.cursor === 0
    && nextCursor === null
    && input.classified.failedPids === 0
    && input.classified.readPids === input.poolLength
  const state: PositionState = !complete
    ? input.classified.rows.length > 0 ? 'nonzero' : 'unknown'
    : input.classified.state
  return {
    ok: complete,
    code: complete ? undefined : 'PARTIAL',
    chainId: input.chainId,
    state,
    complete,
    cursor: input.cursor,
    nextCursor,
    poolLength: input.poolLength,
    readPids: input.classified.readPids,
    failedPids: input.classified.failedPids,
    rows: input.classified.rows,
    deposit: false,
    withdraw: false,
    executable: false,
    rpcCalls: input.rpcCalls,
  }
}

export function mergeRetiredReads(pages: readonly RetiredPositionRead[]): RetiredPositionRead {
  const first = pages[0]
  if (!first || first.poolLength === null || first.code === 'CHAIN_MISMATCH' || first.code === 'ADDRESS_REJECTED' || first.code === 'CURSOR_REJECTED' || first.code === 'UNBOUNDED') {
    return first
      ? { ...first, complete: false, state: first.state === 'zero' ? 'unknown' : first.state, ok: false }
      : {
          ok: false,
          code: 'UNAVAILABLE',
          chainId: null,
          state: 'unknown',
          complete: false,
          cursor: 0,
          nextCursor: null,
          poolLength: null,
          readPids: 0,
          failedPids: 0,
          rows: [],
          deposit: false,
          withdraw: false,
          executable: false,
          rpcCalls: 0,
        }
  }
  let readPids = 0
  let failedPids = 0
  let rpcCalls = 0
  const rows: RetiredFarmRow[] = []
  let expected = 0
  let contiguous = true
  for (const page of pages) {
    if (page.chainId !== first.chainId || page.poolLength !== first.poolLength || page.cursor !== expected) {
      contiguous = false
      break
    }
    if (page.code === 'UNAVAILABLE' || page.code === 'CURSOR_REJECTED' || page.code === 'UNBOUNDED') {
      contiguous = false
      failedPids += page.failedPids
      readPids += page.readPids
      rpcCalls += page.rpcCalls
      rows.push(...page.rows)
      break
    }
    readPids += page.readPids
    failedPids += page.failedPids
    rpcCalls += page.rpcCalls
    rows.push(...page.rows)
    expected = page.nextCursor ?? first.poolLength
    if (page.nextCursor === null) break
  }
  const complete = contiguous && expected === first.poolLength && failedPids === 0 && readPids === first.poolLength
  const state: PositionState = rows.length > 0 ? 'nonzero' : complete ? 'zero' : 'unknown'
  return {
    ok: complete,
    code: complete ? undefined : 'PARTIAL',
    chainId: first.chainId,
    state,
    complete,
    cursor: 0,
    nextCursor: complete ? null : expected,
    poolLength: first.poolLength,
    readPids,
    failedPids,
    rows,
    deposit: false,
    withdraw: false,
    executable: false,
    rpcCalls,
  }
}

export function retiredLookupStillCurrent(issued: RetiredLookupIdentity, current: RetiredLookupIdentity): boolean {
  return issued.id === current.id
    && issued.chainId === current.chainId
    && issued.address.trim().toLowerCase() === current.address.trim().toLowerCase()
}
