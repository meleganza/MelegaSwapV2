import React from 'react'
import { BNB_QUOTE_TOKENS, formatUnits, quoteIsStale, type BnbQuoteResult, type FactualBnbQuote } from '../../lib/bscQuote'
import { readGenerationCurrent } from '../../lib/readGeneration'
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
      <div className="quote-result-main"><small>{stale ? 'Quote expired' : result.venueLabel}</small><strong>{formatUnits(result.amountOutRaw, 18)} {result.buy}</strong></div>
      <details className="advanced-details"><summary>Analytics</summary><ul className="result-list">
        <li>Raw output: {result.amountOutRaw}</li><li>Quoted at {result.quotedAt}</li>
        <li>Price impact and gas unavailable from this read.</li><li>No protocol fee collected.</li>
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
  const generation = React.useRef(0)
  const abortRef = React.useRef<AbortController | null>(null)

  function editQuote(apply: () => void) {
    abortRef.current?.abort()
    generation.current += 1
    apply()
    setResult(null)
    setShadow(false)
    setPending(false)
  }

  async function onPreview() {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const issued = generation.current + 1
    generation.current = issued
    setResult(null)
    setPending(true)
    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chainId: 56, sell, buy, amount }),
        signal: controller.signal,
      })
      if (!readGenerationCurrent(issued, generation.current)) return
      const body = (await response.json()) as BnbQuoteResult
      setResult(body)
    } catch {
      if (!readGenerationCurrent(issued, generation.current) || controller.signal.aborted) return
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
      if (readGenerationCurrent(issued, generation.current)) setPending(false)
    }
  }

  return (
    <section className="quote-panel compact-swap" aria-labelledby="quote-title">
      <h2 id="quote-title" className="sr-only">Swap quote</h2>
      <div className="asset-field interactive-asset">
        <label htmlFor="quote-amount" className="field-label">Sell</label>
        <input id="quote-amount" className="asset-amount" inputMode="decimal" value={amount} onChange={(event) => editQuote(() => setAmount(event.target.value))} aria-label="Amount to sell" />
        <label className="token-select"><span className="sr-only">Sell token</span><select id="quote-sell" value={sell} onChange={(event) => editQuote(() => setSell(event.target.value))}>
            {BNB_QUOTE_TOKENS.map((token) => (
              <option key={token.symbol} value={token.symbol}>{token.symbol}</option>
            ))}
          </select></label>
      </div>
      <button className="swap-direction" type="button" aria-label="Switch tokens" onClick={() => editQuote(() => { setSell(buy); setBuy(sell) })}>↓</button>
      <div className="asset-field asset-field-output interactive-asset">
        <span className="field-label">Buy</span><strong>{result?.ok ? formatUnits(result.amountOutRaw, 18) : '0.00'}</strong>
        <label className="token-select token-select-buy"><span className="sr-only">Buy token</span><select id="quote-buy" value={buy} onChange={(event) => editQuote(() => setBuy(event.target.value))}>
            {BNB_QUOTE_TOKENS.map((token) => (
              <option key={token.symbol} value={token.symbol}>{token.symbol}</option>
            ))}
          </select></label>
      </div>
      <button className="primary-action" type="button" onClick={onPreview} disabled={pending}>
        {pending ? 'Getting quote…' : 'Get quote'}
      </button>
      <div className="swap-summary" aria-label="Quote summary"><span><small>Rate</small><strong>—</strong></span><span><small>Fee</small><strong>—</strong></span><span><small>Slippage</small><strong>—</strong></span></div>
      {result ? <QuoteResultView result={result} nowMs={Date.now()} /> : null}
      {result?.ok && !shadow ? (
        <button className="primary-action" type="button" onClick={() => setShadow(true)}>
          Advanced readiness
        </button>
      ) : null}
      {result?.ok && shadow ? <ShadowReadinessPanel quote={result as FactualBnbQuote} amount={amount} /> : null}
      <details className="advanced-details analytics-entry"><summary>Analytics</summary><p className="muted-copy">Quote details appear after a verified read.</p></details>
      <p className="action-hint">Preview only · No wallet or transaction</p>
    </section>
  )
}
