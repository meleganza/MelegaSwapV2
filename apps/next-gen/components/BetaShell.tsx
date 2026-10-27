import React from 'react'
import Head from 'next/head'
import { AppIcon, type AppIconName } from './AppIcon'
import { uxSectionById, type UxSectionId } from '../lib/uxSections'

const NAV_ITEMS: Array<{ label: string; href: string; icon: AppIconName; sections: UxSectionId[] }> = [
  { label: 'Trade', href: '/', icon: 'trade', sections: ['swap', 'bridge'] },
  { label: 'Earn', href: '/earn', icon: 'earn', sections: ['earn'] },
  { label: 'Portfolio', href: '/portfolio', icon: 'portfolio', sections: ['portfolio'] },
  { label: 'Explore', href: '/explore', icon: 'explore', sections: ['explore'] },
]

function Brand() {
  return (
    <a className="brand" href="/" aria-label="MelegaDex Evo home">
      <img className="brand-mark" src="/brand/melega-badge-flat.png" alt="" width="44" height="44" />
      <span className="brand-copy">
        <strong>MelegaDex</strong>
        <em>Evo</em>
      </span>
    </a>
  )
}

function ProductNavigation({ section, className }: { section: UxSectionId; className: string }) {
  return (
    <nav className={className} aria-label="Primary">
      {NAV_ITEMS.map((item) => {
        const current = item.sections.includes(section)
        return (
          <a key={item.label} href={item.href} aria-current={current ? 'page' : undefined}>
            <AppIcon name={item.icon} />
            <span>{item.label}</span>
          </a>
        )
      })}
    </nav>
  )
}

export function BetaShell({ section, children }: { section: UxSectionId; children: React.ReactNode }) {
  const current = uxSectionById(section)
  const [theme, setTheme] = React.useState<'pearl' | 'graphite'>('pearl')

  function toggleTheme() {
    setTheme((currentTheme) => {
      const next = currentTheme === 'pearl' ? 'graphite' : 'pearl'
      window.localStorage.setItem('melega-evo-theme', next)
      return next
    })
  }
  return (
    <div className="app-shell" data-layout="responsive-app" data-section={section} data-theme={theme}>
      <Head>
        <title>{`${current.title} · MelegaDex Evo`}</title>
      </Head>
      <a className="skip" href="#content">
        Skip to content
      </a>

      <aside className="sidebar">
        <Brand />
        <ProductNavigation section={section} className="desktop-nav" />
        <div className="sidebar-foot">
          <a className="advanced-link" href="/tools" aria-current={section === 'tools' ? 'page' : undefined}>
            <AppIcon name="advanced" />
            <span>Tools</span>
          </a>
          <div className="protected-note">
            <AppIcon name="shield" />
            <span>
              <strong>Beta — read-only</strong>
            </span>
          </div>
        </div>
      </aside>

      <div className="app-stage">
        <header className="mobile-header">
          <Brand />
          <div className="header-actions">
            <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Use ${theme === 'pearl' ? 'Graphite Premium' : 'Pearl Minimal'} theme`}><span aria-hidden="true">{theme === 'pearl' ? '◐' : '☀'}</span></button>
            <a className="mobile-console" href="/tools" aria-label="Open Tools"><AppIcon name="advanced" /></a>
          </div>
        </header>
        <p className="mobile-readonly">Beta — read-only</p>
        <header className="topbar">
          <p>MelegaDex Evo</p>
          <div className="header-actions"><button className="theme-toggle theme-toggle-wide" type="button" onClick={toggleTheme}><span aria-hidden="true">{theme === 'pearl' ? '◐' : '☀'}</span>{theme === 'pearl' ? 'Graphite' : 'Pearl'}</button><span className="environment-pill"><span aria-hidden="true" /> Beta — read-only</span></div>
        </header>

        <main className="main" id="content">
          {children}
          <footer className="product-footer">
            <p>© Melega Finance</p>
            <nav className="footer-links" aria-label="Resources">
              <a href="https://docs.melega.finance/" rel="noreferrer noopener" referrerPolicy="no-referrer">Docs</a>
              <a href="https://x.com/meleganews" rel="noreferrer noopener" referrerPolicy="no-referrer" aria-label="Melega on X">X</a>
              <a href="https://t.me/melegacommunity" rel="noreferrer noopener" referrerPolicy="no-referrer">Telegram</a>
              <a href="https://www.melega.finance" rel="noreferrer noopener" referrerPolicy="no-referrer">Live DEX</a>
            </nav>
          </footer>
        </main>
      </div>

      <ProductNavigation section={section} className="mobile-nav" />
      <nav className="secondary sr-only" aria-label="Secondary">
        <a href="/tools">Tools</a>
      </nav>
    </div>
  )
}
