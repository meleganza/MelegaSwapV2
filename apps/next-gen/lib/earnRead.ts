/**
 * One BNB farm identity. Pid 0 and the MARCO token come from packages/farms/constants/56.ts.
 * The chef address is the BNB entry in apps/web/src/config/constants/contracts.ts.
 * poolInfo does not return APY or TVL.
 */
export const EARN_CHAIN_ID = 56
export const EARN_PID = 0
export const EARN_MASTER_CHEF = '0x41D5487836452d23f2c467070244E5842B412794'
export const EARN_EXPECTED_LP = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
export const EARN_LABEL = 'MARCO'
export const EARN_TIMEOUT_MS = 1_200
const POOL_INFO = '1526fe27'

export function encodePoolInfo(pid: number): string {
  return `0x${POOL_INFO}${pid.toString(16).padStart(64, '0')}`
}

export function decodePoolInfo(data: string): { lpToken: string; allocPoint: string } | null {
  const hex = data.startsWith('0x') ? data.slice(2) : data
  if (hex.length < 64 * 4 || hex.length % 64 !== 0) return null
  const words = hex.match(/.{64}/g)
  if (!words || words.length < 4) return null
  const lpToken = `0x${words[0].slice(24)}`
  if (!/^0x[0-9a-f]{40}$/.test(lpToken)) return null
  return { lpToken, allocPoint: BigInt(`0x${words[1]}`).toString() }
}

export interface EarnRead {
  ok: boolean
  code?: 'CHAIN_MISMATCH' | 'QUOTE_TIMEOUT' | 'UNAVAILABLE'
  chainId: 56
  pid: 0
  label: string | null
  chefAddress: string
  lpToken: string | null
  allocPoint: string | null
  aprPercent: null
  tvlUsd: null
  executable: false
  deposit: false
  withdraw: false
  rpcCalls: number
  durationMs: number
}

export function unavailableEarn(code: EarnRead['code'], rpcCalls: number, started: number): EarnRead {
  return {
    ok: false,
    code,
    chainId: 56,
    pid: 0,
    label: null,
    chefAddress: EARN_MASTER_CHEF,
    lpToken: null,
    allocPoint: null,
    aprPercent: null,
    tvlUsd: null,
    executable: false,
    deposit: false,
    withdraw: false,
    rpcCalls,
    durationMs: Date.now() - started,
  }
}
