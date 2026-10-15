import React from 'react'

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

function provider(): EthereumProvider | null {
  const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum
  if (!ethereum || typeof ethereum.request !== 'function') return null
  return ethereum
}

export function BnbWalletPrepare({ sell, buy, amount }: { sell: string; buy: string; amount: string }) {
  const [account, setAccount] = React.useState<string | null>(null)
  const [chainId, setChainId] = React.useState<number | null>(null)
  const [status, setStatus] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  async function onConnect() {
    const ethereum = provider()
    if (!ethereum) {
      setStatus('NO_WALLET_PROVIDER')
      return
    }
    setPending(true)
    try {
      const accounts = (await ethereum.request({ method: 'eth_requestAccounts' })) as string[]
      const chainHex = (await ethereum.request({ method: 'eth_chainId' })) as string
      const nextChain = Number(BigInt(chainHex))
      setAccount(accounts[0] ?? null)
      setChainId(nextChain)
      setStatus(nextChain === 56 ? 'CONNECTED' : 'CHAIN_MISMATCH')
    } catch {
      setStatus('WALLET_REJECTED')
    } finally {
      setPending(false)
    }
  }

  async function onPrepare() {
    if (!account || chainId !== 56) {
      setStatus(chainId == null ? 'WALLET_REQUIRED' : 'CHAIN_MISMATCH')
      return
    }
    setPending(true)
    try {
      const response = await fetch('/api/sealed-prepare', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chainId, sell, buy, amount, user: account, slippageBps: 50 }),
      })
      const prepared = (await response.json()) as { ok?: boolean; code?: string; feeBps?: number | null; gasUnits?: string | null }
      if (prepared.ok) {
        setStatus(`PREPARED_UNSIGNED feeBps ${prepared.feeBps ?? 'unavailable'} gas ${prepared.gasUnits ?? 'not returned'}`)
      } else {
        setStatus(prepared.code ?? 'UNAVAILABLE')
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'UNAVAILABLE')
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="quote-panel" aria-labelledby="wallet-prepare-title">
      <h2 id="wallet-prepare-title">BNB wallet</h2>
      <p className="muted-copy">Connection does not sign, approve, or broadcast.</p>
      <button className="primary-action" type="button" onClick={onConnect} disabled={pending}>
        {account ? 'Refresh BNB wallet' : 'Connect BNB wallet'}
      </button>
      <button className="primary-action" type="button" onClick={onPrepare} disabled={pending}>
        Prepare unsigned transaction
      </button>
      {status ? (
        <p className="inline-alert" role="status" data-broadcast="false" data-signed="false">
          {status}
          {chainId != null ? ` · chain ${chainId}` : ''}
          {account ? ` · ${account}` : ''}
        </p>
      ) : null}
    </section>
  )
}
