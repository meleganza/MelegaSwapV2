import React from 'react'
import dynamic from 'next/dynamic'

const BnbQuotePreview = dynamic(() => import('./BnbQuotePreview'), { ssr: false })

export default function QuoteGate() {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="quote-slot">
      {open ? (
        <BnbQuotePreview />
      ) : (
        <button className="primary-action" type="button" onClick={() => setOpen(true)}>
          Review Swap
        </button>
      )}
    </div>
  )
}
