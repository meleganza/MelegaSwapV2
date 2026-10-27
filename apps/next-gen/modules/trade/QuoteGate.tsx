import React from 'react'
import dynamic from 'next/dynamic'
const BnbQuotePreview = dynamic(() => import('./BnbQuotePreview'), { ssr: false })

export default function QuoteGate() {
  return (
    <div className="quote-slot">
      <BnbQuotePreview />
    </div>
  )
}
