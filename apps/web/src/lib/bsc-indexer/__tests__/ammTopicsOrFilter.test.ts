/**
 * Guard: eth_getLogs topic encoding for AMM pair scans.
 * Flat [A,B,C] is AND across topic slots — matches zero Uniswap-V2 Swap/Mint/Burn logs.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import {
  SWAP_TOPIC,
  MINT_TOPIC,
  BURN_TOPIC,
  ammPairEventTopicsOrFilter,
} from '../eventTopics'

describe('ammPairEventTopicsOrFilter', () => {
  it('returns nested topic0 OR array (not flat AND)', () => {
    const topics = ammPairEventTopicsOrFilter()
    expect(topics).toHaveLength(1)
    expect(Array.isArray(topics[0])).toBe(true)
    expect(topics[0]).toEqual([SWAP_TOPIC, MINT_TOPIC, BURN_TOPIC])
  })

  it('pairSyncEngine uses OR filter helper — never flat AND topics', () => {
    const src = readFileSync(path.join(__dirname, '../indexer/pairSyncEngine.ts'), 'utf8')
    expect(src).toContain('ammPairEventTopicsOrFilter()')
    expect(src).not.toMatch(/topics:\s*\[SWAP_TOPIC,\s*MINT_TOPIC,\s*BURN_TOPIC\]/)
  })
})
