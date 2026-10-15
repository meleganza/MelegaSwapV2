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

  return (
    <div data-boost-feed={state}>
      <div className="panel-title"><h2>Boost</h2><span className="quiet-chip">Sponsored</span></div>
      {state === 'loading' ? <p className="muted-copy">Loading Boost…</p> : null}
      {state === 'unavailable' ? (
        <p className="muted-copy" role="status">
          Boost is temporarily unavailable.
        </p>
      ) : null}
      {state === 'empty' ? (
        <p className="muted-copy" role="status">
          No active Boost placements.
        </p>
      ) : null}
      {state === 'rows' ? (
        <ul className="facts">
          {rows.map((row) => (
            <li key={row.orderId}>
              <a href={row.projectHref} target="_blank" rel="noreferrer noopener" referrerPolicy="no-referrer">
                {row.projectSlug}
              </a>
              {row.tokenHref ? (
                <>
                  {' · '}
                  <a href={row.tokenHref} target="_blank" rel="noreferrer noopener" referrerPolicy="no-referrer">
                    Token page
                  </a>
                </>
              ) : null}
              <span> Sponsored</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
