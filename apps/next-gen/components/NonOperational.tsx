import React from 'react'
import type { SectionCopy } from '../lib/sections'

export function NonOperational({ section }: { section: SectionCopy }) {
  return (
    <section aria-labelledby="section-title">
      <h1 id="section-title">{section.title}</h1>
      <p className="status" role="status" data-operational="false">
        Not operational
      </p>
      <ul className="facts">
        {section.statements.map((statement) => (
          <li key={statement}>{statement}</li>
        ))}
      </ul>
    </section>
  )
}
