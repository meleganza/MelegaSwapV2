import React from 'react'
import { BNB_QUOTE_TOKENS, formatUnits, quoteIsStale, type BnbQuoteResult, type FactualBnbQuote } from '../../lib/bscQuote'
import ShadowReadinessPanel from './ShadowReadiness'

export function QuoteResultView({ result, nowMs }: { result: BnbQuoteResult; nowMs: number }) {
  if (!result.ok) {
    return (
      <p className="inline-alert" role="status" data-operational="false" data-executable="false">
        {result.code === 'QUOTE_TIMEOUT'
          ? 'The quote read timed out. No number is shown.'
          : result.code === 'CHAIN_MISMATCH'
            ? 'The chain did not match BNB. No number is shown.'
            : 'No factual quote was returned.'}
      </p>
    )
  }
  const stale = quoteIsStale(result.quotedAt, nowMs, result.staleAfterMs)
  return (
    <div data-operational="false" data-executable="false" data-quote="factual">
      <p className="inline-alert" role="status">
        {stale ? 'Quote expired — refresh to continue' : 'Quote ready'}
      </p>
      <ul className="result-list">
        <li>Venue: {result.venueLabel}</li>
        <li>
          Output: {formatUnits(result.amountOutRaw, 18)} {result.buy}
        </li>
      </ul>
      <details className="quote-details"><summary>Quote details &amp; conditions</summary><ul className="result-list">
        <li>Raw output: {result.amountOutRaw}</li>
        <li>Quoted at {result.quotedAt}. Refresh after {result.staleAfterMs / 1000} seconds.</li>
        <li>Price impact and gas are unavailable when the route does not return them.</li>
        <li>This preview does not add a Melega protocol fee.</li>
      </ul></details>
    </div>
  )
}

export default function BnbQuotePreview() {
  const [sell, setSell] = React.useState('WBNB')
  const [buy, setBuy] = React.useState('USDT')
  const [amount, setAmount] = React.useState('0.01')
  const [result, setResult] = React.useState<BnbQuoteResult | null>(null)
  const [pending, setPending] = React.useState(false)
  const [shadow, setShadow] = React.useState(false)
  const [WalletPanel, setWalletPanel] = React.useState<React.ComponentType<{ sell: string; buy: string; amount: string }> | null>(null)

  async function onPreview() {
    setPending(true)
    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chainId: 56, sell, buy, amount }),
      })
      const body = (await response.json()) as BnbQuoteResult
      setResult(body)
    } catch {
      setResult({
        ok: false,
        code: 'QUOTE_UNAVAILABLE',
        executable: false,
        feeCollected: false,
        priceImpactPercent: null,
        gasUnits: null,
        rpcCalls: 0,
        durationMs: 0,
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="quote-panel" aria-labelledby="quote-title">
      <div className="panel-title"><div><p className="section-kicker">Review route</p><h2 id="quote-title">Swap quote</h2></div><span className="quiet-chip">BNB Chain</span></div>
      <div className="quote-grid">
        <label htmlFor="quote-sell">
          Sell
          <select id="quote-sell" value={sell} onChange={(event) => setSell(event.target.value)}>
            {BNB_QUOTE_TOKENS.map((token) => (
              <option key={token.symbol} value={token.symbol}>
                {token.symbol}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="quote-buy">
          Buy
          <select id="quote-buy" value={buy} onChange={(event) => setBuy(event.target.value)}>
            {BNB_QUOTE_TOKENS.map((token) => (
              <option key={token.symbol} value={token.symbol}>
                {token.symbol}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="quote-amount">
          Amount
          <input id="quote-amount" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} />
        </label>
      </div>
      <button className="primary-action" type="button" onClick={onPreview} disabled={pending}>
        {pending ? 'Finding route' : 'Get quote'}
      </button>
      {result ? <QuoteResultView result={result} nowMs={Date.now()} /> : null}
      {result?.ok && !shadow ? (
        <button className="primary-action" type="button" onClick={() => setShadow(true)}>
          Open shadow readiness
        </button>
      ) : null}
      {result?.ok && shadow ? <ShadowReadinessPanel quote={result as FactualBnbQuote} amount={amount} /> : null}
      {result?.ok && !WalletPanel ? (
        <button
          className="primary-action"
          type="button"
          onClick={() => {
            void import('./BnbWalletPrepare').then((mod) => setWalletPanel(() => mod.BnbWalletPrepare))
          }}
        >
          Connect Wallet
        </button>
      ) : null}
      {result?.ok && WalletPanel ? <WalletPanel sell={sell} buy={buy} amount={amount} /> : null}
    </section>
  )
}
