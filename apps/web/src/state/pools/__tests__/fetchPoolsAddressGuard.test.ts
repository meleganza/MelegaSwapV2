/**
 * FA-V5-001 — pool public fetch must never multicall balanceOf("") / chef("").
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const FETCH = path.resolve(__dirname, '../fetchPools.ts')
const POOLS = path.resolve(__dirname, '../../../config/constants/pools.tsx')
const ADDR = path.resolve(__dirname, '../../../utils/addressHelpers.ts')

describe('fetchPools address guard (FA-V5-001)', () => {
  it('getAddress requires chainId (empty when omitted)', () => {
    const src = readFileSync(ADDR, 'utf8')
    expect(src).toMatch(/if \(chainId == null\) return ''/)
  })

  it('fetchPools always passes chainId into getAddress and filters empty chefs', () => {
    const src = readFileSync(FETCH, 'utf8')
    expect(src).toContain('getAddress(poolConfig.contractAddress, chainId)')
    expect(src).not.toMatch(/getAddress\(poolConfig\.contractAddress\)\s*[,)]/)
    expect(src).toContain('poolsForChain')
    expect(src).toMatch(/chef\.length >= 42/)
  })

  it('poolsConfig contains cross-chain rows with empty BSC address (why filter is required)', () => {
    const src = readFileSync(POOLS, 'utf8')
    expect(src).toMatch(/56:\s*''/)
  })
})
