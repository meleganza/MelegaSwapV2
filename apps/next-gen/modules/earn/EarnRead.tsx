import React from 'react'
import type { EarnRead } from '../../lib/earnRead'

export function EarnResult({ result }: { result: EarnRead }) {
  if (!result.ok) {
    return (
      <p className="status" role="status" data-executable="false" data-apr="unavailable">
        {result.code === 'QUOTE_TIMEOUT'
          ? 'The farm read timed out. APY and TVL are unavailable.'
          : result.code === 'CHAIN_MISMATCH'
            ? 'The chain did not match BNB. APY and TVL are unavailable.'
            : 'This farm read is unavailable. APY and TVL are unavailable.'}
      </p>
    )
  }
  return (
    <div data-executable="false" data-deposit="false" data-apr="unavailable" data-chain="56">
      <p className="status" role="status">
        {result.label} on BNB
      </p>
      <ul className="facts">
        <li>Chain 56. Farm pid {result.pid}.</li>
        <li>Stake token matches the certified MARCO address.</li>
        <li>allocPoint {result.allocPoint}.</li>
        <li>APY is unavailable. This read does not return one.</li>
        <li>TVL is unavailable. This read does not return one.</li>
        <li>Deposit and withdrawal are not available in this beta.</li>
      </ul>
    </div>
  )
}

export default function EarnReadPanel() {
  const [result, setResult] = React.useState<EarnRead | null>(null)

  React.useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const response = await fetch('/api/earn', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ chainId: 56 }),
        })
        const body = (await response.json()) as EarnRead
        if (!cancelled) setResult(body)
      } catch {
        if (!cancelled) {
          setResult({
            ok: false,
            code: 'UNAVAILABLE',
            chainId: 56,
            pid: 0,
            label: null,
            chefAddress: '',
            lpToken: null,
            allocPoint: null,
            aprPercent: null,
            tvlUsd: null,
            executable: false,
            deposit: false,
            withdraw: false,
            rpcCalls: 0,
            durationMs: 0,
          })
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="quote-panel" aria-labelledby="earn-read-title">
      <h2 id="earn-read-title">BNB farm</h2>
      {result ? <EarnResult result={result} /> : <p className="footnote">Reading one BNB farm row.</p>}
    </section>
  )
}
