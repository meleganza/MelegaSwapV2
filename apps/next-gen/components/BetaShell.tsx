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
    <a className="brand" href="/" aria-label="Melega Next Gen home">
      <span className="brand-mark" aria-hidden="true">
        M
      </span>
      <span className="brand-copy">
        <strong>MELEGA</strong>
        <small>DEX NEXT GEN</small>
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
  return (
    <div className="app-shell" data-layout="responsive-app" data-section={section}>
      <Head>
        <title>{`${current.title} · Melega Next Gen beta`}</title>
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
            <span>Advanced Console</span>
          </a>
          <div className="protected-note">
            <AppIcon name="shield" />
            <span>
              <strong>Protected beta</strong>
              Read-only environment
            </span>
          </div>
        </div>
      </aside>

      <div className="app-stage">
        <header className="mobile-header">
          <Brand />
          <a className="mobile-console" href="/tools" aria-label="Open Advanced Console">
            <AppIcon name="advanced" />
          </a>
        </header>
        <header className="topbar">
          <p>Protected product preview</p>
          <span className="environment-pill">
            <span aria-hidden="true" /> Beta · Read only
          </span>
        </header>

        <main className="main" id="content">
          {children}
          <footer className="product-footer">
            <p>
              This preview never moves funds. Existing BNB markets, SmartSwap execution, LPs, and withdrawal remain on{' '}
              <a href="https://www.melega.finance" rel="noreferrer noopener" referrerPolicy="no-referrer">
                the live Melega DEX
              </a>
              .
            </p>
            <form className="leave" method="post" action="/api/leave">
              <button type="submit">Leave beta</button>
            </form>
          </footer>
        </main>
      </div>

      <ProductNavigation section={section} className="mobile-nav" />
      <nav className="secondary sr-only" aria-label="Secondary">
        <a href="/tools">Advanced Console</a>
      </nav>
    </div>
  )
}
