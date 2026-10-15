import React from 'react'
import { formatReportedApy, formatReportedTvl, type EarnCatalog, type EarnOpportunity } from '../../lib/earnCatalog'

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
          ? 'Vaults are taking longer to load. Try again shortly.'
          : 'Vaults are temporarily unavailable. Try again shortly.'}
      </p>
    )
  }
  const visible = catalog.opportunities.filter((opportunity) => matches(opportunity, asset, protocol))
  return (
    <div data-executable="false" data-deposit="false" data-catalog="bnb">
      <p className="footnote">BNB Chain · Vaults by Beefy · Manage funds on Beefy ↗</p>
      {visible.length === 0 ? <p className="muted-copy">No listed opportunity matches that filter.</p> : null}
      <div className="earn-catalog">
        {visible.map((opportunity) => (
          <article className="earn-card" key={opportunity.id}>
            <div className="vault-heading"><span className="asset-monogram" aria-hidden="true">{opportunity.assets[0]?.slice(0, 1)}</span><div><h3>{opportunity.assets.join(' / ')}</h3><p className="muted-copy">Beefy · {opportunity.protocol}</p></div></div>
            <dl className="vault-metrics">
              <div><dt>APY</dt><dd>{formatReportedApy(opportunity.apyDecimal) ?? 'Unavailable'}</dd></div>
              <div><dt>TVL</dt><dd>{formatReportedTvl(opportunity.tvlUsd) === null ? 'Unavailable' : `$${formatReportedTvl(opportunity.tvlUsd)}`}</dd></div>
            </dl>
            {opportunity.stale ? <p className="inline-alert">Data older than 15 minutes. Check current figures on Beefy.</p> : null}
            <a className="vault-action" href={opportunity.href} target="_blank" rel="noreferrer noopener" referrerPolicy="no-referrer">Open on Beefy ↗</a>
            <details>
              <summary>Fees, source & conditions</summary>
              <ul className="facts">
                <li>Melega fee: 0. No referral or revenue share.</li>
                <li>Beefy fees: {opportunity.feeNote} Net APY is unknown.</li>
                <li>Deposit and withdrawal take place on Beefy with your wallet. Smart contract and market risks apply.</li>
                <li>Fetched: {opportunity.fetchedAt}</li>
                <li>Source: {opportunity.source}</li>
                <li>APY updated: {opportunity.updatedAt ?? 'not provided by the source'}</li>
                <li>{opportunity.stale ? 'This fetch is older than 15 minutes.' : 'Fetched with this page view.'}</li>
                <li>
                  {opportunity.sourceRisk
                    ? `Beefy flags raised: ${opportunity.sourceRisk.raised.length > 0 ? opportunity.sourceRisk.raised.join(', ') : 'none'}. Risk record ${opportunity.sourceRisk.updatedAt ?? 'time not provided'}.`
                    : 'Risk flags were not returned by this source.'}
                </li>
                <li>{opportunity.withdrawalNote}</li>
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
      <div className="panel-title"><h2 id="earn-catalog-title">Earn opportunities</h2><span className="quiet-chip">BNB Chain</span></div>
      <div className="catalog-filters">
        <label>Asset<select aria-label="Asset" value={asset} onChange={(event) => setAsset(event.target.value)}><option value="">All assets</option>{assets.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Protocol<select aria-label="Protocol" value={protocol} onChange={(event) => setProtocol(event.target.value)}><option value="">All protocols</option>{protocols.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
      {catalog ? <EarnCatalogView catalog={catalog} asset={asset} protocol={protocol} /> : <p className="footnote">Loading opportunities…</p>}
    </section>
  )
}
