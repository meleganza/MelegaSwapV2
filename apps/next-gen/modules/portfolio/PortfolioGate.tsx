import React from 'react'
import dynamic from 'next/dynamic'
import { LIVE_WITHDRAWAL_LINKS } from '../../lib/portfolioRead'

const PortfolioLookup = dynamic(() => import('./PortfolioLookup'), { ssr: false })

export default function PortfolioGate() {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="quote-slot portfolio-gate">
      {open ? (
        <PortfolioLookup />
      ) : (
        <button className="primary-action" type="button" onClick={() => setOpen(true)}>
          Enter a public address
        </button>
      )}
      {!open ? <p className="action-hint">Read-only · No custody · No wallet connection</p> : null}
      {!open ? (
        <ul className="result-links">
          {LIVE_WITHDRAWAL_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} rel="noreferrer noopener" referrerPolicy="no-referrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
