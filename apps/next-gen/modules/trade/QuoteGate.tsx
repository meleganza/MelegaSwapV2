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
          Open read-only quote
        </button>
      )}
      {!open ? <p className="action-hint">No wallet, signature, approval, or transaction.</p> : null}
    </div>
  )
}
