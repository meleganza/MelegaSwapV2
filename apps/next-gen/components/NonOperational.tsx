import React from 'react'
import type { UxSectionCopy } from '../lib/uxSections'

export function NonOperational({ section }: { section: UxSectionCopy }) {
  return (
    <section className="page-intro" aria-labelledby="section-title">
      <div>
        <p className="eyebrow">Melega Next Gen</p>
        <h1 id="section-title">{section.title}</h1>
        <p className="intro-copy">{section.statements[0]}</p>
      </div>
      <p className="status" role="status" data-operational="false">
        <span aria-hidden="true" /> <span className="sr-only">Not operational. </span>Preview only
      </p>
    </section>
  )
}
