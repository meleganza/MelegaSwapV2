import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const SRC = path.resolve(process.cwd(), 'src')
const load = (relative: string) => readFileSync(path.join(SRC, relative), 'utf8')

describe('canonical hero seam and clipping repair', () => {
  const liquidity = load('views/LiquidityStudio/v3/LiquidityStudioV3Shell.tsx')
  const liquidityArt = load('views/LiquidityStudio/v3/LiquidityHeroArtwork.tsx')
  const farms = load('views/FarmsStudio/modules/FarmsHeroModule.tsx')
  const farmsArt = load('views/FarmsStudio/modules/FarmsHeroArtwork.tsx')
  const farmsTokens = load('views/FarmsStudio/modules/farmsHeroTokens.ts')
  const poolsArt = load('views/PoolsStudio/modules/PoolsHeroArtwork.tsx')

  it('Liquidity keeps equal vertical padding and removes the wrapped submerged control', () => {
    expect(liquidity).toContain('padding: 16px 20px')
    expect(liquidity).not.toContain('liquidity-v3-explore-pools')
    expect(liquidity).not.toContain('Explore pools ↓')
  })

  it('Liquidity artwork extends under the hero crop and feathers its left join', () => {
    expect(liquidityArt).toContain('width: calc(100% + 56px)')
    expect(liquidityArt).toContain('height: calc(100% + 32px)')
    expect(liquidityArt).toContain('mask-image: linear-gradient(90deg')
  })

  it('Farms copy uses two lines and its controls remain inside balanced padding', () => {
    expect(farms).toContain('padding: 16px 20px')
    expect(farmsTokens).toContain("description: 'Stake LP tokens and earn farming rewards.\\nGrow liquidity across Melega DEX.'")
    expect(farms).toContain('height: 100%')
    expect(farms).toContain('align-self: center')
  })

  it('Farms and Pools raster artwork fills an oversized feathered frame', () => {
    expect(farmsArt).toContain('width: calc(100% + 80px)')
    expect(farmsArt).toContain('object-fit: cover')
    expect(farmsArt).toContain('mask-image: linear-gradient(90deg')
    expect(poolsArt).toContain('width: calc(100% + 88px)')
    expect(poolsArt).toContain('height: calc(100% + 32px)')
    expect(poolsArt).toContain('mask-image: linear-gradient(90deg')
  })
})
