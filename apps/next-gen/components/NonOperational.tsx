import React from 'react'
import { MarcoPose } from './MarcoPose'
import type { UxSectionCopy } from '../lib/uxSections'

export function NonOperational({ section }: { section: UxSectionCopy }) {
  if (section.id === 'swap') {
    return (
      <section className="swap-accessibility" aria-labelledby="section-title">
        <h1 id="section-title">Swap</h1>
        <p className="status" role="status" data-operational="false">
          <span className="sr-only">Beta — read-only until you confirm a swap in your wallet.</span>
        </p>
      </section>
    )
  }
  const copy = {
    earn: ['Put your assets to work.', 'earn'],
    portfolio: ['Your assets. One clear view.', 'welcome'],
    explore: ['Discover your next move.', 'explore'],
  } as const
  const intro = section.id === 'earn' || section.id === 'portfolio' || section.id === 'explore' ? copy[section.id] : null
  if (intro) return (
    <section className="page-intro marco-intro" aria-labelledby="section-title">
      <div><p className="section-kicker">MelegaDex Evo</p><h1 id="section-title">{section.title}</h1><p className="intro-copy">{intro[0]}</p></div>
      <MarcoPose pose={intro[1]} />
    </section>
  )
  return (
    <section className="page-intro" aria-labelledby="section-title">
      <div>
        <h1 id="section-title">{section.title}</h1>
        <p className="intro-copy">{section.statements[0]}</p>
      </div>
      <p className="status" role="status" data-operational="false">
        <span aria-hidden="true" /> <span className="sr-only">Not operational. </span>Beta — read-only
      </p>
    </section>
  )
}
