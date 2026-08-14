import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const WEB = path.resolve(process.cwd(), 'src')
const load = (relativePath: string) => readFileSync(path.join(WEB, relativePath), 'utf8')

describe('isolated MARCO Bridge production surface', () => {
  const page = load('pages/bridge/index.tsx')
  const workspace = load('views/MarcoBridge/MarcoBridgeWorkspace.tsx')

  it('mounts only the dedicated Bridge workspace', () => {
    expect(page).toContain('MarcoBridgeWorkspace')
    expect(page).toContain('PageMeta title="MARCO Bridge"')
    expect(page).not.toContain('HomeTrade')
    expect(page).not.toContain('FarmsStudio')
    expect(page).not.toContain('PoolsStudio')
    expect(page).not.toContain('LiquidityStudio')
  })

  it('matches the certified hero geometry and typography', () => {
    expect(workspace).toContain("const HERO_HEIGHT = '260px'")
    expect(workspace).toContain("const HERO_LEFT = '440px'")
    expect(workspace).toContain("const HERO_ART = '480px'")
    expect(workspace).toContain("const HERO_STATUS = '360px'")
    expect(workspace).toContain('font-size: 52px')
    expect(workspace).toContain('line-height: 58px')
    expect(workspace).toContain('data-bridge-hero-geometry="1376x260"')
  })

  it('uses the approved artwork with compositor-only motion and reduced-motion support', () => {
    expect(workspace).toContain('/images/bridge/marco-bridge-hero.webp')
    expect(workspace).toContain('data-animation-cost="transform-only"')
    expect(workspace).toContain('prefers-reduced-motion: reduce')
    expect(workspace).toContain('will-change: transform')
  })
})
