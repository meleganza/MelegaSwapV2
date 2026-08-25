import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '../..')
const read = (relative: string) => readFileSync(path.join(ROOT, relative), 'utf8')

const HEADER = 'design-system/melega/components/GlobalHeader/MelegaGlobalHeader.tsx'
const SHELL = 'app-shell/MelegaAppShell.tsx'
const CONNECT = 'components/MarcoWidgets/MarcoConnect.tsx'
const CONNECT_BUTTON = 'components/ConnectWalletButton.tsx'
const USER_MENU = 'components/Menu/UserMenu/index.tsx'
const MENU = 'components/Menu/index.tsx'
const FULL_APP = 'app-runtime/FullMyApp.tsx'

const PRINCIPAL_PUBLIC_PAGES = [
  'pages/index.tsx',
  'pages/swap/index.tsx',
  'pages/bridge/index.tsx',
  'pages/liquidity.tsx',
  'pages/farms/index.tsx',
  'pages/pools/index.tsx',
]

const countMatches = (source: string, pattern: RegExp) => source.match(pattern)?.length ?? 0

describe('canonical wallet surface — duplicate floating connector regression', () => {
  it('mounts exactly one MARCO Connect widget, parked in the canonical header', () => {
    const header = read(HEADER)
    const shell = read(SHELL)
    const menu = read(MENU)
    const app = read(FULL_APP)

    expect(countMatches(header, /<MarcoConnect\b/g)).toBe(1)
    expect(header).toContain('<MarcoConnect size="navbar" />')
    expect(header).toContain('data-testid="melega-header-connect"')
    expect(header).toContain('data-wallet-surface="canonical"')
    expect(header).toContain('data-marco-connect-parked={address ? \'true\' : \'false\'}')
    expect(header).toContain('hidden={Boolean(address)}')
    expect(header).toContain('{address ? <UserMenu /> : null}')

    expect(shell).not.toContain('MarcoConnect')
    expect(shell).not.toContain('components/MarcoWidgets')
    expect(countMatches(shell, /<MarcoConnect\b/g)).toBe(0)
    expect(countMatches(menu, /<MarcoConnect\b/g)).toBe(0)
    expect(countMatches(app, /<MarcoConnect\b/g)).toBe(0)
  })

  it('does not declare a floating or bottom-right MARCO CONNECT surface in app chrome', () => {
    const header = read(HEADER)
    const shell = read(SHELL)
    const connect = read(CONNECT)

    expect(header).not.toContain('size="floating"')
    expect(shell).not.toContain('size="floating"')
    expect(connect).not.toContain('size="floating"')
    expect(connect).not.toContain("size: 'floating'")
    expect(`${header}\n${shell}`).not.toMatch(/position:\s*fixed[\s\S]{0,180}bottom:\s*0/)
    expect(`${header}\n${shell}`).not.toMatch(/MARCO CONNECT/)
    expect(shell).not.toContain('data-marco-connect-fallback-anchor')
    expect(header).not.toContain('data-marco-connect-fallback-anchor')
  })

  it('keeps the header wallet operational in disconnected and connected states', () => {
    const header = read(HEADER)
    const connect = read(CONNECT)
    const userMenu = read(USER_MENU)
    const connectButton = read(CONNECT_BUTTON)

    expect(connect).toContain('Connect Wallet')
    expect(connect).toContain('melega-shell-connect')
    expect(connect).toContain('<ConnectWalletButton')
    expect(connect).not.toMatch(/if \(address\) return null/)
    expect(connect).toContain('hidden={Boolean(address)}')
    expect(connect).toContain('sweepFloatingFallbackAnchors')
    expect(connect).toContain("[data-marco-connect-fallback-anchor]")

    expect(header).toContain('<UserMenu />')
    expect(userMenu).toContain('account={account}')
    expect(userMenu).toContain("{t('Disconnect')}")
    expect(userMenu).toContain('<WalletModal')

    expect(connectButton).toContain('WalletModalV2')
    expect(connectButton).toContain('setOpen(true)')
    expect(connectButton).toContain('preloadConnectWalletModal')
  })

  it('preserves mobile connect without a second widget mount', () => {
    const shell = read(SHELL)
    expect(shell).toContain('ConnectWalletButton')
    expect(shell).toContain('melega-shell-mobile-connect')
    expect(shell).toContain('>Connect</ConnectWalletButton>')
    expect(shell).toContain('<UserMenu />')
    expect(shell).not.toContain('size="icon"')
  })

  it('principal public routes inherit the shared shell wallet surface', () => {
    const app = read(FULL_APP)
    expect(app).toContain('import Menu from')
    expect(app).toContain('const ShowMenu = Component.mp ? Fragment : Menu')

    for (const page of PRINCIPAL_PUBLIC_PAGES) {
      expect(existsSync(path.join(ROOT, page)), page).toBe(true)
      const source = read(page)
      expect(source).not.toMatch(/hideMenu\s*=\s*true/)
      expect(source).not.toMatch(/barePage\s*=\s*true/)
      expect(source).not.toMatch(/<MarcoConnect\b/)
      expect(source).not.toContain('size="floating"')
    }
  })
})
