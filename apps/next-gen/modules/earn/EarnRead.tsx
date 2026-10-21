import React from 'react'
import type { EarnRead } from '../../lib/earnRead'
import { LIVE_FARM_EXIT, LIVE_LIQUIDITY_EXIT, LIVE_POOL_EXIT } from '../../lib/nativeEarnChains'

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
        <li>Chain 56. Farm pid {result.pid}. Label {result.label}.</li>
        <li>Farm contract {result.chefAddress}.</li>
        <li>Stake token {result.lpToken}. It matches the certified MARCO address.</li>
        <li>allocPoint {result.allocPoint}.</li>
        <li>APY is unavailable. This read does not return one.</li>
        <li>TVL is unavailable. This read does not return one.</li>
        <li>This beta does not send a deposit or a withdrawal.</li>
      </ul>
      <p className="muted-copy">Leaves this beta. The live DEX opens your farm and pool positions. Switch the wallet to BNB Smart Chain there.</p>
      <ul className="result-links">
        <li>
          <a href={LIVE_FARM_EXIT} rel="noreferrer noopener" referrerPolicy="no-referrer">
            Farm positions on the live DEX
          </a>
        </li>
        <li>
          <a href={LIVE_POOL_EXIT} rel="noreferrer noopener" referrerPolicy="no-referrer">
            Pool positions on the live DEX
          </a>
        </li>
        <li>
          <a href={LIVE_LIQUIDITY_EXIT} rel="noreferrer noopener" referrerPolicy="no-referrer">
            Remove liquidity on the live DEX
          </a>
        </li>
      </ul>
    </div>
  )
}

export default function EarnReadPanel() {
  const [result, setResult] = React.useState<EarnRead | null>(null)

  React.useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      try {
        const response = await fetch('/api/earn', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ chainId: 56 }),
          signal: controller.signal,
        })
        const body = (await response.json()) as EarnRead
        if (!controller.signal.aborted) setResult(body)
      } catch {
        if (!controller.signal.aborted) {
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
    return () => controller.abort()
  }, [])

  return (
    <section className="quote-panel" aria-labelledby="earn-read-title">
      <h2 id="earn-read-title">BNB farm</h2>
      {result ? <EarnResult result={result} /> : <p className="footnote">Reading one BNB farm row.</p>}
    </section>
  )
}
