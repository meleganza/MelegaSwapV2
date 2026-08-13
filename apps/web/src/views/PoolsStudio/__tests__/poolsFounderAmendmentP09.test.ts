/**
 * Founder amendment P0-9 — Explore Pools density: same column targets as Farms,
 * compact card with redundant subtitle copy removed, Stake + View Pool fit inside.
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const STUDIO = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(STUDIO, rel), 'utf8')
}

describe('Founder amendment P0-9 — Explore Pools density grid', () => {
  it('keeps readable mobile-first density: 1 / 2 / 3 / 4', () => {
    const tokens = load('modules/poolsExplorePoolsTokens.ts')
    expect(tokens).toContain("smallTabletBreak: '768px'")
    expect(tokens).toContain("tabletPortraitBreak: '1025px'")
    expect(tokens).toContain("desktopBreak: '1200px'")
    expect(tokens).toContain("ultraWideBreak: '1920px'")

    const grid = load('modules/PoolsExplorePoolsModule.tsx')
    expect(grid).toContain('grid-template-columns: repeat(1, minmax(0, 1fr));')
    expect(grid).toMatch(/min-width: \$\{poolsExplore\.smallTabletBreak\}\)\s*\{\s*grid-template-columns: repeat\(2/)
    expect(grid).toMatch(/min-width: \$\{poolsExplore\.tabletPortraitBreak\}\)\s*\{\s*grid-template-columns: repeat\(3/)
    expect(grid).toMatch(/min-width: 1500px\)\s*\{\s*grid-template-columns: repeat\(4/)
    expect(grid).toMatch(/min-width: \$\{poolsExplore\.ultraWideBreak\}\)\s*\{\s*grid-template-columns: repeat\(4/)
  })

  it('removes the redundant description subtitle and keeps Stake + View Pool actions', () => {
    const card = load('modules/PoolsExplorePoolCard.tsx')
    expect(card).not.toContain('<Desc>')
    expect(card).not.toContain('pool.description')
    expect(card).toContain('Stake')
    expect(card).not.toContain('Manage')
    expect(card).not.toContain('pools-explore-manage')
    expect(card).toContain('View Pool')
    // Actions remain flexible/ellipsis-safe so both fit in the denser 4–5 up cards.
    expect(card).toMatch(/flex: 1 1 0;/)
    expect(card).toContain('text-overflow: ellipsis')
  })
})
