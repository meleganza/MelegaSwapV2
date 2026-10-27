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
    <article className="earn-feature" data-executable="false" data-deposit="false" data-apr="unavailable" data-chain="56">
      <div className="earn-token-art" aria-hidden="true">M</div>
      <div className="earn-feature-copy"><span className="verified-label">Melega farm · BNB</span><h3>{result.label}</h3><div className="earn-metrics"><span><small>APY</small><strong>—</strong></span><span><small>TVL</small><strong>—</strong></span></div></div>
      <a className="card-action" href={LIVE_FARM_EXIT} rel="noreferrer noopener" referrerPolicy="no-referrer">View farm</a>
      <details className="advanced-details earn-details"><summary>Details</summary><ul className="facts"><li>Chain 56 · Farm {result.pid}</li><li>Contract {result.chefAddress}</li><li>Stake token {result.lpToken}</li><li>APY and TVL are not returned by this read.</li></ul><div className="detail-links"><a href={LIVE_POOL_EXIT}>Pools</a><a href={LIVE_LIQUIDITY_EXIT}>Liquidity</a></div></details>
    </article>
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
      <h2 id="earn-read-title" className="sr-only">BNB farm</h2>
      {result ? <EarnResult result={result} /> : <p className="footnote">Reading one BNB farm row.</p>}
    </section>
  )
}
