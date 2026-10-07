/**
 * Factual connected wallet chain id — MetaMask / injected provider truth.
 *
 * wagmi 0.10 `useChainId()` returns the ethers JSON-RPC *provider* network
 * (often the default configured chain, e.g. BSC 56), NOT the wallet session chain.
 * Founder deployment and multichain UI must use this hook (or useNetwork) instead.
 */
import { useCallback, useEffect, useState } from 'react'
import { useAccount, useNetwork } from 'wagmi'
import { resolveWalletProvider, type EthereumProvider } from 'lib/deployment-orchestrator/founderWalletTx'

function parseChainIdHex(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && /^0x[0-9a-fA-F]+$/.test(value)) return Number.parseInt(value, 16)
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number.parseInt(value, 10)
  return null
}

/**
 * Attaches the wallet chain listener. A rejected provider read resolves to no
 * subscription so the wagmi fallback remains and the effect cleanup cannot hang
 * on an unhandled rejection.
 */
export async function subscribeWalletChain(
  getProvider: (() => Promise<unknown>) | undefined,
  isCancelled: () => boolean,
  onChainId: (chainId: number) => void,
): Promise<(() => void) | undefined> {
  try {
    const preferred = (await getProvider?.()) as EthereumProvider | undefined
    const eth = resolveWalletProvider(preferred ?? null)
    if (!eth || isCancelled()) return undefined

    const onChainChanged = (hex: unknown) => {
      const id = parseChainIdHex(hex)
      if (id != null) onChainId(id)
    }
    const anyEth = eth as EthereumProvider & {
      on?: (event: string, handler: (...args: unknown[]) => void) => void
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
    }
    anyEth.on?.('chainChanged', onChainChanged)
    const id = await readProviderChainId(eth)
    if (!isCancelled() && id != null) onChainId(id)
    return () => {
      anyEth.removeListener?.('chainChanged', onChainChanged)
    }
  } catch {
    return undefined
  }
}

async function readProviderChainId(eth: EthereumProvider): Promise<number | null> {
  try {
    const hex = await eth.request({ method: 'eth_chainId', params: [] })
    return parseChainIdHex(hex)
  } catch {
    return null
  }
}

/**
 * Returns the wallet's live chain id, updating immediately on `chainChanged`.
 * Prefers injected provider `eth_chainId`, then wagmi `useNetwork().chain.id`.
 */
export function useWalletChainId(): number | null {
  const { chain } = useNetwork()
  const { isConnected, connector } = useAccount()
  const [providerChainId, setProviderChainId] = useState<number | null>(null)

  const refresh = useCallback(async () => {
    if (!isConnected) {
      setProviderChainId(null)
      return
    }
    try {
      const preferred = (await connector?.getProvider?.()) as EthereumProvider | undefined
      const eth = resolveWalletProvider(preferred ?? null)
      if (!eth) return
      const id = await readProviderChainId(eth)
      if (id != null) setProviderChainId(id)
    } catch {
      // keep last known / wagmi fallback
    }
  }, [connector, isConnected])

  useEffect(() => {
    void refresh()
  }, [refresh, chain?.id])

  useEffect(() => {
    if (typeof window === 'undefined' || !isConnected) return undefined

    let cancelled = false

    let detach: (() => void) | undefined
    subscribeWalletChain(
      connector?.getProvider ? () => connector.getProvider() : undefined,
      () => cancelled,
      (id) => setProviderChainId(id),
    ).then((next) => {
      detach = next
    })

    return () => {
      cancelled = true
      detach?.()
    }
  }, [connector, isConnected])

  if (!isConnected) return null
  return providerChainId ?? chain?.id ?? null
}

export function parseWalletChainIdHex(value: unknown): number | null {
  return parseChainIdHex(value)
}
