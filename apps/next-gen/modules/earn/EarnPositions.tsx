import React from 'react'
import type { EarnPositions } from '../../lib/earnPositions'

export function EarnPositionView({ result }: { result: EarnPositions }) {
  if (!result.ok) {
    return (
      <p className="inline-alert" role="status" data-positions="unavailable">
        {result.code === 'ADDRESS_REJECTED'
          ? 'That address was not accepted. No receipt balance was read.'
          : result.code === 'CHAIN_MISMATCH'
            ? 'The chain did not match BNB. No receipt balance was read.'
            : 'Listed receipt balances are unavailable. No position is shown.'}
      </p>
    )
  }
  return (
    <div data-executable="false" data-deposit="false" data-positions="listed">
      <ul className="facts">
        {result.rows.map((row) => (
          <li key={row.id}>
            {row.assets.join(' / ')}:{' '}
            {row.status === 'balance'
              ? `receipt ${row.display ?? row.raw}`
              : row.status === 'unsupported'
                ? 'receipt token was not returned. Position unsupported.'
                : 'receipt balance unavailable.'}{' '}
            <a href={row.href} target="_blank" rel="noreferrer noopener" referrerPolicy="no-referrer">
              Manage on Beefy
            </a>
          </li>
        ))}
      </ul>
      <p className="muted-copy">A receipt balance is not a USD position. Withdrawal stays on Beefy.</p>
    </div>
  )
}

export default function EarnPositionPanel() {
  const [address, setAddress] = React.useState('')
  const [result, setResult] = React.useState<EarnPositions | null>(null)
  const [pending, setPending] = React.useState(false)

  async function onRead() {
    setPending(true)
    try {
      const response = await fetch('/api/earn-positions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chainId: 56, address }),
      })
      setResult((await response.json()) as EarnPositions)
    } catch {
      setResult(null)
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="quote-panel" id="beefy-positions" aria-labelledby="earn-positions-title">
      <h2 id="earn-positions-title">Listed receipt balances</h2>
      <p className="muted-copy">Enter a public address. Only the vaults on this page are read. No wallet is connected.</p>
      <label htmlFor="earn-position-address">
        Public address
        <input id="earn-position-address" value={address} autoComplete="off" spellCheck={false} onChange={(event) => setAddress(event.target.value)} />
      </label>
      <button className="primary-action" type="button" onClick={onRead} disabled={pending}>
        {pending ? 'Reading receipts' : 'Read listed receipts'}
      </button>
      {result ? <EarnPositionView result={result} /> : null}
    </section>
  )
}
