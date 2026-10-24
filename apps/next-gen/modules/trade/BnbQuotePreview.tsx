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
      <p className="inline-alert" role="status">
        {stale ? 'Stale preview' : 'Read-only preview'}
      </p>
      <ul className="result-list">
        <li>Venue: {result.venueLabel}</li>
        <li>
          Output: {formatUnits(result.amountOutRaw, 18)} {result.buy}
        </li>
        <li>Raw output: {result.amountOutRaw}</li>
        <li>Quoted at {result.quotedAt}. A preview older than {result.staleAfterMs / 1000} seconds is stale.</li>
        <li>Price impact and gas are omitted because this read did not return them.</li>
        <li>Melega protocol fee collection is not certified. This preview does not collect a fee.</li>
        <li>Not executable. No wallet, approval, or signature.</li>
      </ul>
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
    <section className="quote-panel" aria-labelledby="quote-title">
      <div className="panel-title"><div><p className="section-kicker">Read-only route</p><h2 id="quote-title">BNB quote preview</h2></div><span className="quiet-chip">No execution</span></div>
      <div className="quote-grid">
        <label htmlFor="quote-sell">
          Sell
          <select id="quote-sell" value={sell} onChange={(event) => editQuote(() => setSell(event.target.value))}>
            {BNB_QUOTE_TOKENS.map((token) => (
              <option key={token.symbol} value={token.symbol}>
                {token.symbol}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="quote-buy">
          Buy
          <select id="quote-buy" value={buy} onChange={(event) => editQuote(() => setBuy(event.target.value))}>
            {BNB_QUOTE_TOKENS.map((token) => (
              <option key={token.symbol} value={token.symbol}>
                {token.symbol}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="quote-amount">
          Amount
          <input id="quote-amount" inputMode="decimal" value={amount} onChange={(event) => editQuote(() => setAmount(event.target.value))} />
        </label>
      </div>
      <button className="primary-action" type="button" onClick={onPreview} disabled={pending}>
        {pending ? 'Reading quote' : 'Preview quote'}
      </button>
      {result ? <QuoteResultView result={result} nowMs={Date.now()} /> : null}
      {result?.ok && !shadow ? (
        <button className="primary-action" type="button" onClick={() => setShadow(true)}>
          Open shadow readiness
        </button>
      ) : null}
      {result?.ok && shadow ? <ShadowReadinessPanel quote={result as FactualBnbQuote} amount={amount} /> : null}
      <p className="muted-copy">This review preview cannot connect a wallet, approve a token, or send a transaction.</p>
    </section>
  )
}
