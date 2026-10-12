import React from 'react'

export function ToolBody({ title, detail }: { title: string; detail: string }) {
  return (
    <section aria-labelledby="section-title">
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
