import { useCallback, useEffect, useState } from 'react'

interface SolanaProvider {
  publicKey?: { toString(): string }
  connect(): Promise<{ publicKey?: { toString(): string } }>
  on?(event: 'accountChanged' | 'disconnect', listener: (publicKey?: { toString(): string } | null) => void): void
  removeListener?(
    event: 'accountChanged' | 'disconnect',
    listener: (publicKey?: { toString(): string } | null) => void,
  ): void
}

declare global {
  interface Window {
    solana?: SolanaProvider
    phantom?: { solana?: SolanaProvider }
  }
}

export function useSolanaWallet() {
  const [address, setAddress] = useState<string>()
  const [isConnecting, setIsConnecting] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const provider = window.solana ?? window.phantom?.solana
    if (!provider) return undefined
    setAddress(provider.publicKey?.toString())
    const onAccountChanged = (publicKey?: { toString(): string } | null) => setAddress(publicKey?.toString())
    const onDisconnect = () => setAddress(undefined)
    provider.on?.('accountChanged', onAccountChanged)
    provider.on?.('disconnect', onDisconnect)
    return () => {
      provider.removeListener?.('accountChanged', onAccountChanged)
      provider.removeListener?.('disconnect', onDisconnect)
    }
  }, [])
  const connect = useCallback(async () => {
    if (typeof window === 'undefined') return undefined
    const provider = window.solana ?? window.phantom?.solana
    if (!provider) return undefined
    setIsConnecting(true)
    try {
      const result = await provider.connect()
      const next = result.publicKey?.toString() ?? provider.publicKey?.toString()
      setAddress(next)
      return next
    } finally {
      setIsConnecting(false)
    }
  }, [])
  return { address, isConnecting, connect }
}
