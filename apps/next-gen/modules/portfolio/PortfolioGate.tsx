import React from 'react'
import dynamic from 'next/dynamic'

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
    </div>
  )
}
