import React from 'react'
import { useAccount, useConnect, useDisconnect, useNetwork } from 'wagmi'

function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function WalletControl({ compact = false }: { compact?: boolean }) {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const { connectors, connectAsync, isLoading } = useConnect()
  const { disconnect } = useDisconnect()
  const [error, setError] = React.useState(false)

  async function connectWallet() {
    const connector = connectors.find((item) => item.id === 'metaMask' && item.ready)
      ?? connectors.find((item) => item.id === 'injected' && item.ready)
    if (!connector) {
      setError(true)
      return
    }
    setError(false)
    try {
      await connectAsync({ connector, chainId: 56 })
    } catch {
      setError(true)
    }
  }

  if (isConnected && address) {
    return (
      <button className={`wallet-control wallet-connected${compact ? ' wallet-compact' : ''}`} type="button" onClick={() => disconnect()} aria-label={`Disconnect ${shortAddress(address)}`}>
        <span className={chain?.id === 56 ? 'wallet-dot wallet-dot-ready' : 'wallet-dot wallet-dot-wrong'} aria-hidden="true" />
        <span>{chain?.id === 56 ? 'BNB' : `Chain ${chain?.id ?? '—'}`}</span>
        <strong>{shortAddress(address)}</strong>
      </button>
    )
  }

  return (
    <button className={`wallet-control${compact ? ' wallet-compact' : ''}`} type="button" onClick={connectWallet} disabled={isLoading} aria-invalid={error || undefined}>
      {isLoading ? 'Connecting…' : error ? 'Wallet unavailable' : 'Connect Wallet'}
    </button>
  )
}

export default WalletControl
