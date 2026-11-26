import React from 'react'

export default function EarnSummary({ count, tvl, scope }: { count: number; tvl: number | null; scope: string }) {
  return (
    <div className="earn-summary" aria-label={scope}>
      <div><small>Opportunities monitored</small><strong>{count.toLocaleString('en-US')}</strong></div>
      <div><small>Reported TVL</small><strong>{tvl === null ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(tvl)}</strong></div>
      <p>{scope}{tvl !== null ? ' · Sum of reported values. Positions may overlap.' : ''}</p>
    </div>
  )
}
