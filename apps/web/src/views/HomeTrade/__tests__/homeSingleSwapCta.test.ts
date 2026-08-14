import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('Home hero CTAs — founder acquisition', () => {
  const src = readFileSync(join(__dirname, '../DexHomeScreen.tsx'), 'utf8')

  it('primary CTA lists projects; secondary opens Projects discovery (trending sort)', () => {
    expect(src).toMatch(/data-testid="dex-home-list-project"/)
    expect(src).toMatch(/List Your Project/)
    expect(src).toMatch(/data-testid="dex-home-open-trending"/)
    expect(src).toMatch(/Trending Projects/)
    expect(src).toMatch(/router\.push\('\/projects\?sort=trending'\)/)
    expect(src).not.toMatch(/router\.push\('\/trending'\)/)
  })

  it('does not render Instant Swap / Smart Swap hero buttons or Instant mode tabs on Home', () => {
    expect(src).not.toMatch(/Instant Swap/)
    expect(src).not.toMatch(/dex-home-start-trading/)
  })

  it('home swap panel is Smart-only', () => {
    const panel = readFileSync(join(__dirname, '../HomeSwapPanel.tsx'), 'utf8')
    expect(panel).toMatch(/Smart Swap/)
    expect(panel).toMatch(/experience: SwapExperienceMode = 'smart'/)
    expect(panel).not.toMatch(/TradeModeSelector/)
    expect(panel).not.toMatch(/'instant'/)
  })
})
