import React from 'react'

export function ToolBody({ title, detail }: { title: string; detail: string }) {
  return (
    <section className="surface tool-surface" aria-labelledby="section-title">
      <p className="eyebrow">Advanced Console</p>
      <h1 id="section-title">{title}</h1>
      <p className="status" role="status" data-operational="false">
        Not operational
      </p>
      <ul className="facts">
        <li>{detail}</li>
        <li>No payment, signature, or contract deployment is available.</li>
      </ul>
    </section>
  )
}
