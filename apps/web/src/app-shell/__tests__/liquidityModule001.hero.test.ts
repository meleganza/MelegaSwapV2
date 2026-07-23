/**
 * LIQUIDITY_MODULE_001_HERO — shell Trending Bar + Liquidity Hero contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { createHash } from 'crypto'

const SRC = path.resolve(__dirname, '../..')
const WEB = path.resolve(SRC, '..')

function load(rel: string) {
  return readFileSync(path.join(SRC, rel), 'utf8')
}

function sha256(filePath: string) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex')
}

describe('LIQUIDITY_MODULE_001_HERO', () => {
  it('shell mounts exactly one GlobalTrendingBar using SafeTrendingRibbon', () => {
    const shell = load('app-shell/MelegaAppShell.tsx')
    const bar = load('app-shell/GlobalTrendingBar.tsx')
    expect(shell).toContain('GlobalTrendingBar')
    expect(shell).toContain('<GlobalTrendingBar')
    expect((shell.match(/GlobalTrendingBar/g) || []).length).toBeGreaterThanOrEqual(2)
    expect(bar).toContain('SafeTrendingRibbon')
    expect(bar).toContain("'44px'")
    expect(bar).toContain("'40px'")
    expect(bar).toContain('#0a0a0a')
    expect(bar).toContain('data-melega-global-trending-bar')
  })

  it('Liquidity Hero uses exact approved image path and locked copy', () => {
    const hero = load('views/LiquidityStudio/onePage/LiquidityPageHeader.tsx')
    expect(hero).toContain("/images/liquidity/liquidity-hero-background.png")
    expect(hero).toContain('background-size: cover')
    expect(hero).toContain('background-position: 72% 68%')
    expect(hero).toContain('<Title>Liquidity</Title>')
    expect(hero).toContain('Add liquidity manually or let Melega build it progressively for your project.')
    expect(hero).toContain('styled.h1')
    expect(hero).not.toContain('Connect Wallet')
    expect(hero).not.toContain('Start Liquidity Building')
    expect(hero).not.toContain('conic-gradient')
    expect(hero).not.toContain('@keyframes')
  })

  it('preserves approved background source bytes at public path', () => {
    const publicPath = path.join(WEB, 'public/images/liquidity/liquidity-hero-background.png')
    const approvedPath = path.join(
      WEB,
      'docs/runtime/liquidity-module-001-hero/approved-background-source.png',
    )
    expect(existsSync(publicPath)).toBe(true)
    expect(existsSync(approvedPath)).toBe(true)
    expect(sha256(publicPath)).toBe(sha256(approvedPath))
  })

  it('product modules remain free of hero/trending edits', () => {
    const files = [
      'views/LiquidityStudio/onePage/LiquidityBuildingCard.tsx',
      'views/LiquidityStudio/onePage/AddLiquidityCard.tsx',
      'views/LiquidityStudio/onePage/DexLiquiditySnapshot.tsx',
      'views/LiquidityStudio/onePage/WalletLiquidityOverview.tsx',
      'views/LiquidityStudio/onePage/LiquidityPositions.tsx',
      'views/LiquidityStudio/onePage/LiquidityEducationRail.tsx',
    ]
    for (const f of files) {
      const src = load(f)
      expect(src).not.toContain('liquidity-hero-background')
      expect(src).not.toContain('GlobalTrendingBar')
    }
  })
})