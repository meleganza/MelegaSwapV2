/**
 * Read-only staked-farm classification for retired native chains.
 * A failed pid is never reported as zero.
 */

export const RETIRED_POSITION_CHAINS = [1, 137, 8453] as const
export type RetiredChainId = (typeof RETIRED_POSITION_CHAINS)[number]
export const MAX_RETIRED_PIDS = 48

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
  code?: 'CHAIN_MISMATCH' | 'ADDRESS_REJECTED' | 'UNAVAILABLE' | 'UNBOUNDED' | 'PARTIAL'
  chainId: RetiredChainId | null
  state: PositionState
  poolLength: number | null
  readPids: number
  failedPids: number
  rows: RetiredFarmRow[]
  deposit: false
  withdraw: false
  executable: false
  rpcCalls: number
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
    if (row.staked === null) {
      failedPids += 1
      continue
    }
    readPids += 1
    const pendingKnown = row.pending !== null
    if (!pendingKnown && row.staked === BigInt(0)) {
      failedPids += 1
      readPids -= 1
      continue
    }
    if (row.staked > BigInt(0) || (row.pending !== null && row.pending > BigInt(0))) {
      rows.push({
        pid: row.pid,
        stakedRaw: row.staked.toString(),
        pendingRaw: row.pending === null ? null : row.pending.toString(),
      })
    }
  }
  const unread = input.poolLength - input.rows.length
  failedPids += unread > 0 ? unread : 0
  if (rows.length > 0) return { state: 'nonzero', readPids, failedPids, rows }
  if (failedPids > 0) return { state: 'unknown', readPids, failedPids, rows }
  return { state: 'zero', readPids, failedPids, rows }
}
