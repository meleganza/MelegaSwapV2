import React from 'react'
import dynamic from 'next/dynamic'
import { LIVE_WITHDRAWAL_LINKS } from '../../lib/portfolioRead'
const PortfolioLookup = dynamic(() => import('./PortfolioLookup'), { ssr: false })
const EarnPositionPanel = dynamic(() => import('../earn/EarnPositions'), { ssr: false })

export default function PortfolioGate() {
  const [open, setOpen] = React.useState(false)
  const [positions, setPositions] = React.useState(false)
  return (
    <div className="portfolio-gate">
      <h2>Your assets</h2>
      <p className="muted-copy">View supported BNB balances by public address.</p>
      {open ? <PortfolioLookup /> : <button className="primary-action" type="button" onClick={() => setOpen(true)}>View balances</button>}
      <p className="footnote">Wallet connection is available in Trade. Portfolio uses public address lookup.</p>
      <div className="position-group"><h2>Earn positions</h2><p className="muted-copy">Check balances for the listed Beefy vaults.</p>
        {positions ? <EarnPositionPanel /> : <button className="secondary-action" type="button" onClick={() => setPositions(true)}>Find Beefy positions</button>}
      </div>
      <div className="position-group"><h2>Legacy positions</h2><p className="muted-copy">Manage and withdraw on the live DEX ↗</p><ul className="legacy-links">{LIVE_WITHDRAWAL_LINKS.map((link, index) => <li key={link.href}><a href={link.href} target="_blank" rel="noreferrer noopener" referrerPolicy="no-referrer">{['Liquidity', 'Farms', 'Pools'][index]} ↗</a></li>)}</ul></div>
      <details className="secondary-disclosure"><summary>Coverage & valuation</summary><p className="muted-copy">USD total is unavailable. Balances cover supported BNB assets only. Legacy LP and farm positions are managed on the live DEX; Beefy balances cover listed vault receipts, not their USD value.</p></details>
    </div>
  )
}
