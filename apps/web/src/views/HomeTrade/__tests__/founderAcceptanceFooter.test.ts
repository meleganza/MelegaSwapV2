/**
 * Home Founder acceptance — footer, docs/audit destinations, live ecosystem links.
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  MELEGA_FOOTER_COPYRIGHT,
  MELEGA_FOOTER_NAV,
  MELEGA_FOOTER_SOCIALS,
} from '../melegaDexFooterLinks'
import { ECOSYSTEM_DESTINATIONS } from '../ecosystemDestinations'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('Founder acceptance — MelegaDexFooter', () => {
  it('uses exact Melega Labs copyright', () => {
    expect(MELEGA_FOOTER_COPYRIGHT).toBe('© 2026 Melega Labs. All rights reserved.')
  })

  it('links Docs → /docs and Audit → /audit', () => {
    expect(MELEGA_FOOTER_NAV.find((n) => n.label === 'Docs')?.href).toBe('/docs')
    expect(MELEGA_FOOTER_NAV.find((n) => n.label === 'Audit')?.href).toBe('/audit')
    expect(MELEGA_FOOTER_NAV.find((n) => n.label === 'Support')?.href).toBe('/support')
  })

  it('includes required social URLs (icons only, no raw URL labels)', () => {
    const hrefs = MELEGA_FOOTER_SOCIALS.map((s) => s.href)
    expect(hrefs).toEqual(
      expect.arrayContaining([
        'https://x.com/meleganews',
        'https://t.me/melegacommunity',
        'https://t.me/melegachannel',
        'https://coinmarketcap.com/community/profile/melegalabs',
        'https://www.binance.com/en/square/profile/MelegaSwap',
        'https://www.publish0x.com/@MelegaSwap',
        'https://www.youtube.com/@melega.finance',
        'https://www.instagram.com/melega.finance/',
        'https://medium.com/@melega',
        'https://github.com/meleganza/melegaswap',
      ]),
    )
    expect(MELEGA_FOOTER_SOCIALS).toHaveLength(10)
  })

  it('is mounted globally via MelegaAppShell; TrustRail remains removed from Home', () => {
    const home = load('DexHomeScreen.tsx')
    const shell = readFileSync(path.resolve(ROOT, '../../app-shell/MelegaAppShell.tsx'), 'utf8')
    expect(shell).toContain('MelegaDexFooter')
    expect(shell).toContain('melega-global-footer')
    expect(home).not.toContain('MelegaDexFooter')
    expect(home).not.toContain('TrustRail')
    expect(home).not.toContain('dex-home-trust-rail')
    expect(home).not.toContain('Backed by')
    expect(home).not.toContain('Security Score')
  })
})


describe('Founder acceptance — ecosystem destinations', () => {
  it('wires live destinations without false Coming soon', () => {
    const live = ECOSYSTEM_DESTINATIONS.filter((d) => !d.disabled)
    expect(live.map((d) => d.id)).toEqual(
      expect.arrayContaining(['passport', 'smartdrop', 'labs', 'space', 'radar']),
    )
    expect(live.find((d) => d.id === 'passport')?.href).toBe('https://marco.melega.ai')
    expect(live.find((d) => d.id === 'smartdrop')?.href).toBe('https://smartdrop.melega.ai/dashboard')
    expect(live.find((d) => d.id === 'labs')?.href).toBe('https://labs.melega.ai/labs')
    expect(live.find((d) => d.id === 'space')?.href).toBe('https://melega.space/')
    expect(live.find((d) => d.id === 'radar')?.href).toBe('/radar')

    for (const d of live) {
      expect(d.disabled).toBeFalsy()
      expect(d.href).toBeTruthy()
    }
  })

  it('keeps Maiora honestly disabled without inventing a URL', () => {
    const maiora = ECOSYSTEM_DESTINATIONS.find((d) => d.id === 'maiora')
    expect(maiora?.disabled).toBe(true)
    expect(maiora?.href).toBeUndefined()
  })

  it('ExploreMelegaEcosystem does not mark live products Coming soon', () => {
    const eco = load('ExploreMelegaEcosystem.tsx')
    expect(eco).not.toMatch(/comingSoon:\s*true/)
    expect(eco).not.toContain('Coming soon')
    expect(eco).toContain('ECOSYSTEM_DESTINATIONS')
  })
})

describe('Founder acceptance — docs and audit pages', () => {
  it('docs page exists with Factory/Router presentation addresses', () => {
    const docs = readFileSync(
      path.resolve(__dirname, '../../../pages/docs/index.tsx'),
      'utf8',
    )
    expect(docs).toContain("title: 'Home'")
    expect(docs).toContain("title: 'Instant Swap'")
    expect(docs).toContain("title: 'Smart Swap'")
    expect(docs).toContain('MELEGA_FACTORY_BSC')
    expect(docs).toContain('MELEGA_ROUTER_BSC')
    expect(docs).toContain("from 'lib/bsc-indexer/constants'")
    // Constants resolve to these canonical BSC addresses at runtime.
    const constants = readFileSync(
      path.resolve(__dirname, '../../../lib/bsc-indexer/constants.ts'),
      'utf8',
    )
    expect(constants).toContain("MELEGA_FACTORY_BSC = '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C'")
    expect(constants).toContain("MELEGA_ROUTER_BSC = '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3'")
  })

  it('audit page states telemetry-only and does not fabricate scores', () => {
    const audit = readFileSync(
      path.resolve(__dirname, '../../../pages/audit/index.tsx'),
      'utf8',
    )
    expect(audit).toContain('not</strong> a substitute for an external')
    expect(audit).toContain('Not published')
    expect(audit).toContain('MELEGA_MASTERCHEF_BSC')
    expect(audit).toContain('MELEGA_VAULT_BSC')
    expect(audit).toContain('/api/runtime/readiness')
    expect(audit).toContain('/api/indexer/health')
    expect(audit).not.toMatch(/audit score:\s*\d+/i)
  })

  it('support page exists without fabricating ticket infrastructure', () => {
    const support = readFileSync(
      path.resolve(__dirname, '../../../pages/support/index.tsx'),
      'utf8',
    )
    expect(support).toContain('Support')
    expect(support).toContain('/docs')
    expect(support).toContain('/audit')
    expect(support).toContain('MELEGA_FOOTER_SOCIALS')
    expect(support).toContain('telegram-community')
    expect(support).not.toMatch(/submit a ticket/i)
    expect(support).not.toMatch(/zendesk|intercom|freshdesk/i)
  })
})
