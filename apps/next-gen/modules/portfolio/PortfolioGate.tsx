import React from 'react'
import dynamic from 'next/dynamic'

const PortfolioLookup = dynamic(() => import('./PortfolioLookup'), { ssr: false })

export default function PortfolioGate() {
  return (
    <div className="quote-slot portfolio-gate">
      <PortfolioLookup />
    </div>
  )
}
