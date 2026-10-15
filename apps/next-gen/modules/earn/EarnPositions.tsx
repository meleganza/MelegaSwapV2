import React from 'react'
import { emptyPositions, type EarnPositions } from '../../lib/earnPositions'

export function EarnPositionView({ result }: { result: EarnPositions }) {
  if (!result.ok) {
    return (
      <p className="inline-alert" role="status" data-positions="unavailable">
        {result.code === 'ADDRESS_REJECTED'
          ? 'That address was not accepted. No receipt balance was read.'
          : result.code === 'CHAIN_MISMATCH'
            ? 'The chain did not match BNB. No receipt balance was read.'
            : 'Beefy positions are unavailable. No position is shown.'}
      </p>
    )
  }
  return (
    <div data-executable="false" data-deposit="false" data-positions="listed">
      <ul className="facts">
        {[...result.rows].sort((a, b) => Number(BigInt(b.raw ?? '0') > BigInt(0)) - Number(BigInt(a.raw ?? '0') > BigInt(0))).map((row) => (
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
      <p className="muted-copy">Receipt token balances · Withdraw on Beefy ↗</p>
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
      setResult(emptyPositions('UNAVAILABLE'))
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="quote-panel" id="beefy-positions" aria-labelledby="earn-positions-title">
      <h2 id="earn-positions-title">Beefy positions</h2>
      <p className="muted-copy">Public address · Listed BNB vaults only</p>
      <label htmlFor="earn-position-address">
        Public address
        <input id="earn-position-address" value={address} autoComplete="off" spellCheck={false} onChange={(event) => setAddress(event.target.value)} />
      </label>
      <button className="primary-action" type="button" onClick={onRead} disabled={pending}>
        {pending ? 'Loading positions…' : 'Find positions'}
      </button>
      {result ? <EarnPositionView result={result} /> : null}
    </section>
  )
}
