import React from 'react'
import { formatReportedApy, formatReportedTvl, type EarnCatalog, type EarnOpportunity } from '../../lib/earnCatalog'
import { TokenMark } from '../../components/TokenMark'

function matches(opportunity: EarnOpportunity, asset: string, protocol: string): boolean {
  const assetQuery = asset.trim().toLowerCase()
  const protocolQuery = protocol.trim().toLowerCase()
  const assetHit = assetQuery.length === 0 || opportunity.assets.some((item) => item.toLowerCase().includes(assetQuery)) || opportunity.name.toLowerCase().includes(assetQuery)
  const protocolHit = protocolQuery.length === 0 || opportunity.protocol.toLowerCase().includes(protocolQuery)
  return assetHit && protocolHit
}

export function EarnCatalogView({ catalog, asset, protocol }: { catalog: EarnCatalog; asset: string; protocol: string }) {
  if (!catalog.ok) {
    return (
      <p className="inline-alert" role="status" data-operational="false" data-catalog="unavailable">
        {catalog.code === 'TIMEOUT'
          ? 'The Beefy catalog timed out. No APY or TVL is shown.'
          : 'The Beefy catalog is unavailable. No APY or TVL is shown.'}
      </p>
    )
  }
  const visible = catalog.opportunities.filter((opportunity) => matches(opportunity, asset, protocol))
  return (
    <div data-executable="false" data-deposit="false" data-catalog="bnb">
      {visible.length === 0 ? <p className="inline-alert">No verified matches.</p> : null}
      <div className="earn-catalog">
        {visible.slice(0, 6).map((opportunity) => (
          <article className="earn-card" key={opportunity.id}>
            <div className="pair-art">{opportunity.assets.slice(0, 2).map((asset) => <TokenMark key={asset} symbol={asset} size={34} />)}</div>
            <span className="verified-label">Beefy · PancakeSwap</span><h3>{opportunity.assets.join(' / ')}</h3>
            <div className="earn-metrics"><span><small>APY</small><strong>{formatReportedApy(opportunity.apyDecimal) ?? '—'}</strong></span><span><small>TVL</small><strong>{formatReportedTvl(opportunity.tvlUsd) === null ? '—' : `$${formatReportedTvl(opportunity.tvlUsd)}`}</strong></span></div>
            <a className="card-action" href={opportunity.href} target="_blank" rel="noreferrer noopener" referrerPolicy="no-referrer">View vault</a>
            <details className="advanced-details">
              <summary>Details & risk</summary>
              <ul className="facts">
                <li>Protocol: {opportunity.protocol}</li>
                <li>Source: {opportunity.source}</li>
                <li>APY updated: {opportunity.updatedAt ?? 'not provided by the source'}</li>
                <li>{opportunity.stale ? 'This fetch is older than 15 minutes.' : 'Fetched with this page view.'}</li>
                <li>
                  {opportunity.sourceRisk
                    ? `Beefy flags raised: ${opportunity.sourceRisk.raised.length > 0 ? opportunity.sourceRisk.raised.join(', ') : 'none'}. Risk record ${opportunity.sourceRisk.updatedAt ?? 'time not provided'}.`
                    : 'Risk flags were not returned by this source.'}
                </li>
                <li>{opportunity.withdrawalNote}</li><li>No Melega fee or referral parameter.</li>
              </ul>
            </details>
          </article>
        ))}
      </div>
    </div>
  )
}

export default function EarnCatalogPanel() {
  const [catalog, setCatalog] = React.useState<EarnCatalog | null>(null)
  const [asset, setAsset] = React.useState('')
  const [protocol, setProtocol] = React.useState('')
  const assets = catalog?.ok ? [...new Set(catalog.opportunities.flatMap((row) => row.assets))].sort() : []
  const protocols = catalog?.ok ? [...new Set(catalog.opportunities.map((row) => row.protocol))] : []

  React.useEffect(() => {
    const controller = new AbortController()
    fetch('/api/earn-catalog', { signal: controller.signal })
      .then(async (response) => (await response.json()) as EarnCatalog)
      .then((body) => setCatalog(body))
      .catch(() => {
        if (!controller.signal.aborted) {
          setCatalog({
            ok: false,
            code: 'UNAVAILABLE',
            schema: 'melega.next-gen.earn-catalog.v1',
            chainId: 56,
            source: 'https://api.beefy.finance',
            fetchedAt: null,
            count: 0,
            opportunities: [],
            executable: false,
            deposit: false,
          })
        }
      })
    return () => controller.abort()
  }, [])

  return (
    <section className="quote-panel" aria-labelledby="earn-catalog-title">
      <div className="panel-title compact-catalog-title">
        <div>
          <h2 id="earn-catalog-title">Opportunities</h2>
          <p className="catalog-source">Verified live data</p>
        </div>
        <span className="quiet-chip">Read only</span>
      </div>
      <div className="earn-filter-bar">
        <label><span>Asset</span><select value={asset} onChange={(event) => setAsset(event.target.value)}><option value="">All assets</option>{assets.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>Protocol</span><select value={protocol} onChange={(event) => setProtocol(event.target.value)}><option value="">All protocols</option>{protocols.map((item) => <option key={item}>{item}</option>)}</select></label>
        <span className="provider-badge">Powered by Beefy</span>
      </div>
      {catalog ? <EarnCatalogView catalog={catalog} asset={asset} protocol={protocol} /> : <p className="footnote">Reading the Beefy BNB catalog.</p>}
    </section>
  )
}
