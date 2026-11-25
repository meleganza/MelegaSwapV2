import React from 'react'
import { formatReportedTvl } from '../../lib/earnCatalog'

type DiscoveryKind = 'farms' | 'pools' | 'index'
type Opportunity = { id: string; name: string; venue: string; apy: number | null; tvl: number | null; href: string }
type Result = { rows: Opportunity[]; count: number; unavailable?: boolean; asOf?: string }

export default function EarnDiscovery({ kind, chain }: { kind: DiscoveryKind; chain: number }) {
  const [input, setInput] = React.useState('')
  const [query, setQuery] = React.useState('')
  const [offset, setOffset] = React.useState(0)
  const [result, setResult] = React.useState<Result | null>(null)

  React.useEffect(() => {
    const abort = new AbortController()
    const params = new URLSearchParams({ kind, chainId: String(chain), query, offset: String(offset) })
    fetch(`/api/earn-discovery?${params}`, { signal: abort.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unavailable')
        return response.json() as Promise<Result>
      })
      .then((body) => { if (!abort.signal.aborted) setResult(body) })
      .catch(() => { if (!abort.signal.aborted) setResult({ rows: [], count: 0, unavailable: true }) })
    return () => abort.abort()
  }, [chain, kind, offset, query])

  return (
    <section aria-label={kind === 'index' ? 'Indexed opportunities' : `Melega ${kind}`}>
      <form className="earn-estimate" onSubmit={(event) => {
        event.preventDefault()
        const next = input.trim()
        if (next === query && offset === 0) return
        setResult(null)
        setOffset(0)
        setQuery(next)
      }}>
        <label htmlFor="earn-discovery-search">Search assets or opportunities</label>
        <input id="earn-discovery-search" type="search" value={input} maxLength={80} onChange={(event) => setInput(event.target.value)} />
        <button className="card-action" type="submit">Search</button>
      </form>
      {kind === 'index' ? <p className="footnote">Market data from DefiLlama. Open the source to verify pool details.</p> : null}
      {kind !== 'index' && result?.asOf ? <p className="footnote">Melega source date: {result.asOf.slice(0, 10)}. Check availability on Melega before depositing.</p> : null}
      <p className="footnote" role="status">{!result ? 'Loading opportunities…' : result.unavailable ? 'Source unavailable. Try again shortly.' : result.count ? `${result.count} opportunities` : 'No matching opportunities.'}</p>
      <div className="earn-catalog">
        {result?.rows.map((row) => (
          <article className="earn-card" key={row.id}>
            <h3>{row.name}</h3>
            {kind === 'index' ? <div className="earn-metrics"><span><small>APY</small><strong>{row.apy?.toFixed(2)}%</strong></span><span><small>TVL</small><strong>${formatReportedTvl(row.tvl)}</strong></span></div> : null}
            <details className="advanced-details">
              <summary>Details</summary>
              <p>{row.venue}</p>
              {kind === 'pools' ? <p>Contract: <code style={{ overflowWrap: 'anywhere' }}>{row.id}</code></p> : null}
              {kind === 'farms' ? <p>Farm ID: {row.id}</p> : null}
              <a className="card-action" href={row.href} target="_blank" rel="noreferrer noopener">{kind === 'index' ? 'View indexed pool ↗' : 'Open on Melega ↗'}</a>
            </details>
          </article>
        ))}
      </div>
      {result && (offset > 0 || result.count > offset + 12) ? (
        <div className="earn-navigation" aria-label="Pages">
          <button type="button" disabled={offset === 0} onClick={() => { setResult(null); setOffset(offset - 12) }}>Previous</button>
          <button type="button" disabled={result.count <= offset + 12} onClick={() => { setResult(null); setOffset(offset + 12) }}>Next</button>
        </div>
      ) : null}
    </section>
  )
}
