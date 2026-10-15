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
        <div className="asset-field">
          <span className="field-label">You pay</span>
          <strong>0.00</strong>
          <span className="token-chip">BNB</span>
          <small>Balance unavailable in read-only mode</small>
        </div>
        <button className="swap-direction" type="button" disabled aria-label="Swap direction unavailable">
          ↓
        </button>
        <div className="asset-field asset-field-output">
          <span className="field-label">You receive</span>
          <strong>0.00</strong>
          <span className="token-chip token-empty">Select token</span>
          <small>Best factual net output appears after a quote</small>
        </div>
        {children}
        <div className="route-note">
          <AppIcon name="shield" />
          <span>
            <strong>SmartSwap clarity</strong>
            Venue, impact, gas, and slippage appear only when factual.
          </span>
        </div>
      </section>

      <aside className="next-actions" aria-label="Next actions">
        <p className="section-kicker">Your next move</p>
        <a href="/earn">
          <span className="action-icon"><AppIcon name="earn" /></span>
          <span><strong>Put assets to work</strong><small>Review verified yield opportunities</small></span>
          <AppIcon name="arrow" />
        </a>
        <a href="/portfolio">
          <span className="action-icon"><AppIcon name="portfolio" /></span>
          <span><strong>Understand your holdings</strong><small>Read balances without connecting a wallet</small></span>
          <AppIcon name="arrow" />
        </a>
        <a href="/explore">
          <span className="action-icon"><AppIcon name="explore" /></span>
          <span><strong>Discover with context</strong><small>Projects, tokens, and paid Boost</small></span>
          <AppIcon name="arrow" />
        </a>
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
      <div className="surface-head">
        <div><p className="section-kicker">Opportunities</p><h2>Yield, with the facts first</h2></div>
        <span className="quiet-chip">{children ? 'BNB reads' : 'No verified data loaded'}</span>
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
    <div className="portfolio-layout">
      <section className="surface portfolio-summary" aria-label="Portfolio summary">
        <p className="section-kicker">Total portfolio value</p>
        <p className="unavailable-value">—</p>
        <p className="muted-copy">Enter a public BNB address to read supported balances. No wallet connection is requested.</p>
        <div className="portfolio-metrics">
          <div><small>Assets</small><strong>Not loaded</strong></div>
          <div><small>Networks</small><strong>BNB read available</strong></div>
          <div><small>Rewards</small><strong>Not scanned</strong></div>
        </div>
      </section>
      <section className="surface lookup-surface" aria-label="Portfolio lookup">{children}</section>
    </div>
  )
}

function ExploreExperience({ children }: { children?: React.ReactNode }) {
  return (
    <section className="surface discovery-surface" aria-label="Explore preview">
      <div className="surface-head">
        <div><p className="section-kicker">Discovery</p><h2>Find signal, not noise</h2></div>
        <span className="quiet-chip">Live DEX handoff</span>
      </div>
      <div className="explore-categories">
        <a href={LIVE_DEX_LINKS.projects} target="_blank" rel="noreferrer noopener" referrerPolicy="no-referrer">
          <span className="action-icon"><AppIcon name="explore" /></span><strong>Projects</strong><small>Live project directory. Leaves this beta.</small>
        </a>
        <a href={LIVE_DEX_LINKS.projectsTrending} target="_blank" rel="noreferrer noopener" referrerPolicy="no-referrer">
          <span className="action-icon"><AppIcon name="trade" /></span><strong>Trending</strong><small>Same directory, trending sort. Leaves this beta.</small>
        </a>
        <a href={LIVE_DEX_LINKS.tokensBnb} target="_blank" rel="noreferrer noopener" referrerPolicy="no-referrer">
          <span className="action-icon"><AppIcon name="earn" /></span><strong>BNB tokens</strong><small>Live info for BNB Smart Chain. Leaves this beta.</small>
        </a>
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
