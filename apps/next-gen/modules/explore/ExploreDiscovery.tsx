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
      <h2>Paid Boost</h2>
      {state === 'loading' ? <p className="muted-copy">Reading the canonical active feed.</p> : null}
      {state === 'unavailable' ? (
        <p className="muted-copy" role="status">
          The Boost feed did not return a verified list. No placement is shown.
        </p>
      ) : null}
      {state === 'empty' ? (
        <p className="muted-copy" role="status">
          No active paid Boost placements.
        </p>
      ) : null}
      {state === 'rows' ? (
        <ul className="facts">
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
              <span> Paid placement from the live feed. Leaves this beta.</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
