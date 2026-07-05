import { describe, expect, it } from 'vitest'
import { MARCO_LOGO_URI, MARCO_BSC_ADDRESS, MARCO_BSC_CHAIN_ID } from 'design-system/melega/constants/brand'
import {
  resolvePrimaryTokenLogoSource,
  resolveTokenLogoSources,
} from 'lib/token-logo/resolveTokenLogoSources'

describe('resolveTokenLogoSources', () => {
  it('returns official MARCO logo first for MARCO symbol', () => {
    const sources = resolveTokenLogoSources({ symbol: 'MARCO', name: 'MARCO' })
    expect(sources[0]).toBe(MARCO_LOGO_URI)
    expect(sources.length).toBeGreaterThan(0)
  })

  it('returns Melega brand logo for Melega name', () => {
    expect(resolvePrimaryTokenLogoSource({ name: 'Melega DEX' })).toBe(MARCO_LOGO_URI)
  })

  it('includes token list logoURI for MARCO BSC address', () => {
    const sources = resolveTokenLogoSources({
      symbol: 'MARCO',
      address: MARCO_BSC_ADDRESS,
      chainId: MARCO_BSC_CHAIN_ID,
    })
    expect(sources.some((s) => s.includes('melega'))).toBe(true)
  })

  it('falls back through CDN and local paths for known address', () => {
    const sources = resolveTokenLogoSources({
      symbol: 'USDT',
      address: '0x55d398326f99059ff775485246999027b3197955',
      chainId: 56,
    })
    expect(sources.length).toBeGreaterThan(1)
    expect(sources.some((s) => s.includes('trustwallet') || s.includes('melega.finance'))).toBe(true)
  })

  it('never returns empty array for MARCO — always has brand fallback', () => {
    expect(resolveTokenLogoSources({ symbol: 'MARCO' }).length).toBeGreaterThan(0)
  })
})
