import React from 'react'
import type { UxSectionCopy } from '../lib/uxSections'

export function NonOperational({ section }: { section: UxSectionCopy }) {
  if (section.id === 'swap') {
    return (
      <section className="swap-accessibility" aria-labelledby="section-title">
        <h1 id="section-title">Swap</h1>
        <p className="status" role="status" data-operational="false">
          <span className="sr-only">Not operational. Protected Beta. No transaction execution.</span>
        </p>
      </section>
    )
  }
  return (
    <section className="page-intro" aria-labelledby="section-title">
      <div>
        <h1 id="section-title">{section.title}</h1>
        <p className="intro-copy">{section.statements[0]}</p>
      </div>
      <p className="status" role="status" data-operational="false">
        <span aria-hidden="true" /> <span className="sr-only">Not operational. </span>Protected Beta
      </p>
    </section>
  )
}
