import React from 'react'
import dynamic from 'next/dynamic'

const PortfolioLookup = dynamic(() => import('./PortfolioLookup'), { ssr: false })

export default function PortfolioGate() {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="quote-slot">
      {open ? (
        <PortfolioLookup />
      ) : (
        <button type="button" onClick={() => setOpen(true)}>
          Load address lookup
        </button>
      )}
    </div>
  )
}
