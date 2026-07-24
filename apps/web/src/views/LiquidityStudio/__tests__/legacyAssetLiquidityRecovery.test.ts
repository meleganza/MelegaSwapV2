/**
 * DEX_V1_LEGACY_ASSET_AND_LIQUIDITY_RECOVERY — source guards.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('DEX_V1_LEGACY_ASSET_AND_LIQUIDITY_RECOVERY', () => {
  it('removes forced MARCO/BNB lock from Add Liquidity', () => {
    const add = load('onePage/AddLiquidityCard.tsx')
    expect(add).not.toContain('0x963556de11697ddaae61460e815fcbcd84614778')
    expect(add).toContain('MARCO_BSC_ADDRESS')
    expect(add).toContain('CurrencySearchModal')
    expect(add).toContain('cycleSuggestedPair')
    expect(add).toMatch(/default suggestion only|never a forced pair/i)
  })

  it('Liquidity Building uses canonical MARCO + searchable custom token', () => {
    const lb = load('onePage/LiquidityBuildingCard.tsx')
    expect(lb).not.toContain('0x963556de11697ddaae61460e815fcbcd84614778')
    expect(lb).toContain('MARCO_BSC_ADDRESS')
    expect(lb).toContain('CurrencySearchModal')
    expect(lb).toContain('lb-token-select')
  })

  it('wallet LP discovery merges factory pairs', () => {
    const positions = load('liquidityRuntime/useLiquidityPositions.ts')
    const factory = load('liquidityRuntime/useFactoryLiquidityTokenPairs.ts')
    expect(factory).toContain('/api/indexer/pairs')
    expect(factory).toContain('fetchAllFactoryPairs')
    expect(positions).toContain('useFactoryLiquidityTokenPairs')
    expect(positions).toContain('discoveryTokenPairs')
  })

  it('does not ship production mock position arrays in recovery hooks', () => {
    const factory = load('liquidityRuntime/useFactoryLiquidityTokenPairs.ts')
    expect(factory).not.toMatch(/mockPairs|fakeLp|demoPositions|sampleReserves/i)
  })
})
