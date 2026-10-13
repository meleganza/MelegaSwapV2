import React from 'react'
import Head from 'next/head'
import { PRIMARY_SECTIONS, sectionById, type SectionId } from '../lib/sections'

export function BetaShell({ section, children }: { section: SectionId; children: React.ReactNode }) {
  const current = sectionById(section)
  return (
    <div className="frame" data-layout="phone-column" data-section={section}>
      <Head>
        <title>{`${current.title} · Melega Next Gen beta`}</title>
      </Head>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <header className="header">
        <a className="brand" href="/">
          <strong>Melega</strong>
          <span>Beta — read-only</span>
        </a>
        <nav className="secondary" aria-label="Secondary">
          <a href="/portfolio" aria-current={section === 'portfolio' ? 'page' : undefined}>
            Portfolio
          </a>
          <a href="/tools" aria-current={section === 'tools' ? 'page' : undefined}>
            Tools
          </a>
        </nav>
      </header>
      <main className="main" id="content">
        {children}
        <p className="footnote">
          The live DEX at{' '}
          <a href="https://www.melega.finance" rel="noreferrer noopener" referrerPolicy="no-referrer">
            www.melega.finance
          </a>{' '}
          stays in production. This beta does not replace it and does not move funds. Existing BNB markets, the router,
          LPs, and wallet withdrawal remain on the live app.
        </p>
      </main>
      <nav className="tabbar" aria-label="Primary">
        {PRIMARY_SECTIONS.map((item) => (
          <a key={item.id} href={item.href} aria-current={item.id === section ? 'page' : undefined}>
            {item.navLabel}
          </a>
        ))}
      </nav>
    </div>
  )
}
