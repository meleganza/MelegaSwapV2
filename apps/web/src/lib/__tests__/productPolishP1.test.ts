import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { ECOSYSTEM_DESTINATIONS } from 'views/HomeTrade/ecosystemDestinations'

const SRC = path.resolve(process.cwd(), 'src')
const load = (rel: string) => readFileSync(path.join(SRC, rel), 'utf8')

describe('MELEGASWAP_V2_PRODUCT_POLISH_P1', () => {
  it('Home Top Pools never renders Unavailable string', () => {
    const home = load('views/HomeTrade/DexHomeScreen.tsx')
    const topPoolsStart = home.indexOf('Top Pools')
    const topPoolsEnd = home.indexOf('New Listings')
    const block = home.slice(topPoolsStart, topPoolsEnd)
    expect(block).toContain("row.tvl || '—'")
    expect(block).toContain("row.apr || '—'")
    expect(block).toContain("row.rewards || '—'")
    expect(block).not.toContain('METRIC_STATUS.UNAVAILABLE')
    expect(block).not.toContain('APR_UNAVAILABLE_LABEL')
  })

  it('Home Top Farms never renders Unavailable string', () => {
    const home = load('views/HomeTrade/DexHomeScreen.tsx')
    const farmsStart = home.indexOf('Top Farms')
    const farmsEnd = home.indexOf('Top Pools')
    const block = home.slice(farmsStart, farmsEnd)
    expect(block).toContain("row.tvl || '—'")
    expect(block).toContain("row.apr || '—'")
    expect(block).toContain("row.rewards || '—'")
    expect(block).not.toContain('METRIC_STATUS.UNAVAILABLE')
    expect(block).not.toContain('APR_UNAVAILABLE_LABEL')
  })

  it('Explore ecosystem maps Passport + Black with required copy', () => {
    const passport = ECOSYSTEM_DESTINATIONS.find((d) => d.id === 'passport')
    const black = ECOSYSTEM_DESTINATIONS.find((d) => d.id === 'blackpump')
    expect(passport?.title).toBe('PASSPORT')
    expect(passport?.subtitle).toBe('Identity & rewards.')
    expect(black?.title).toBe('BLACK')
    expect(black?.subtitle).toBe('Fair-launch infrastructure.')
  })

  it('Pools My Positions returns null when empty', () => {
    const mod = load('views/PoolsStudio/modules/PoolsMyPositionsModule.tsx')
    expect(mod).toContain("if (vm.state === 'empty')")
    expect(mod).toContain('return null')
    expect(mod).not.toContain('No pool positions yet')
  })

  it('Portfolio keeps slim product sections only', () => {
    const shell = load('views/PortfolioStudio/PortfolioStudioScreen.tsx')
    expect(shell).toContain('portfolio-section-assets')
    expect(shell).toContain('portfolio-section-positions')
    expect(shell).toContain('portfolio-section-rewards')
    expect(shell).toContain('portfolio-section-activity')
    expect(shell).toContain('portfolio-section-analytics')
    expect(shell).not.toContain('portfolio-section-account')
    expect(shell).not.toContain('data-passport')
  })

  it('Melega Modal Design System enforces premium popup geometry', () => {
    const modal = load('design-system/melega/components/Modal/MelegaModal.tsx')
    expect(modal).toContain("maxWidthMd: '740px'")
    expect(modal).toContain("maxHeight: 'min(82vh, 760px)'")
    expect(modal).toContain('MelegaLogoSvg')
    expect(modal).toContain('data-melega-modal-system')
    expect(modal).toContain('data-melega-modal-system="v3"')
  })
})
