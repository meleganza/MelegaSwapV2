import React from 'react'
import { AppIcon } from './AppIcon'
import { LIVE_DEX_LINKS, marcoPublicPairs } from '../lib/legacyServices'
import type { UxSectionCopy } from '../lib/uxSections'

function TrustRow({ statements }: { statements: string[] }) {
  return (
    <ul className="trust-row" aria-label="Product safeguards">
      {statements.slice(1).map((statement) => (
        <li key={statement}>
          <span aria-hidden="true">✓</span>
          {statement}
        </li>
      ))}
    </ul>
  )
}

function TradeExperience({ children }: { children?: React.ReactNode }) {
  return (
    <div className="trade-home-grid">
    <div className="trade-layout">
      <section className="surface trade-surface" aria-label="Trade preview">
        <div className="surface-head">
          <div className="segment" aria-label="Trade mode">
            <a href="/" aria-current="page">
              Swap
            </a>
            <a href="/bridge">Bridge</a>
          </div>
          <span className="network-chip">
            <span className="network-dot" aria-hidden="true" /> BNB Chain
          </span>
        </div>
        {children}
      </section>
    </div>
    <aside className="desktop-promo" aria-label="Melega highlights">
      <article className="marco-promo"><div><span>MARCO</span><h2>Your guide to the Melega ecosystem.</h2><a href="/explore">Explore MARCO</a></div><img src="/brand/marco-hero.webp" alt="MARCO character" /></article>
      <a className="featured-slot" href="/tools/featured-project"><span>Featured project</span><strong>Put your project in front of Melega users</strong><small>Verified paid placement</small></a>
    </aside>
    </div>
  )
}

function BridgeExperience() {
  return (
    <section className="surface bridge-surface" aria-label="MARCO Bridge preview">
      <div className="surface-head">
        <div className="segment" aria-label="Trade mode">
          <a href="/">Swap</a>
          <a href="/bridge" aria-current="page">Bridge</a>
        </div>
        <span className="quiet-chip">Live DEX handoff</span>
      </div>
      <nav className="earn-tabs" aria-label="Earn filters"><a href="#earn-all" aria-current="page">All</a><a href="#bnb-farm">Farms</a><a href="#earn-catalog-title">Vaults</a><a href="#beefy-positions">My positions</a></nav>
      <div id="earn-all" />
      <ul className="facts">
        {marcoPublicPairs().map((pair) => (
          <li key={`${pair.fromId}-${pair.toId}`}>
            {pair.fromLabel}
            {pair.fromChainId === null ? '' : ` (${pair.fromChainId})`} → {pair.toLabel}
            {pair.toChainId === null ? '' : ` (${pair.toChainId})`}
          </li>
        ))}
      </ul>
      <p className="muted-copy">
        Leaves this beta. These pairs are the public MARCO routes. Bridge execution stays on the live DEX.
      </p>
      <a href={LIVE_DEX_LINKS.bridge} target="_blank" rel="noreferrer noopener" referrerPolicy="no-referrer">
        Continue on the live MARCO bridge
      </a>
      <div className="empty-action" data-operational="false">Bridge execution is disabled in this protected beta</div>
    </section>
  )
}

function EarnExperience({ children }: { children?: React.ReactNode }) {
  return (
    <section className="surface discovery-surface" aria-label="Earn opportunities preview">
      <div className="surface-head compact-page-head">
        <div><h2>Earn</h2><p>BNB opportunities</p></div>
        <label className="chain-select"><span className="sr-only">Network</span><select defaultValue="56"><option value="56">BNB Chain</option><option disabled>Ethereum · Terminated</option><option disabled>Polygon · Terminated</option><option disabled>Base · Terminated</option></select></label>
      </div>
      {children ? (
        children
      ) : (
        <div className="empty-state" data-operational="false">
          <span className="empty-symbol"><AppIcon name="earn" /></span>
          <h3>Verified opportunities will appear here</h3>
          <p>APY and TVL stay hidden until a factual source is available.</p>
        </div>
      )}
    </section>
  )
}

function PortfolioExperience({ children }: { children?: React.ReactNode }) {
  return (
    <section className="surface lookup-surface portfolio-dashboard" aria-label="Portfolio dashboard">
      <div className="surface-head compact-page-head">
        <div><h2>Portfolio</h2><p>Public BNB address</p></div>
        <span className="quiet-chip">Read only</span>
      </div>
      {children}
    </section>
  )
}

function ExploreExperience({ children }: { children?: React.ReactNode }) {
  return (
    <section className="surface discovery-surface" aria-label="Explore preview">
      <div className="surface-head compact-page-head">
        <div><h2>Explore</h2><p>Tokens and verified projects</p></div>
        <a className="small-cta" href="/tools/trend-boost">Boost your project</a>
      </div>
      {children}
    </section>
  )
}

export function PremiumExperience({ section, children }: { section: UxSectionCopy; children?: React.ReactNode }) {
  return (
    <>
      {section.id === 'swap' ? <TradeExperience>{children}</TradeExperience> : null}
      {section.id === 'bridge' ? <BridgeExperience /> : null}
      {section.id === 'earn' ? <EarnExperience>{children}</EarnExperience> : null}
      {section.id === 'portfolio' ? <PortfolioExperience>{children}</PortfolioExperience> : null}
      {section.id === 'explore' ? <ExploreExperience>{children}</ExploreExperience> : null}
      <TrustRow statements={section.statements} />
    </>
  )
}
