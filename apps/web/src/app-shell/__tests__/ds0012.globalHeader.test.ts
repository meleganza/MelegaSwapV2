import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import {
  FARMS_DROPDOWN_ITEMS,
  GLOBAL_HEADER_NAV,
  LIQUIDITY_DROPDOWN_ITEMS,
  MORE_DROPDOWN_ITEMS,
  POOLS_DROPDOWN_ITEMS,
} from '../config/globalHeaderNav'
import { ds001Layout } from 'design-system/melega/tokens/ds001'

const ROOT = path.resolve(__dirname, '../..')

describe('DS001.2 global header shell contracts', () => {
  it('exports 72px header height from DS001 layout and GlobalHeader source', () => {
    expect(ds001Layout.headerHeight).toBe('72px')
    const header = readFileSync(
      path.join(ROOT, 'design-system/melega/components/GlobalHeader/MelegaGlobalHeader.tsx'),
      'utf8',
    )
    expect(header).toContain('export const MELEGA_APP_HEADER_HEIGHT = ds001Layout.headerHeight')
  })

  it('shell mounts MelegaGlobalHeader and removes desktop sidebar mount', () => {
    const shell = readFileSync(path.join(ROOT, 'app-shell/MelegaAppShell.tsx'), 'utf8')
    expect(shell).toContain('MelegaGlobalHeader')
    expect(shell).toContain('GlobalTrendingBar')
    expect(shell).toContain('data-melega-shell-no-sidebar')
    expect(shell).not.toMatch(/<MelegaSidebar[\s/>]/)
    expect(shell).toContain('MELEGA_APP_HEADER_HEIGHT')
    expect(shell).toContain('ds001Layout.contentMaxWidth')
    expect(shell).toContain('MyMelegaProvider')
    expect(shell).toContain('MyMelegaDrawer')
  })

  it('Liquidity deep-link destinations including Liquidity Building remain available', () => {
    expect(LIQUIDITY_DROPDOWN_ITEMS).toHaveLength(6)
    const labels = LIQUIDITY_DROPDOWN_ITEMS.map((i) => i.label)
    expect(labels).toEqual([
      'Liquidity Studio',
      'Add Liquidity',
      'Liquidity Building',
      'My Positions',
      'Remove Liquidity',
      'Simulation',
    ])
    const building = LIQUIDITY_DROPDOWN_ITEMS.find((i) => i.id === 'liquidity-building')
    expect(building?.href).toBe('/liquidity-studio?view=building')
    expect(building?.badge).toBe('NEW')
  })

  it('Farms and Pools deep-link destinations remain live', () => {
    expect(FARMS_DROPDOWN_ITEMS.map((i) => i.href)).toEqual(['/farms', '/farms?view=my', '/farms?view=explore'])
    expect(POOLS_DROPDOWN_ITEMS.map((i) => i.href)).toEqual(['/pools', '/pools?view=positions', '/pools?view=explore'])
    expect(POOLS_DROPDOWN_ITEMS.some((i) => /My Pools/i.test(i.label))).toBe(false)
  })

  it('primary navigation exposes every core DEX funnel in one click (Portfolio secondary)', () => {
    expect(GLOBAL_HEADER_NAV.map((i) => i.label)).toEqual([
      'Home',
      'Swap',
      'Bridge',
      'Liquidity',
      'Farms',
      'Pools',
      'List',
    ])
    expect(GLOBAL_HEADER_NAV.some((i) => i.label === 'Portfolio')).toBe(false)
  })

  it('secondary surfaces remain available via More overflow destinations', () => {
    expect(MORE_DROPDOWN_ITEMS.map((i) => i.label)).toEqual([
      'Trending Projects',
      'Identity Hub',
      'Identity Console',
      'Build Studio',
    ])
  })

  it('GlobalSearch placeholder matches approved mockup', () => {
    const search = readFileSync(path.join(ROOT, 'app-shell/components/GlobalSearch.tsx'), 'utf8')
    expect(search).toMatch(/Search tokens, projects, pools\.\.\./)
  })

  it('MARCO Connect replaces the wallet account control instead of rendering beside it', () => {
    const header = readFileSync(
      path.join(ROOT, 'design-system/melega/components/GlobalHeader/MelegaGlobalHeader.tsx'),
      'utf8',
    )
    const shell = readFileSync(path.join(ROOT, 'app-shell/MelegaAppShell.tsx'), 'utf8')
    expect(header).toContain('<MarcoConnect size="navbar" activation="desktop" />')
    expect(header).not.toContain('<UserMenu />')
    expect(header).not.toContain("from 'components/Menu/UserMenu'")
    expect(shell).toContain('<MarcoConnect size="icon" activation="mobile" />')
    expect(shell).not.toContain('<UserMenu />')
    expect(shell).not.toContain("from 'components/Menu/UserMenu'")
  })

  it('keeps the connected MARCO wallet control inside the 1024px desktop header', () => {
    const header = readFileSync(
      path.join(ROOT, 'design-system/melega/components/GlobalHeader/MelegaGlobalHeader.tsx'),
      'utf8',
    )
    const connect = readFileSync(path.join(ROOT, 'components/MarcoWidgets/MarcoConnect.tsx'), 'utf8')

    expect(header).toContain('max-width: 1100px')
    expect(header).toContain('width: 156px')
    expect(header).toContain('display: none;')
    expect(connect).toContain("$size === 'navbar' ? '164px'")
    expect(connect).toContain('max-width: 100%')
    expect(connect).toContain('position: absolute;')
    expect(connect).toContain('widgetVisible')
    expect(connect).toContain('$hidden={ready && widgetVisible && !failed}')
  })

  it('mounts only one official MARCO Connect runtime for the active viewport', () => {
    const header = readFileSync(
      path.join(ROOT, 'design-system/melega/components/GlobalHeader/MelegaGlobalHeader.tsx'),
      'utf8',
    )
    const shell = readFileSync(path.join(ROOT, 'app-shell/MelegaAppShell.tsx'), 'utf8')
    const connect = readFileSync(path.join(ROOT, 'components/MarcoWidgets/MarcoConnect.tsx'), 'utf8')

    expect(header).toContain('activation="desktop"')
    expect(shell).toContain('activation="mobile"')
    expect(connect).toContain("activation === 'desktop' ? '(min-width: 1024px)' : '(max-width: 1023px)'")
    expect(connect).toContain('if (!isActive || !hostRef.current) return undefined')
    expect(connect).toContain('media.addListener(sync)')
  })

  it('does not reopen wallet permissions from a passive MARCO session replay on navigation', () => {
    const connect = readFileSync(path.join(ROOT, 'components/MarcoWidgets/MarcoConnect.tsx'), 'utf8')

    expect(connect).toContain('walletIntentUntilRef')
    expect(connect).toContain('if (Date.now() > walletIntentUntilRef.current) return')
    expect(connect).toContain('onPointerDownCapture')
    expect(connect).toContain('onKeyDownCapture')
    expect(connect).toContain('walletSyncPendingRef')
    expect(connect).toContain('walletIntentUntilRef.current = 0')
    expect(connect).toContain('signature: false')
  })

  it('restores injected wallets only from a previously authorised passive session', () => {
    const eagerConnect = readFileSync(path.join(ROOT, 'hooks/useEagerConnect.ts'), 'utf8')

    expect(eagerConnect).toContain("method: 'eth_accounts'")
    expect(eagerConnect).not.toContain("method: 'eth_requestAccounts'")
    expect(eagerConnect).toContain('if (!persistedConnectorId && window.parent === window) return')
    expect(eagerConnect).toContain('if (!Array.isArray(accounts) || accounts.length === 0) return')
  })

  it('uses compact header priorities through 1399px without hiding wallet actions', () => {
    const header = readFileSync(
      path.join(ROOT, 'design-system/melega/components/GlobalHeader/MelegaGlobalHeader.tsx'),
      'utf8',
    )

    expect(header.match(/max-width: 1399px/g)?.length).toBeGreaterThanOrEqual(4)
    expect(header).toContain('data-testid="melega-header-connect"')
    expect(header).toContain('data-testid="melega-header-my-melega"')
  })

  it('header height remains sticky 72px contract', () => {
    expect(ds001Layout.headerHeight).toBe('72px')
  })
})
