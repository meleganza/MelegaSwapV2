import React from 'react'
import { formatUnits } from '../../lib/bscQuote'
import { LIVE_WITHDRAWAL_LINKS, type PortfolioRead } from '../../lib/portfolioRead'

export function PortfolioResult({ result }: { result: PortfolioRead }) {
  if (!result.ok && result.assets.length === 0) {
    return (
      <div data-executable="false">
        <p className="inline-alert" role="status">
          {result.code === 'ADDRESS_REJECTED'
            ? 'Enter a valid public BNB address.'
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
      <p className="inline-alert" role="status">
        Assets · BNB Chain
      </p>
      <ul className="result-list">
        {result.assets.map((asset) => (
          <li key={asset.symbol}>
            {asset.symbol}: {asset.status === 'ok' ? asset.display : 'unavailable'}
            {asset.usdtQuoteRaw && asset.usdtQuoteRaw !== '0'
              ? ` · ${formatUnits(asset.usdtQuoteRaw, 18)} USDT via router, not a USD index`
              : ''}
          </li>
        ))}
      </ul>
      <p className="footnote">Token balances only. USD total and legacy positions are not included.</p>
    </div>
  )
}

export default function PortfolioLookup() {
  const [address, setAddress] = React.useState('')
  const [result, setResult] = React.useState<PortfolioRead | null>(null)
  const [pending, setPending] = React.useState(false)

  async function onRead() {
    setPending(true)
    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chainId: 56, address }),
      })
      setResult((await response.json()) as PortfolioRead)
    } catch {
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
      setPending(false)
    }
  }

  return (
    <section className="quote-panel" aria-labelledby="portfolio-title">
      <h3 id="portfolio-title">Public address</h3>
      <label htmlFor="portfolio-address">
        Address
        <input
          id="portfolio-address"
          value={address}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => setAddress(event.target.value)}
        />
      </label>
      <button className="primary-action" type="button" onClick={onRead} disabled={pending}>
        {pending ? 'Reading balances' : 'Show balances'}
      </button>
      {result ? <PortfolioResult result={result} /> : null}
    </section>
  )
}
