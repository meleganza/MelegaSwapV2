/**
 * MELEGASWAP_V2_POST_RELEASE_P0_ROUTING_AND_RUNTIME_REPAIR — structural contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '../..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('Post-release P0 routing & runtime repair', () => {
  it('header primary nav uses navigatePrimary with hard-fallback (no stale Home)', () => {
    const header = load('design-system/melega/components/GlobalHeader/MelegaGlobalHeader.tsx')
    expect(header).toContain('navigatePrimary')
    expect(header).toContain('event.preventDefault()')
    expect(header).toContain('window.location.assign')
    expect(header).toContain('prefetch={false}')
    expect(header).toContain('melega-header-nav-')
  })

  it('route recovery hard-navigates on Abort/chunk failures and soft-nav stalls', () => {
    const recovery = load('hooks/useRouteTransitionRecovery.ts')
    expect(recovery).toContain('Abort fetching component for route')
    expect(recovery).toContain('window.location.assign')
    expect(recovery).toContain('routeChangeStart')
    expect(recovery).toContain('stall')
  })

  it('app does not nest BrowserRouter over Next history', () => {
    const app = load('pages/_app-full.tsx')
    expect(app).toContain('MemoryRouter as Router')
    expect(app).not.toContain('BrowserRouter')
  })

  it('Featured Trade uses filesystem project-hq route for client mount', () => {
    const rail = load('views/HomeTrade/FeaturedProjectsRail.tsx')
    expect(rail).toContain('/project-hq/${p.slug}')
    expect(rail).toContain('router.push(href, as)')
    expect(rail).not.toContain('router.push(`${p.href}?${q}`)')
  })

  it('chain pill is compact and cannot force 176px min-width over search', () => {
    const styles = load('app-shell/AppShellStyles.tsx')
    expect(styles).toContain('max-width: 78px !important')
    expect(styles).toContain('min-width: 0 !important')
    expect(styles).not.toContain('min-width: 176px !important')
    const switcher = load('components/NetworkSwitcher.tsx')
    expect(switcher).toContain("56: 'BSC'")
    expect(switcher).toContain("8453: 'Base'")
    expect(switcher).toContain("137: 'POL'")
    expect(switcher).toContain("43114: 'AVAX'")
  })

  it('trending bar clamps overflow inside the ticker container', () => {
    const bar = load('app-shell/GlobalTrendingBar.tsx')
    expect(bar).toContain('overflow-x: hidden')
    expect(bar).toContain('max-width: 100vw')
    expect(bar).not.toContain('overflow-x: auto')
    const ticker = load('design-system/melega/components/Ticker/MelegaTicker.tsx')
    expect(ticker).toContain('data-melega-ticker-track')
    expect(ticker).toContain('overflow-x: auto')
  })

  it('network errors do not auto-force BSC fallback', () => {
    const modal = load('components/NetworkModal/NetworkModal.tsx')
    expect(modal).not.toContain('switchNetworkLocal(ChainId.BSC)')
    const unsupported = load('components/NetworkModal/UnsupportedNetworkModal.tsx')
    expect(unsupported).toContain('never force BSC fallback')
    expect(unsupported).toContain('supportedMainnetChains[0]')
    const page = load('components/NetworkModal/PageNetworkSupportModal.tsx')
    expect(page).not.toContain('ShimmerEVM')
    expect(page).not.toContain('switchNetworkAsync(ChainId.BSC)')
    expect(page).toContain('useLocalNetworkChain')
  })
})
