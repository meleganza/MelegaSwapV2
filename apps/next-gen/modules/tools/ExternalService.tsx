import React from 'react'
import { isLiveDexHref } from '../../lib/legacyServices'

export function ExternalService({ title, detail, href }: { title: string; detail: string; href: string | null }) {
  const liveHref = href && isLiveDexHref(href) ? href : null
  return (
    <section className="surface tool-surface" aria-labelledby="section-title">
      <p className="eyebrow">Tools</p>
      <h1 id="section-title">{title}</h1>
      <p className="status" role="status" data-operational="false" data-handoff={liveHref ? 'external' : 'unavailable'}>
        {liveHref ? 'Leaves this beta' : 'Unavailable'}
      </p>
      <ul className="facts">
        <li>{detail}</li>
        <li>{liveHref ? 'No payment, signature, or contract action runs in this beta.' : 'No checkout is offered.'}</li>
      </ul>
      {liveHref ? (
        <a href={liveHref} target="_blank" rel="noreferrer noopener" referrerPolicy="no-referrer">
          Continue on the live DEX
        </a>
      ) : null}
    </section>
  )
}
