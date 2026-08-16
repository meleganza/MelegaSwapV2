import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const ROOT = path.resolve(__dirname, '../..')
const load = (relative: string) => readFileSync(path.join(ROOT, relative), 'utf8')

describe('final mobile-only UX containment', () => {
  it('keeps the compact MARCO control inside the mobile header', () => {
    const styles = load('app-shell/AppShellStyles.tsx')
    expect(styles).toContain('.melega-shell-mobile-connect')
    expect(styles).toContain('min-width: 40px !important')
    expect(styles).toContain('max-width: 40px !important')
  })

  it('opens Passport only from the explicit connected control and synchronizes disconnect', () => {
    const connect = load('components/MarcoWidgets/MarcoConnect.tsx')
    expect(connect).toContain('openMarcoPassport(sdk)')
    expect(connect).toContain('if (sdk.getState().connected) sdk.open()')
    expect(connect).toContain("sdk.on('disconnect', () => disconnect())")
    expect(connect).not.toContain('onPointerEnter')
    expect(connect).not.toContain('onPointerDownCapture')
  })

  it('uses full-bleed masked artwork only inside the canonical 767px mobile breakpoint', () => {
    const farms = load('views/FarmsStudio/modules/FarmsHeroModule.tsx')
    const farmsArt = load('views/FarmsStudio/modules/FarmsHeroArtwork.tsx')
    const liquidity = load('views/LiquidityStudio/v3/LiquidityHeroArtwork.tsx')
    expect(farms).toContain('position: absolute;')
    expect(farms).toContain('inset: -16px;')
    expect(farmsArt).toContain('rgba(0, 0, 0, 0.72) 60%')
    expect(liquidity).toContain('rgba(0, 0, 0, 0.72) 60%')
  })

  it('keeps the vertical featured project card fully contained and offset on mobile', () => {
    const swap = load('views/Trade/components/TradeSwapHero.tsx')
    expect(swap).toContain('right: 10px;')
    expect(swap).toContain('width: 164px;')
    expect(swap).toContain('flex: 0 0 100%;')
  })
})
