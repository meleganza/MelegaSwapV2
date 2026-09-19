import React from 'react'
import { createRoot } from 'react-dom/client'
import { useLiquidityMintRuntime } from '../../apps/web/src/views/LiquidityStudio/liquidityRuntime/useLiquidityMintRuntime'
import { LiquidityRemovePanel } from '../../apps/web/src/views/LiquidityStudio/v3/LiquidityRemovePanel'
import { setRuntime, confirmApproval, evidence, chainId } from './mocks'
function App() {
  const runtime = useLiquidityMintRuntime({ initialMode: 'Remove Liquidity', terminalEnabled: false })
  setRuntime(runtime)
  return (
    <main style={{ padding: 20 }}>
      <p>
        LOCAL ACCEPTANCE · {chainId === 1 ? 'Ethereum' : 'BNB Chain'} · Simulated wallet/RPC · No public transactions
      </p>
      <h1>Add / Remove Liquidity</h1>
      <LiquidityRemovePanel />
      <button data-testid="settle" onClick={confirmApproval} style={{ marginTop: 20 }}>
        Fixture: confirm approval on chain
      </button>
      <details>
        <summary>Local transaction evidence</summary>
        <pre data-testid="evidence" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
          {JSON.stringify(evidence, null, 2)}
        </pre>
      </details>
    </main>
  )
}
createRoot(document.getElementById('root')!).render(<App />)
