import React from 'react'
import { formatUnits } from '../../lib/bscQuote'
import type { FactualBnbQuote } from '../../lib/bscQuote'
import type { ShadowReadiness } from '../../lib/shadowReadiness'

function quantity(raw: string | null): string {
  return raw === null ? 'unread' : formatUnits(raw, 18)
}

export function ShadowResult({ result }: { result: ShadowReadiness }) {
  return (
    <div data-executable="false" data-broadcast="false" data-signed="false" data-shadow="diagnostic">
      <p className="inline-alert" role="status">
        Shadow diagnostic. Not executable.
      </p>
      <ul className="facts">
        <li>
          Quote: {result.quote.status}
          {result.quote.venueLabel ? ` · ${result.quote.venueLabel}` : ''}. Output is not re-quoted here.
        </li>
        <li>Wallet: not connected. Activation requires a chain 56 wallet. This field is a public address.</li>
        <li>
          Balance: {result.balance.status}
          {result.balance.raw !== null ? ` · ${quantity(result.balance.raw)}` : ''}.
        </li>
        <li>
          Executor allowance: {result.allowance.executor.status}
          {result.allowance.executor.raw !== null ? ` · ${quantity(result.allowance.executor.raw)}` : ''}.
        </li>
        <li>
          Router allowance: {result.allowance.router.status}
          {result.allowance.router.raw !== null ? ` · ${quantity(result.allowance.router.raw)}` : ''}.
        </li>
        <li>Fee: collection is not certified. No fee amount is shown.</li>
        <li>Gas: omitted. A gas estimate needs the legacy unsigned payload.</li>
        <li>Unsigned transaction: not prepared. The live adapter stays outside this beta.</li>
        <li>No wallet, approval, signature, or broadcast.</li>
      </ul>
    </div>
  )
}

export default function ShadowReadinessPanel({ quote, amount }: { quote: FactualBnbQuote; amount: string }) {
  const [address, setAddress] = React.useState('')
  const [result, setResult] = React.useState<ShadowReadiness | null>(null)
  const [pending, setPending] = React.useState(false)

  async function onRead() {
    setPending(true)
    try {
      const response = await fetch('/api/shadow-readiness', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          chainId: 56,
          address,
          quote: {
            quotedAt: quote.quotedAt,
            staleAfterMs: quote.staleAfterMs,
            sell: quote.sell,
            buy: quote.buy,
            amount,
            amountInRaw: quote.amountInRaw,
            amountOutRaw: quote.amountOutRaw,
            router: quote.router,
            venueId: quote.venueId,
            path: quote.path,
          },
        }),
      })
      setResult((await response.json()) as ShadowReadiness)
    } catch {
      setResult(null)
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="quote-panel" aria-labelledby="shadow-title">
      <div className="panel-title">
        <div>
          <p className="section-kicker">Shadow only</p>
          <h2 id="shadow-title">Transaction readiness</h2>
        </div>
        <span className="quiet-chip">Not executable</span>
      </div>
      <p className="muted-copy">Compares the previewed quote with public balance and allowance. Nothing is signed or sent.</p>
      <label htmlFor="shadow-address">
        Public address
        <input
          id="shadow-address"
          value={address}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => setAddress(event.target.value)}
        />
      </label>
      <button className="primary-action" type="button" onClick={onRead} disabled={pending}>
        {pending ? 'Reading readiness' : 'Read shadow readiness'}
      </button>
      {result ? <ShadowResult result={result} /> : null}
    </section>
  )
}
