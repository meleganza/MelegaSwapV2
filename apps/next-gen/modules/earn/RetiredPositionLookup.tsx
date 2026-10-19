import React from 'react'
import { RETIRED_POSITION_CHAINS, type RetiredPositionRead } from '../../lib/retiredPositions'
import { nativeEarnChain } from '../../lib/nativeEarnChains'

export function RetiredPositionResult({ result }: { result: RetiredPositionRead }) {
  return (
    <div data-state={result.state} data-deposit="false" data-withdraw="false" data-executable="false">
      <p className="inline-alert" role="status">
        {result.state === 'nonzero'
          ? `Staked or pending balance found on ${result.readPids} read farms.`
          : result.state === 'zero'
            ? 'Every read farm returned staked 0 and pending 0.'
            : 'The farm read is incomplete. A zero balance is not shown.'}
      </p>
      {result.failedPids > 0 ? <p className="muted-copy">{result.failedPids} farms were not read.</p> : null}
      {result.rows.length > 0 ? (
        <ul className="facts">
          {result.rows.map((row) => (
            <li key={row.pid}>
              Pid {row.pid}: staked {row.stakedRaw}
              {row.pendingRaw === null ? ', pending unread' : `, pending ${row.pendingRaw}`}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export default function RetiredPositionLookup() {
  const [chainId, setChainId] = React.useState<number>(137)
  const [address, setAddress] = React.useState('')
  const [result, setResult] = React.useState<RetiredPositionRead | null>(null)
  const [pending, setPending] = React.useState(false)

  async function onRead() {
    setPending(true)
    try {
      const response = await fetch('/api/retired-positions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chainId, address }),
      })
      setResult((await response.json()) as RetiredPositionRead)
    } catch {
      setResult(null)
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="quote-panel" aria-labelledby="retired-read-title">
      <h2 id="retired-read-title">Read a retired farm position</h2>
      <p className="muted-copy">
        Submit a public address. This reads staked amount and pending reward on the native farm contract only.
        Unstaked liquidity and pool balances are not read. Nothing is withdrawn.
      </p>
      <div className="filter-row" aria-label="Retired chain">
        {RETIRED_POSITION_CHAINS.map((id) => (
          <button key={id} type="button" className={chainId === id ? 'selected' : undefined} onClick={() => setChainId(id)}>
            {nativeEarnChain(id)?.name}
          </button>
        ))}
      </div>
      <label htmlFor="retired-address">
        Public address
        <input id="retired-address" value={address} autoComplete="off" spellCheck={false} onChange={(event) => setAddress(event.target.value)} />
      </label>
      <button className="primary-action" type="button" onClick={onRead} disabled={pending}>
        {pending ? 'Reading farms' : 'Read staked farms'}
      </button>
      {result ? <RetiredPositionResult result={result} /> : null}
    </section>
  )
}
