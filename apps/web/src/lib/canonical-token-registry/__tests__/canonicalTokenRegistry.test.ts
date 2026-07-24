import { describe, expect, it } from 'vitest'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import {
  buildCanonicalTokenRegistryPayload,
  getCanonicalTokenRegistry,
  getHistoricalTokenListCount,
  lookupCanonicalToken,
  searchCanonicalTokens,
} from '../buildCanonicalTokenRegistry'

describe('DEX_V1 canonical token registry', () => {
  it('recovers the full historical token list into one registry', () => {
    const payload = buildCanonicalTokenRegistryPayload()
    expect(getHistoricalTokenListCount()).toBe(326)
    expect(payload.tokenCount).toBeGreaterThan(50)
    expect(payload.logoCount).toBeGreaterThan(0)
    expect(payload.schema).toContain('canonical-token-registry')
  })

  it('includes canonical MARCO with aliases and decimals', () => {
    const marco = lookupCanonicalToken(56, MARCO_BSC_ADDRESS)
    expect(marco).toBeDefined()
    expect(marco?.symbol).toBe('MARCO')
    expect(marco?.decimals).toBe(18)
    expect(marco?.aliases).toEqual(expect.arrayContaining(['MARCO', 'CAKE']))
    expect(marco?.logo || marco?.logoFallback).toBeTruthy()
  })

  it('supports search by symbol, name, address, and alias', () => {
    const bySymbol = searchCanonicalTokens('USDT')
    expect(bySymbol.length).toBeGreaterThan(0)
    expect(bySymbol.some((t) => t.symbol.toUpperCase().includes('USDT'))).toBe(true)

    const byAlias = searchCanonicalTokens('CAKE')
    expect(byAlias.some((t) => t.address.toLowerCase() === MARCO_BSC_ADDRESS.toLowerCase())).toBe(true)
  })

  it('dedupes by chainId + address', () => {
    const registry = getCanonicalTokenRegistry()
    const keys = registry.map((t) => `${t.chainId}:${t.address.toLowerCase()}`)
    expect(new Set(keys).size).toBe(keys.length)
  })
})
