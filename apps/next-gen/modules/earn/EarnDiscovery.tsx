import React from 'react'
import { formatReportedTvl } from '../../lib/earnCatalog'
import { TokenMark } from '../../components/TokenMark'
import EarnSummary from './EarnSummary'

type DiscoveryKind = 'farms' | 'pools' | 'index'
type Opportunity = { id: string; name: string; venue: string; apy: number | null; tvl: number | null; href: string; chain?: string; assets?: Array<{ symbol: string; address: string }> }
type Result = { rows: Opportunity[]; count: number; monitored?: number; reportedTvl?: number | null; unavailable?: boolean; asOf?: string; partial?: boolean }

export default function EarnDiscovery({ kind, chain }: { kind: DiscoveryKind; chain: number }) {
  const [input, setInput] = React.useState('')
  const [query, setQuery] = React.useState('')
  const [offset, setOffset] = React.useState(0)
  const [sort, setSort] = React.useState('tvl')
  const [result, setResult] = React.useState<Result | null>(null)

  React.useEffect(() => {
    const abort = new AbortController()
    const params = new URLSearchParams({ kind, chainId: String(chain), query, offset: String(offset), sort })
    fetch(`/api/earn-discovery?${params}`, { signal: abort.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unavailable')
        return response.json() as Promise<Result>
      })
      .then((body) => { if (!abort.signal.aborted) setResult(body) })
      .catch(() => { if (!abort.signal.aborted) setResult({ rows: [], count: 0, unavailable: true }) })
    return () => abort.abort()
  }, [chain, kind, offset, query, sort])

  return (
    <section aria-label={kind === 'index' ? 'Indexed opportunities' : `Melega ${kind}`}>
      {result && !result.unavailable ? <EarnSummary count={result.monitored ?? result.count} tvl={result.reportedTvl ?? null} scope={kind === 'index' ? chain === 0 ? 'Market index · All supported networks' : 'Market index · Selected network' : `Melega ${kind} · BNB Chain`} /> : null}
      <form className="earn-estimate earn-search" onSubmit={(event) => {
        event.preventDefault()
        const next = input.trim()
        if (next === query && offset === 0) return
        setResult(null)
        setOffset(0)
        setQuery(next)
      }}>
        <input aria-label="Search assets or opportunities" placeholder="Search asset or protocol" type="search" value={input} maxLength={80} onChange={(event) => setInput(event.target.value)} />
        <button className="card-action" type="submit">Search</button>
      </form>
      {kind === 'index' ? <div className="earn-filter-bar"><label>Sort by<select value={sort} onChange={(event) => { setResult(null); setOffset(0); setSort(event.target.value) }}><option value="tvl">Highest TVL</option><option value="apy">Highest APY</option></select></label></div> : null}
      {kind === 'index' ? <p className="footnote">Market data from DefiLlama. Open the source to verify pool details.</p> : null}
      {kind !== 'index' && result?.asOf ? <p className="footnote">Melega source date: {result.asOf.slice(0, 10)}. Check availability on Melega before depositing.</p> : null}
      {result?.partial ? <p className="footnote">Partial inventory. New pools may appear first on Melega.</p> : null}
      <p className="footnote" role="status">{!result ? 'Loading opportunities…' : result.unavailable ? 'Source unavailable. Try again shortly.' : result.count ? `${result.count} opportunities` : 'No matching opportunities.'}</p>
      <div className="earn-catalog">
        {result?.rows.map((row) => (
          <article className="earn-card" key={row.id}>
            <div className="pair-art">{row.assets?.length ? row.assets.map((asset) => <TokenMark key={asset.address} {...asset} chainId={56} allowSymbolMark={false} size={34} />) : <TokenMark symbol={row.name} allowSymbolMark={false} size={34} />}</div>
            <span className="verified-label">{row.chain ?? 'BNB Chain'} · {kind === 'index' ? 'Market' : kind === 'farms' ? 'Farm' : 'Pool'}</span>
            <h3>{row.name}</h3>
            <div className="earn-metrics"><span><small>{kind === 'farms' ? 'APR' : 'APY'}</small><strong>{row.apy === null ? '—' : row.apy.toFixed(2) + '%'}</strong></span><span><small>TVL</small><strong>{row.tvl === null ? '—' : '$' + formatReportedTvl(row.tvl)}</strong></span></div>
            <details className="advanced-details">
              <summary>Details</summary>
              <p className="earn-provenance">{row.venue} · {kind === 'index' ? 'Indexed analytics' : 'Melega liquidity incentives'}</p>
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
