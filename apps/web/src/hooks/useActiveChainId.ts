import { ChainId } from '@pancakeswap/sdk'
import { atom, useAtomValue } from 'jotai'
import { useRouter } from 'next/router'
import { useDeferredValue, useEffect } from 'react'
import { isChainSupported } from 'utils/wagmi'
import { useAccount, useNetwork } from 'wagmi'
import { getChainId } from 'config/chains'
import { isMelegaRecognizedWalletChain } from 'config/publicNetworkSwitchCapabilities'
import { useSessionChainId } from './useSessionChainId'
import { useWalletChainId } from './useWalletChainId'

function isWalletRecognizedChain(chainId: number): boolean {
  return isChainSupported(chainId) || isMelegaRecognizedWalletChain(chainId)
}

const queryChainIdAtom = atom(-1) // -1 unload, 0 no chainId on query

queryChainIdAtom.onMount = (set) => {
  const params = new URL(window.location.href).searchParams
  let chainId
  // chain has higher priority than chainId
  // keep chainId for backward compatible
  const c = params.get('chain')
  if (!c) {
    chainId = params.get('chainId')
  } else {
    chainId = getChainId(c)
  }
  if (isChainSupported(+chainId)) {
    set(+chainId)
  } else {
    set(0)
  }
}

export function useLocalNetworkChain() {
  const [sessionChainId] = useSessionChainId()
  // useRouter is kind of slow, we only get this query chainId once
  const queryChainId = useAtomValue(queryChainIdAtom)

  const { query } = useRouter()

  const chainId = +(sessionChainId || getChainId(query.chain as string) || queryChainId)

  if (isWalletRecognizedChain(chainId)) {
    return chainId
  }

  return undefined
}

export const useActiveChainId = () => {
  const localChainId = useLocalNetworkChain()
  const queryChainId = useAtomValue(queryChainIdAtom)
  const [, setSessionChainId] = useSessionChainId()

  const { chain } = useNetwork()
  const { isConnected } = useAccount()
  const walletChainId = useWalletChainId()

  // Connected wallet chain is source of truth (fixes stale session / wagmi useChainId = provider default).
  const walletTruth =
    isConnected && walletChainId != null && isWalletRecognizedChain(walletChainId) ? walletChainId : null

  const chainId =
    walletTruth ?? localChainId ?? chain?.id ?? (queryChainId >= 0 ? ChainId.BSC : undefined)

  // Keep session atom aligned so URL/local cache cannot resurrect a stale chain after MetaMask switch.
  useEffect(() => {
    if (walletTruth != null && walletTruth !== localChainId) {
      setSessionChainId(walletTruth)
    }
  }, [walletTruth, localChainId, setSessionChainId])

  // Apply bridge-only ?chainId= after mount so hydrate is not interrupted.
  useEffect(() => {
    if (typeof window === 'undefined' || walletTruth != null) return
    const parsed = Number(new URLSearchParams(window.location.search).get('chainId'))
    if (!Number.isFinite(parsed) || !isMelegaRecognizedWalletChain(parsed)) return
    if (localChainId !== parsed) {
      setSessionChainId(parsed)
    }
  }, [localChainId, setSessionChainId, walletTruth])

  const isNotMatched = useDeferredValue(
    Boolean(isConnected && walletTruth != null && localChainId != null && walletTruth !== localChainId),
  )

  return {
    chainId,
    isWrongNetwork: (chain?.unsupported ?? false) && !walletTruth,
    isNotMatched,
  }
}
