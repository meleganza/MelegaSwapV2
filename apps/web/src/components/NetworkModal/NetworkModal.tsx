import { useRouter } from 'next/router'
import { ModalV2 } from '@pancakeswap/uikit'
import { CHAIN_IDS } from 'utils/wagmi'
import { ChainId } from '@pancakeswap/sdk'
import { useMemo } from 'react'
import { useNetwork } from 'wagmi'
import { atom, useAtom } from 'jotai'
import { useSwitchNetworkLocal } from 'hooks/useSwitchNetwork'
import { SUPPORT_MULTI_CHAINS } from 'config/constants/supportChains'
import { getMelegaChain } from 'config/melegaChainRegistry'
import { UnsupportedNetworkModal } from './UnsupportedNetworkModal'
import { WrongNetworkModal } from './WrongNetworkModal'
import useActiveWeb3React from 'hooks/useActiveWeb3React'

export const hideWrongNetworkModalAtom = atom(false)

/**
 * Never treat Melega PREPARING chains (e.g. Avalanche) as page-unsupported on
 * Founder deployment / runtime surfaces — missing Router must not crash or block the page.
 */
function isDeploymentRuntimePath(pathname: string): boolean {
  return pathname.startsWith('/runtime/deployment')
}

export const NetworkModal = ({ pageSupportedChains = SUPPORT_MULTI_CHAINS }: { pageSupportedChains?: number[] }) => {
  const { pathname } = useRouter()
  const { chainId, chain, isWrongNetwork } = useActiveWeb3React()
  const { chains } = useNetwork()
  const [dismissWrongNetwork, setDismissWrongNetwork] = useAtom(hideWrongNetworkModalAtom)

  const supported = pageSupportedChains?.length ? pageSupportedChains : CHAIN_IDS
  const melegaRow = typeof chainId === 'number' ? getMelegaChain(chainId) : undefined
  const isPreparingMelega = melegaRow?.status === 'PREPARING'
  const allowPreparingOnDeployment = isDeploymentRuntimePath(pathname) && isPreparingMelega

  const isBNBOnlyPage = useMemo(() => {
    return supported?.length === 1 && supported[0] === ChainId.BSC
  }, [supported])

  const isPageNotSupported = useMemo(() => {
    if (!supported.length || typeof chainId !== 'number') return false
    if (allowPreparingOnDeployment) return false
    if (isPreparingMelega && isDeploymentRuntimePath(pathname)) return false
    // PREPARING Melega chains are wallet-switchable without forcing UnsupportedNetworkModal globally
    // when the page's chain list includes them (CHAIN_IDS after Avalanche wagmi registration).
    if (supported.includes(chainId)) return false
    if (isPreparingMelega && supported.includes(chainId)) return false
    return !supported.includes(chainId)
  }, [allowPreparingOnDeployment, chainId, isPreparingMelega, pathname, supported])

  const switchNetworkLocal = useSwitchNetworkLocal()

  if (isPageNotSupported && isBNBOnlyPage) {
    switchNetworkLocal(ChainId.BSC)
  }

  if (['/', '/about', '/bitcoin-funds', 'venture-funds', '/venture-funds', '/exchange'].includes(pathname)) return null

  if (isBNBOnlyPage) return null

  if ((chain?.unsupported ?? false) || isPageNotSupported) {
    // Never hard-block Founder Avalanche Router prep behind UnsupportedNetworkModal
    if (allowPreparingOnDeployment || (isPreparingMelega && isDeploymentRuntimePath(pathname))) {
      return null
    }
    return (
      <ModalV2 isOpen closeOnOverlayClick={false}>
        <UnsupportedNetworkModal pageSupportedChains={supported} />
      </ModalV2>
    )
  }

  if (isWrongNetwork && !dismissWrongNetwork) {
    const currentChain = chains.find((c) => c.id === chainId)
    if (!currentChain) return null
    return (
      <ModalV2 isOpen={isWrongNetwork} closeOnOverlayClick onDismiss={() => setDismissWrongNetwork(true)}>
        <WrongNetworkModal currentChain={currentChain} onDismiss={() => setDismissWrongNetwork(true)} />
      </ModalV2>
    )
  }

  return null
}
