import { describe, expect, it, vi } from 'vitest'

vi.mock('@vercel/blob', () => ({
  head: vi.fn(async () => ({ url: 'https://example.com/blob' })),
  put: vi.fn(async () => ({ url: 'https://example.com/blob' })),
}))

import { MARCO_WBNB_PAIR_BSC, SWAP_TOPIC } from '../constants'
import { normalizeSwapLog, type RawLog } from '../rpc/chunkedLogs'
import { buildCandlesFromSwaps } from '../indexer/candles'
import { CHECKPOINT_RESET_REASON_R772 } from '../checkpointReset'

/** R772 verified MARCO/WBNB swap — block 86326727, log index 485 */
export const VERIFIED_SWAP_TX =
  '0x76c0b12d2fe149a6c524661f2bdd93fe51da373e561b870b53c9141b0db240c9'
export const VERIFIED_SWAP_BLOCK = 86326727
export const VERIFIED_SWAP_LOG_INDEX = 485

const VERIFIED_RAW_LOG: RawLog = {
  address: MARCO_WBNB_PAIR_BSC,
  topics: [
    SWAP_TOPIC,
    '0x000000000000000000000000c25033218d181b27d4a2944fbb04fc055da4eab3',
    '0x000000000000000000000000c25033218d181b27d4a2944fbb04fc055da4eab3',
  ],
  data: '0x0000000000000000000000000000000000000000000000dc91998f68a2ca602c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011c37937e08000',
  blockNumber: '0x5253dc7',
  transactionHash: VERIFIED_SWAP_TX,
  logIndex: '0x1e5',
}

const PAIR_META = {
  token0: '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
  token1: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
}

describe('verified R772 historical Swap regression (R773)', () => {
  it('normalizes the verified swap log with finite decoded values', () => {
    const event = normalizeSwapLog(VERIFIED_RAW_LOG, PAIR_META)
    event.blockTimestamp = 1773343104

    expect(event.txHash.toLowerCase()).toBe(VERIFIED_SWAP_TX.toLowerCase())
    expect(event.blockNumber).toBe(VERIFIED_SWAP_BLOCK)
    expect(event.logIndex).toBe(VERIFIED_SWAP_LOG_INDEX)
    expect(event.pairAddress?.toLowerCase()).toBe(MARCO_WBNB_PAIR_BSC.toLowerCase())
    expect(event.eventType).toBe('Swap')
    expect(event.wallet?.toLowerCase()).toBe('0xc25033218d181b27d4a2944fbb04fc055da4eab3')
    expect(event.recipient?.toLowerCase()).toBe('0xc25033218d181b27d4a2944fbb04fc055da4eab3')

    for (const field of [event.amount0, event.amount1, event.amountIn, event.amountOut]) {
      const n = Number(field)
      expect(Number.isFinite(n)).toBe(true)
      expect(Number.isNaN(n)).toBe(false)
      expect(n).not.toBe(Infinity)
    }
  })

  it('builds finite MARCO/WBNB candles from verified swap', () => {
    const event = normalizeSwapLog(VERIFIED_RAW_LOG, PAIR_META)
    event.blockTimestamp = 1773343104
    const candles = buildCandlesFromSwaps([event], MARCO_WBNB_PAIR_BSC, ['1H', '4H', '1D'])
    expect(candles.length).toBeGreaterThan(0)
    for (const c of candles) {
      for (const v of [c.open, c.high, c.low, c.close, c.baseVolume, c.quoteVolume]) {
        expect(Number.isFinite(v)).toBe(true)
        expect(v).not.toBe(Infinity)
      }
      expect(c.tradeCount).toBeGreaterThan(0)
    }
  })
})

describe('checkpoint reset namespace (R773)', () => {
  it('uses R772 malformed topic correction reason constant', () => {
    expect(CHECKPOINT_RESET_REASON_R772).toBe('R772_MALFORMED_SWAP_TOPIC_CORRECTION')
  })
})
