import React from 'react'
import {
  MAX_RETIRED_PAGES,
  RETIRED_POSITION_CHAINS,
  mergeRetiredReads,
  retiredLookupStillCurrent,
  type RetiredLookupIdentity,
  type RetiredPositionRead,
} from '../../lib/retiredPositions'
import { nativeEarnChain } from '../../lib/nativeEarnChains'

export function RetiredPositionResult({ result }: { result: RetiredPositionRead }) {
  const incomplete = !result.complete
  return (
    <div data-state={result.state} data-complete={result.complete ? 'true' : 'false'} data-deposit="false" data-withdraw="false" data-executable="false">
      <p className="inline-alert" role="status">
        {result.complete && result.state === 'zero'
          ? 'Every farm on this chain returned staked 0 and pending 0.'
          : result.complete && result.state === 'nonzero'
            ? 'Staked or pending balance found.'
            : 'Incomplete farm read. A zero balance is not shown.'}
      </p>
      {incomplete ? <p className="muted-copy">This scan is not complete.</p> : null}
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
  const lookupRef = React.useRef<RetiredLookupIdentity>({ id: 0, chainId: 137, address: '' })
  const abortRef = React.useRef<AbortController | null>(null)

  function invalidate(next: { chainId?: number; address?: string }) {
    abortRef.current?.abort()
    abortRef.current = null
    lookupRef.current = {
      id: lookupRef.current.id + 1,
      chainId: next.chainId ?? lookupRef.current.chainId,
      address: next.address ?? lookupRef.current.address,
    }
    setChainId(lookupRef.current.chainId)
    setAddress(lookupRef.current.address)
    setResult(null)
    setPending(false)
  }

  async function onRead() {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const issued: RetiredLookupIdentity = {
      id: lookupRef.current.id + 1,
      chainId: lookupRef.current.chainId,
      address: lookupRef.current.address,
    }
    lookupRef.current = issued
    setResult(null)
    setPending(true)
    try {
      const pages: RetiredPositionRead[] = []
      let cursor = 0
      for (let hop = 0; hop < MAX_RETIRED_PAGES; hop += 1) {
        if (!retiredLookupStillCurrent(issued, lookupRef.current)) return
        const response = await fetch('/api/retired-positions', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ chainId: issued.chainId, address: issued.address, cursor }),
          signal: controller.signal,
        })
        const page = (await response.json()) as RetiredPositionRead
        if (!retiredLookupStillCurrent(issued, lookupRef.current)) return
        pages.push(page)
        if (page.poolLength === null || page.nextCursor === null || page.nextCursor === cursor) break
        if (page.code === 'CHAIN_MISMATCH' || page.code === 'ADDRESS_REJECTED' || page.code === 'CURSOR_REJECTED' || page.code === 'UNBOUNDED') break
        cursor = page.nextCursor
      }
      if (!retiredLookupStillCurrent(issued, lookupRef.current)) return
      setResult(mergeRetiredReads(pages))
    } catch {
      if (!retiredLookupStillCurrent(issued, lookupRef.current) || controller.signal.aborted) return
      setResult(null)
    } finally {
      if (retiredLookupStillCurrent(issued, lookupRef.current)) setPending(false)
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
          <button key={id} type="button" className={chainId === id ? 'selected' : undefined} onClick={() => invalidate({ chainId: id })}>
            {nativeEarnChain(id)?.name}
          </button>
        ))}
      </div>
      <label htmlFor="retired-address">
        Public address
        <input
          id="retired-address"
          value={address}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => invalidate({ address: event.target.value })}
        />
      </label>
      <button className="primary-action" type="button" onClick={onRead} disabled={pending}>
        {pending ? 'Reading farms' : 'Read staked farms'}
      </button>
      {result ? <RetiredPositionResult result={result} /> : null}
    </section>
  )
}
