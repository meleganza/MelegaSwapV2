import { MARCO_WBNB_PAIR_BSC } from 'lib/bsc-indexer/constants'
import { rpcCall } from 'lib/bsc-indexer/rpc/chunkedLogs'
import { fetchBnbUsd } from 'lib/market-data/bnbUsd'

const GET_RESERVES_SELECTOR = '0x0902f1ac'
const MARCO_DECIMALS = 18
const WBNB_DECIMALS = 18

export interface MarcoPairLiquiditySnapshot {
  status: 'ready'
  pairAddress: string
  liquidityUsd: number
  marcoReserve: number
  quoteReserveWbnb: number
  priceUsd: number
  bnbUsd: number
  bnbUsdSource: string
  source: 'melega-pair-reserves'
  checkedAt: string
}

function decodeUintSlot(data: string, slot: number): bigint | undefined {
  const body = data.startsWith('0x') ? data.slice(2) : data
  const start = slot * 64
  const value = body.slice(start, start + 64)
  if (value.length !== 64) return undefined
  try {
    return BigInt(`0x${value}`)
  } catch {
    return undefined
  }
}

function toDecimal(value: bigint, decimals: number): number {
  const scale = 10n ** BigInt(decimals)
  const whole = value / scale
  const fraction = value % scale
  return Number(whole) + Number(fraction) / Number(scale)
}

export async function fetchMarcoPairLiquidity(): Promise<MarcoPairLiquiditySnapshot> {
  const [rawReserves, bnb] = await Promise.all([
    rpcCall<string>('eth_call', [{ to: MARCO_WBNB_PAIR_BSC, data: GET_RESERVES_SELECTOR }, 'latest']),
    fetchBnbUsd(),
  ])

  // MARCO sorts before WBNB in the canonical V2 pair, therefore WBNB is reserve1.
  const reserve0 = decodeUintSlot(rawReserves, 0)
  const reserve1 = decodeUintSlot(rawReserves, 1)
  const marcoReserve = reserve0 == null ? undefined : toDecimal(reserve0, MARCO_DECIMALS)
  const quoteReserveWbnb = reserve1 == null ? undefined : toDecimal(reserve1, WBNB_DECIMALS)
  if (marcoReserve == null || marcoReserve <= 0) {
    throw new Error('MARCO/WBNB pair returned an invalid MARCO reserve')
  }
  if (quoteReserveWbnb == null || quoteReserveWbnb <= 0) {
    throw new Error('MARCO/WBNB pair returned an invalid WBNB reserve')
  }
  if (bnb.usd == null || !Number.isFinite(bnb.usd) || bnb.usd <= 0) {
    throw new Error('BNB/USD reference price is unavailable')
  }
  const priceUsd = (quoteReserveWbnb * bnb.usd) / marcoReserve
  if (!Number.isFinite(priceUsd) || priceUsd <= 0) {
    throw new Error('MARCO/WBNB pair returned an invalid USD price')
  }

  return {
    status: 'ready',
    pairAddress: MARCO_WBNB_PAIR_BSC,
    liquidityUsd: quoteReserveWbnb * bnb.usd * 2,
    marcoReserve,
    quoteReserveWbnb,
    priceUsd,
    bnbUsd: bnb.usd,
    bnbUsdSource: bnb.source ?? 'unknown',
    source: 'melega-pair-reserves',
    checkedAt: new Date().toISOString(),
  }
}
