import React from 'react'
import { formatUnits } from '../../lib/bscQuote'
import { LIVE_WITHDRAWAL_LINKS, type PortfolioRead } from '../../lib/portfolioRead'
import { readGenerationCurrent } from '../../lib/readGeneration'

export function PortfolioResult({ result }: { result: PortfolioRead }) {
  if (!result.ok && result.assets.length === 0) {
    return (
      <div data-executable="false">
        <p className="inline-alert" role="status">
          {result.code === 'ADDRESS_REJECTED'
            ? 'That address was not accepted. No balance was read.'
            : result.code === 'CHAIN_MISMATCH'
              ? 'The chain did not match BNB. No balance was read.'
              : result.code === 'QUOTE_TIMEOUT'
                ? 'The balance read timed out. No number is shown.'
                : 'No balance was returned.'}
        </p>
        <ul className="result-links">
          {LIVE_WITHDRAWAL_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} rel="noreferrer noopener" referrerPolicy="no-referrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  return (
    <div data-executable="false" data-custody="false" data-chain="56">
      <div className="asset-list">
        {result.assets.map((asset) => (
          <div className="asset-row" key={asset.symbol}><span className="asset-avatar">{asset.symbol.slice(0, 1)}</span><strong>{asset.symbol}</strong><span>
            {asset.status === 'ok' ? asset.display : '—'}
            {asset.usdtQuoteRaw && asset.usdtQuoteRaw !== '0'
              ? ` · ${formatUnits(asset.usdtQuoteRaw, 18)} USDT via router, not a USD index`
              : ''}
          </span></div>
        ))}
      </div>
      <details className="advanced-details"><summary>About these balances</summary><p className="muted-copy">BNB assets only. USD valuation and unscanned positions are omitted.</p></details>
      <ul className="result-links">
        {LIVE_WITHDRAWAL_LINKS.map((link) => (
          <li key={link.href}>
            <a href={link.href} rel="noreferrer noopener" referrerPolicy="no-referrer">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function PortfolioLookup() {
  const [address, setAddress] = React.useState('')
  const [result, setResult] = React.useState<PortfolioRead | null>(null)
  const [pending, setPending] = React.useState(false)
  const generation = React.useRef(0)
  const abortRef = React.useRef<AbortController | null>(null)

  function onAddress(value: string) {
    abortRef.current?.abort()
    generation.current += 1
    setAddress(value)
    setResult(null)
    setPending(false)
  }

  async function onRead() {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const issued = generation.current + 1
    generation.current = issued
    setResult(null)
    setPending(true)
    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chainId: 56, address }),
        signal: controller.signal,
      })
      if (!readGenerationCurrent(issued, generation.current)) return
      setResult((await response.json()) as PortfolioRead)
    } catch {
      if (!readGenerationCurrent(issued, generation.current) || controller.signal.aborted) return
      setResult({
        ok: false,
        code: 'READ_FAILED',
        chainId: 56,
        address: null,
        executable: false,
        custody: false,
        walletConnected: false,
        lpPositionsSupported: false,
        farmPositionsSupported: false,
        assets: [],
        rpcCalls: 0,
        durationMs: 0,
      })
    } finally {
      if (readGenerationCurrent(issued, generation.current)) setPending(false)
    }
  }

  return (
    <section className="quote-panel" aria-labelledby="portfolio-title">
      <h2 id="portfolio-title" className="sr-only">Public address</h2>
      <label htmlFor="portfolio-address">
        Public address
        <input
          id="portfolio-address"
          value={address}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => onAddress(event.target.value)}
        />
      </label>
      <button className="primary-action" type="button" onClick={onRead} disabled={pending}>
        {pending ? 'Loading portfolio…' : 'View portfolio'}
      </button>
      {result ? null : (
        <ul className="result-links">
          {LIVE_WITHDRAWAL_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} rel="noreferrer noopener" referrerPolicy="no-referrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
      {result ? <PortfolioResult result={result} /> : null}
    </section>
  )
}
