import React from 'react'
import { isLiveDexHref } from '../../lib/legacyServices'
import { AppIcon } from '../../components/AppIcon'

export function ExternalService({ title, detail, href }: { title: string; detail: string; href: string | null }) {
  const liveHref = href && isLiveDexHref(href) ? href : null
  return (
    <section className="surface tool-surface" aria-labelledby="section-title">
      <div className="tool-hero-icon"><AppIcon name="portfolio" /></div><p className="eyebrow">Melega Tools</p>
      <h1 id="section-title">{title}</h1>
      <p className="tool-lead">{detail}</p>
      <div className="service-points"><span><AppIcon name="shield" />BNB Chain</span><span><AppIcon name="shield" />Guided setup</span><span><AppIcon name="shield" />Review before action</span></div>
      {liveHref ? (
        <a className="service-cta" href={liveHref} target="_blank" rel="noreferrer noopener" referrerPolicy="no-referrer">
          Open service <AppIcon name="arrow" />
        </a>
      ) : <p className="inline-alert">This service is not available yet.</p>}
      <p className="action-hint" data-operational="false" data-handoff={liveHref ? 'external' : 'unavailable'}>Opens the live DEX · No checkout in this preview</p>
    </section>
  )
}
