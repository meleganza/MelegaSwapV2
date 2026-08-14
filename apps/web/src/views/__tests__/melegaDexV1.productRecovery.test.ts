/**
 * MELEGA_DEX_V1 — cumulative product recovery gates (no redesign).
 */
import { createHash } from 'crypto'
import { existsSync, readFileSync, readdirSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const WEB = path.resolve(__dirname, '../../../')
const REPO = path.resolve(__dirname, '../../../../../')

function load(rel: string) {
  return readFileSync(path.join(WEB, rel), 'utf8')
}

describe('MELEGA_DEX_V1 Certified Product Recovery', () => {
  it('mounts certified Farms / Pools / Liquidity / List / Passport surfaces', () => {
    expect(load('src/pages/farms/index.tsx')).toContain('FarmsStudioScreen')
    expect(load('src/views/FarmsStudio/FarmsStudioScreen.tsx')).toContain('FarmsHeroModule')
    expect(load('src/views/FarmsStudio/FarmsStudioScreen.tsx')).not.toContain('FarmsGrid')

    expect(load('src/pages/pools/index.tsx')).toContain('PoolsStudioScreen')
    expect(load('src/views/PoolsStudio/PoolsStudioScreen.tsx')).toContain('PoolsHeroModule')
    expect(load('src/views/PoolsStudio/PoolsStudioScreen.tsx')).not.toContain('PoolsGrid')

    const liq = load('src/pages/liquidity.tsx')
    expect(liq).toContain('LiquidityStudioV3Shell')
    expect(liq).not.toContain('LiquidityAnalyticsModule')
    expect(liq).not.toContain("import Liquidity from 'views/Pool'")

    expect(load('src/pages/list/index.tsx')).toContain('ListStudioScreen')
    expect(load('src/pages/passport/index.tsx')).toContain('PassportV1Shell')
    expect(load('src/views/Passport/v1/PassportV1Shell.tsx')).toContain('data-passport-rebuild')
    expect(load('src/views/Passport/_archived_wave04_consumer/PassportScreen.tsx')).toContain('usePassportHeroIdentity')

    const studioAlias = load('src/pages/liquidity-studio.tsx')
    expect(studioAlias).toMatch(/from ['"]\.\/liquidity['"]/)
    expect(studioAlias).not.toContain('LiquidityStudioScreen')
  })

  it('restores certified Home Instant|Smart terminal without duplicate hero CTAs', () => {
    const dex = load('src/views/HomeTrade/DexHomeScreen.tsx')
    expect(dex).not.toMatch(/Instant Swap/)
    expect(dex).not.toMatch(/Smart Swap →/)
    expect(dex).toContain('Single Swap entry')
    const panel = load('src/views/HomeTrade/HomeSwapPanel.tsx')
    expect(panel).toContain('TradeModeSelector')
    expect(panel).toContain('SmartSwapForm')
    expect(panel).toContain('SmartSwapExecutionPreviewModule')
  })

  it('pools wallet hook retains last-good and does not clobber with empty', () => {
    const hook = load('src/views/PoolsStudio/modules/usePoolsWalletPositions.ts')
    expect(hook).toMatch(/lastGoodByScope|lastGoodRef/)
    expect(hook).toContain('generationRef')
    expect(hook).toContain('Never replace a non-empty last-good')
    expect(hook).toContain('scopeKey')
  })

  it('forbids production mock fixture producers in restored studios', () => {
    const banned = ['mockPositions', 'mockAnalytics', 'fakeApr', 'fakeTvl', 'getPoolsUxFixtureCards']
    const roots = [
      'src/views/FarmsStudio/modules',
      'src/views/PoolsStudio/modules',
      'src/views/LiquidityStudio/modules',
      'src/views/HomeTrade',
    ]
    const hits: string[] = []
    for (const root of roots) {
      const abs = path.join(WEB, root)
      if (!existsSync(abs)) continue
      const walk = (dir: string) => {
        for (const ent of readdirSync(dir, { withFileTypes: true })) {
          if (ent.name === '__tests__' || ent.name === 'node_modules') continue
          const p = path.join(dir, ent.name)
          if (ent.isDirectory()) walk(p)
          else if (/\.(ts|tsx)$/.test(ent.name)) {
            const src = readFileSync(p, 'utf8')
            // allow fixture helper file name only if not imported as production enablement for UI
            for (const b of banned) {
              if (b === 'getPoolsUxFixtureCards' && ent.name.includes('poolsUxFixture')) continue
              if (src.includes(b) && !ent.name.includes('.test.')) hits.push(`${p}:${b}`)
            }
          }
        }
      }
      walk(abs)
    }
    expect(hits).toEqual([])
  })

  it('ships recovery evidence pack + ancestry forensics', () => {
    const ev = path.join(WEB, 'docs/runtime/melega-dex-v1-certified-product-recovery-and-production-convergence')
    expect(existsSync(path.join(ev, 'production-deployment-forensics.json'))).toBe(true)
    expect(existsSync(path.join(ev, 'certified-product-ancestry.json'))).toBe(true)
    expect(existsSync(path.join(WEB, 'docs/runtime/CERTIFIED_PRODUCT_ANCESTRY_REPORT.md'))).toBe(true)
    const forensics = JSON.parse(readFileSync(path.join(ev, 'production-deployment-forensics.json'), 'utf8'))
    expect(forensics.githubDeployments.productionLatest.shortSha).toBe('2a887252')
  })

  it('does not modify Router address constants in recovery', () => {
    const exchange = load('src/config/constants/exchange.ts')
    expect(exchange).toContain('0xc25033218D181b27D4a2944Fbb04FC055da4EAB3')
    // Recovery must not rewrite exchange.ts / contracts.ts (byte-frozen vs mission base)
    expect(exchange).not.toContain('MOCK_ROUTER')
  })
})
