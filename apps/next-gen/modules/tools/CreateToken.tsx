import React from 'react'
import { commercialTool } from '../../lib/tools'
export default function CreateToken() {
  const tool = commercialTool('create-token')
  return (
    <section className="surface create-token-preview" aria-labelledby="section-title" data-operational="false">
      <a className="service-back" href="/tools" aria-label="Back to Tools">←</a>
      <div className="tool-hero-icon" aria-hidden="true">◇</div>
      <h1 id="section-title">Create Token</h1><span className="network-chip"><span className="network-dot" /> BNB Chain</span>
      <ol className="service-steps" aria-label="Create Token steps"><li className="active"><span>1</span>Token details</li><li><span>2</span>Review</li></ol>
      <div className="token-form" aria-label="Token details preview">
        <label>Token name<input value="My Token" readOnly /></label><label>Symbol<input value="MTK" readOnly /></label><label>Total supply<input value="1,000,000" readOnly /></label>
        <div className="switch-row"><span>Fixed supply</span><span className="preview-switch" aria-hidden="true" /></div>
      </div>
      <p className="review-note">You’ll review everything before continuing</p>
      <a className="service-cta" href={tool.href} target="_blank" rel="noreferrer noopener" referrerPolicy="no-referrer">Continue to review <span aria-hidden="true">→</span></a>
      <p className="action-hint">Preview only — no deployment</p>
    </section>
  )
}
