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
          ? 'The Beefy catalog timed out. No APY or TVL is shown.'
          : 'The Beefy catalog is unavailable. No APY or TVL is shown.'}
      </p>
    )
  }
  const visible = catalog.opportunities.filter((opportunity) => matches(opportunity, asset, protocol))
  return (
    <div data-executable="false" data-deposit="false" data-catalog="bnb">
      <p className="muted-copy">
        Source {catalog.source}. Fetched {catalog.fetchedAt}. The source did not provide an updated time. Chain 56.
      </p>
      {visible.length === 0 ? <p className="muted-copy">No listed opportunity matches that filter.</p> : null}
      <div className="earn-catalog">
        {visible.map((opportunity) => (
          <article className="earn-card" key={opportunity.id}>
            <h3>{opportunity.assets.join(' / ')}</h3>
            <p className="earn-compare">
              APY {formatReportedApy(opportunity.apyDecimal) ?? 'unavailable'} · TVL{' '}
              {formatReportedTvl(opportunity.tvlUsd) === null ? 'unavailable' : `${formatReportedTvl(opportunity.tvlUsd)} USD`}
            </p>
            <p className="muted-copy">
              Melega fee: 0. This link has no referral or revenue-share parameter. Third-party: {opportunity.feeNote} Net APY is unknown.
            </p>
            <p className="muted-copy">
              Leaves this beta. Deposit, manage, and withdraw use your wallet on Beefy for {opportunity.assets.join(' / ')} on BNB chain {opportunity.chainId}. Melega does not custody this vault or send the transaction.
            </p>
            <a href={opportunity.href} target="_blank" rel="noreferrer noopener" referrerPolicy="no-referrer">
              Continue on Beefy
            </a>
            <details>
              <summary>Source and risk</summary>
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
      <div className="panel-title">
        <div>
          <p className="section-kicker">External catalog</p>
          <h2 id="earn-catalog-title">PancakeSwap vaults on BNB</h2>
        </div>
        <span className="quiet-chip">Read only</span>
      </div>
      <p className="muted-copy">Active PancakeSwap vaults listed by Beefy. This beta does not deposit, approve, or sign.</p>
      <div className="filter-row" aria-label="Asset filter">
        <button type="button" className={asset === '' ? 'selected' : undefined} onClick={() => setAsset('')}>
          All assets
        </button>
        {assets.map((item) => (
          <button key={item} type="button" className={asset === item ? 'selected' : undefined} onClick={() => setAsset(asset === item ? '' : item)}>
            {item}
          </button>
        ))}
      </div>
      <div className="filter-row" aria-label="Protocol filter">
        <button type="button" className={protocol === '' ? 'selected' : undefined} onClick={() => setProtocol('')}>
          All protocols
        </button>
        {protocols.map((item) => (
          <button key={item} type="button" className={protocol === item ? 'selected' : undefined} onClick={() => setProtocol(protocol === item ? '' : item)}>
            {item}
          </button>
        ))}
      </div>
      {catalog ? <EarnCatalogView catalog={catalog} asset={asset} protocol={protocol} /> : <p className="footnote">Reading the Beefy BNB catalog.</p>}
    </section>
  )
}
