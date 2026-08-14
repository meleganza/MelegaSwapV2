/**
 * MELEGASWAP_V2_HEADER_SEARCH_CHAIN_UX_POLISH
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { HEADER_CHAIN_COMPACT } from 'components/NetworkSwitcher'
import { buildGlobalSearchIndex } from 'lib/global-search/buildGlobalSearchIndex'
import { searchGlobal } from 'lib/global-search/searchGlobal'

const ROOT = path.resolve(__dirname, '../..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('MELEGASWAP_V2_HEADER_SEARCH_CHAIN_UX_POLISH', () => {
  it('header chain compact labels — POL not Polygon; never BNB Smart Chain in pill', () => {
    expect(HEADER_CHAIN_COMPACT[56]).toBe('BSC')
    expect(HEADER_CHAIN_COMPACT[8453]).toBe('Base')
    expect(HEADER_CHAIN_COMPACT[137]).toBe('POL')
    expect(HEADER_CHAIN_COMPACT[1]).toBe('ETH')
    expect(HEADER_CHAIN_COMPACT[42161]).toBe('ARB')
    expect(HEADER_CHAIN_COMPACT[43114]).toBe('AVAX')
    const switcher = load('components/NetworkSwitcher.tsx')
    expect(switcher).toContain("137: 'POL'")
    expect(HEADER_CHAIN_COMPACT[56]).not.toContain('Smart Chain')
    Object.values(HEADER_CHAIN_COMPACT).forEach((label) => {
      expect(label).not.toMatch(/Smart Chain/i)
    })
    const header = load('design-system/melega/components/GlobalHeader/MelegaGlobalHeader.tsx')
    expect(header).toContain('melega-header-chain')
    expect(header).toContain('max-width: 78px')
  })

  it('network switch modal is compact with LIVE + PREPARING', () => {
    const modal = load('components/Menu/UserMenu/NetworkSwitchModal.tsx')
    expect(modal).toContain('MelegaModal')
    expect(modal).toContain('size="sm"')
    expect(modal).toContain('network-switch-live')
    expect(modal).toContain('network-switch-preparing')
    expect(modal).toContain('headerChainLabel')
    expect(modal).not.toContain('BNB Smart Chain')
  })

  it('search supports tokens/projects/pools/farms/contracts with chain identity + actions', () => {
    const index = buildGlobalSearchIndex()
    const tokens = index.filter((e) => e.category === 'token')
    expect(tokens.length).toBeGreaterThan(0)
    expect(tokens.every((t) => t.id.includes(`${t.chainId}-`))).toBe(true)
    expect(tokens.some((t) => (t.actions ?? []).some((a) => a.label === 'Trade'))).toBe(true)

    const projects = index.filter((e) => e.category === 'project')
    expect(projects.some((p) => (p.actions ?? []).some((a) => a.label === 'Open Project'))).toBe(true)

    const farms = index.filter((e) => e.category === 'farm')
    expect(farms.some((f) => (f.actions ?? []).some((a) => a.label === 'View Farm'))).toBe(true)

    const pools = index.filter((e) => e.category === 'pool')
    expect(pools.some((p) => (p.actions ?? []).some((a) => a.label === 'View Pool'))).toBe(true)

    const ui = load('app-shell/components/GlobalSearch.tsx')
    expect(ui).toContain('Search tokens, projects, pools...')
    expect(ui).toContain('MelegaExploreChainBadge')
    expect(ui).toContain('data-global-search-actions')
  })

  it('wallet wrong-network targets local chain — no hardcoded BSC switch', () => {
    const wrong = load('components/Menu/UserMenu/WalletWrongNetwork.tsx')
    expect(wrong).toContain('useLocalNetworkChain')
    expect(wrong).toContain('headerChainLabel')
    expect(wrong).not.toContain('switchNetworkAsync(ChainId.BSC)')
    expect(wrong).toContain('do not assume BSC')

    const info = load('components/Menu/UserMenu/WalletInfo.tsx')
    expect(info).toContain('headerChainLabel')
    expect(info).toContain('wallet-info-chain')
    expect(info).toContain('{headerChainLabel(chain.id)}')
  })

  it('global error boundary never tells users to switch to BSC generically', () => {
    const src = load('components/ErrorBoundary/SentryErrorBoundary.tsx')
    expect(src).not.toMatch(/switch network to BSC Network/i)
    expect(src).toContain('Retry')
    expect(src).toContain('Technical details')
    expect(src).toContain('do not assume BSC')
  })

  it('search never merges same symbol across chains', () => {
    const marco = searchGlobal(buildGlobalSearchIndex(), 'marco').filter((r) => r.category === 'token')
    const ids = new Set(marco.map((r) => r.id))
    expect(ids.size).toBe(marco.length)
    marco.forEach((r) => {
      expect(r.chainId == null || r.address == null || r.id.includes(String(r.chainId))).toBe(true)
    })
  })
})
