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

export function EarnCatalogView({ catalog, asset, protocol, sort = 'tvl' }: { catalog: EarnCatalog; asset: string; protocol: string; sort?: 'tvl' | 'apy' }) {
  const [limit, setLimit] = React.useState(6)
  const [amount, setAmount] = React.useState('')
  const principal = Number(amount)
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
  if (sort === 'apy') visible.sort((a, b) => (b.apyDecimal ?? -Infinity) - (a.apyDecimal ?? -Infinity))
  return (
    <div data-executable="false" data-deposit="false" data-catalog="bnb">
      <label className="earn-estimate">Compare estimated annual rewards (USD)
        <input type="number" min="0" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Enter an amount" />
      </label>
      {visible.length === 0 ? <p className="inline-alert">No verified matches.</p> : null}
      <div className="earn-catalog">
        {visible.slice(0, limit).map((opportunity) => (
          <article className="earn-card" key={opportunity.id}>
            <div className="pair-art">{opportunity.assets.slice(0, 2).map((asset) => <TokenMark key={asset} symbol={asset} size={34} />)}</div>
            <span className="verified-label">Beefy · PancakeSwap · BNB</span><h3>{opportunity.assets.join(' / ')}</h3>
            <div className="earn-metrics"><span><small>APY</small><strong>{formatReportedApy(opportunity.apyDecimal) ?? '—'}</strong></span><span><small>TVL</small><strong>{formatReportedTvl(opportunity.tvlUsd) === null ? '—' : `$${formatReportedTvl(opportunity.tvlUsd)}`}</strong></span></div>
            {principal > 0 && Number.isFinite(principal) && !opportunity.stale && opportunity.apyDecimal !== null && Number.isFinite(principal * opportunity.apyDecimal) ? (
              <p className="footnote">Estimated annual reward: {(principal * opportunity.apyDecimal).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}. APY can change.</p>
            ) : null}
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
      {visible.length > limit ? <button type="button" className="card-action earn-more" onClick={() => setLimit(limit + 6)}>Show more vaults</button> : null}
    </div>
  )
}

export default function EarnCatalogPanel({ native, positions }: { native?: React.ReactNode; positions?: React.ReactNode }) {
  const [catalog, setCatalog] = React.useState<EarnCatalog | null>(null)
  const [asset, setAsset] = React.useState('')
  const [protocol, setProtocol] = React.useState('')
  const [view, setView] = React.useState<'discover' | 'positions' | 'liquidity'>('discover')
  const [sort, setSort] = React.useState<'tvl' | 'apy'>('tvl')
  const assets = [...new Set(['BNB', 'WBNB', 'MARCO', ...(catalog?.ok ? catalog.opportunities.flatMap((row) => row.assets) : [])])].sort()

  React.useEffect(() => {
    const controller = new AbortController()
    fetch('/api/earn-catalog', { signal: controller.signal })
      .then(async (response) => (await response.json()) as EarnCatalog)
      .then((body) => { if (!controller.signal.aborted) setCatalog(body) })
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
    <section className="earn-browser" aria-label="Earn workspace">
      <div className="earn-navigation" role="group" aria-label="Earn views">
        <button type="button" aria-pressed={view === 'discover'} onClick={() => setView('discover')}>Discover</button>
        <button type="button" aria-pressed={view === 'positions'} onClick={() => setView('positions')}>Positions</button>
        <button type="button" aria-pressed={view === 'liquidity'} onClick={() => setView('liquidity')}>Add liquidity</button>
      </div>
      <div hidden={view !== 'positions'}>{positions}</div>
      {view === 'liquidity' ? (
        <section className="earn-card earn-liquidity" aria-label="Add liquidity">
          <h3>Add liquidity</h3>
          <p>Choose two tokens in Melega, enter an amount and review both amounts before confirming.</p>
          <a className="card-action" href="https://www.melega.finance/liquidity?view=add">Continue on Melega DEX ↗</a>
          <p className="footnote">This opens the live DEX. Transactions are disabled in this preview.</p>
        </section>
      ) : null}
      {view === 'discover' ? <>
        <div className="earn-filter-bar">
          <label><span>Asset</span><select value={asset} onChange={(event) => setAsset(event.target.value)}><option value="">All assets</option>{assets.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Provider</span><select value={protocol} onChange={(event) => setProtocol(event.target.value)}><option value="">All providers</option><option value="melega">Melega</option><option value="beefy">Beefy</option></select></label>
          <label><span>Sort vaults</span><select value={sort} onChange={(event) => setSort(event.target.value === 'apy' ? 'apy' : 'tvl')}><option value="tvl">TVL</option><option value="apy">APY</option></select></label>
        </div>
        {protocol !== 'beefy' && ['', 'BNB', 'WBNB', 'MARCO'].includes(asset) ? native : null}
        {protocol !== 'melega' && (catalog ? <EarnCatalogView key={asset + sort} catalog={catalog} asset={asset} protocol="" sort={sort} /> : <p className="footnote" role="status">Loading Beefy vaults…</p>)}
        {protocol === 'melega' && !['', 'BNB', 'WBNB', 'MARCO'].includes(asset) ? <p role="status">No Melega farm matches this asset.</p> : null}
      </> : null}
    </section>
  )
}
