import { describe, expect, it } from 'vitest'
import { classifyAmmPair, filterDiscoverablePairs } from '../pairs/classify'
import type { OnchainAmmPair } from 'lib/onchain-registry'

const basePair = (overrides: Partial<OnchainAmmPair>): OnchainAmmPair => ({
  pairAddress: '0x7286c16c3c05d4c17b689be7948ec4fa4e861d1e',
  token0: '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
  token1: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
  reserve0: '1000',
  reserve1: '2000',
  active: true,
  dataSource: 'test',
  lastVerified: '2026-01-01',
  ...overrides,
})

describe('classifyAmmPair', () => {
  it('marks invalid contract as hidden', () => {
    const c = classifyAmmPair(basePair({ pairAddress: '0x0000000000000000000000000000000000000000' }))
    expect(c.classification).toBe('invalid_contract')
    expect(filterDiscoverablePairs([c])).toHaveLength(0)
  })

  it('keeps metadata_incomplete pairs discoverable', () => {
    const c = classifyAmmPair(basePair({ token0: undefined, token1: undefined }))
    expect(c.classification).toBe('metadata_incomplete')
    expect(filterDiscoverablePairs([c])).toHaveLength(1)
  })

  it('classifies tradeable when tokens and liquidity present', () => {
    const c = classifyAmmPair(basePair({}))
    expect(c.classification).toBe('tradeable')
  })
})
