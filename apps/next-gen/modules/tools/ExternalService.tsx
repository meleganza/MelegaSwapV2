import React from 'react'
import { isLiveDexHref } from '../../lib/legacyServices'
import { AppIcon } from '../../components/AppIcon'

export function ExternalService({ title, detail, href }: { title: string; detail: string; href: string | null }) {
  const liveHref = href && isLiveDexHref(href) ? href : null
  const labels = title === 'Premium Project Page'
    ? ['Project handle', 'Tagline', 'Category']
    : ['Project URL', 'Campaign goal', 'Placement']
  return (
    <section className="surface tool-surface" aria-labelledby="section-title">
      <a className="service-back" href="/tools" aria-label="Back to Tools">←</a>
      <p className="eyebrow">Melega Tools</p><h1 id="section-title">{title}</h1>
      <p className="tool-lead">Set up the service here, then review it on the live DEX.</p>
      <div className="service-preview-form">{labels.map((label) => <label key={label}>{label}<span>{label === 'Placement' ? 'Explore' : 'Add details'}</span></label>)}</div>
      <div className="service-points"><span><AppIcon name="shield" />BNB Chain</span><span><AppIcon name="shield" />Verified project</span><span><AppIcon name="shield" />Review first</span></div>
      {liveHref ? (
        <a className="service-cta" href={liveHref} target="_blank" rel="noreferrer noopener" referrerPolicy="no-referrer">
          Continue to live review <AppIcon name="arrow" />
        </a>
      ) : <p className="inline-alert">This service is not available yet.</p>}
      <p className="action-hint" data-operational="false" data-handoff={liveHref ? 'external' : 'unavailable'}>Opens the live DEX · No checkout in this preview</p>
    </section>
  )
}
