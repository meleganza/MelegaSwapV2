import React from 'react'
import { parseTrendBoostActive, type BoostPlacement } from '../../lib/legacyServices'

type FeedState = 'loading' | 'empty' | 'rows' | 'unavailable'

export default function ExploreDiscovery() {
  const [state, setState] = React.useState<FeedState>('loading')
  const [rows, setRows] = React.useState<BoostPlacement[]>([])

  React.useEffect(() => {
    let cancelled = false
    fetch('/api/trend-boost-active')
      .then((response) => response.json())
      .then((payload) => {
        if (cancelled) return
        const parsed = parseTrendBoostActive(payload)
        if (!parsed.ok) {
          setRows([])
          setState('unavailable')
          return
        }
        setRows(parsed.placements)
        setState(parsed.placements.length > 0 ? 'rows' : 'empty')
      })
      .catch(() => {
        if (cancelled) return
        setRows([])
        setState('unavailable')
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (state !== 'rows') return null
  return (
    <div className="boost-grid" data-boost-feed={state}>
      <div className="section-divider"><p className="section-kicker">Sponsored</p><h2>Boosted now</h2></div>
      {state === 'rows' ? (
        <ul className="boost-cards">
          {rows.map((row) => (
            <li key={row.orderId}>
              <a href={row.projectHref} target="_blank" rel="noreferrer noopener" referrerPolicy="no-referrer">
                {row.projectSlug}
              </a>
              {' · chain '}
              {row.chainId}
              {row.startsAt ? ` · ${row.startsAt}` : ''}
              {row.endsAt ? ` to ${row.endsAt}` : ''}
              {row.tokenHref ? (
                <>
                  {' · '}
                  <a href={row.tokenHref} target="_blank" rel="noreferrer noopener" referrerPolicy="no-referrer">
                    Token page
                  </a>
                </>
              ) : null}
              <span className="paid-label">Paid placement</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
