import { useRouter } from 'next/router'
import { ModalV2 } from '@pancakeswap/uikit'
import { useWeb3React } from '@pancakeswap/wagmi'
import { CHAIN_IDS } from 'utils/wagmi'
import { ChainId } from '@pancakeswap/sdk'
import { useMemo } from 'react'
import { useNetwork } from 'wagmi'
import { atom, useAtom } from 'jotai'
import { useSwitchNetwork, useSwitchNetworkLocal } from 'hooks/useSwitchNetwork'
import { SUPPORT_MULTI_CHAINS } from 'config/constants/supportChains'
import { UnsupportedNetworkModal } from './UnsupportedNetworkModal'
import { WrongNetworkModal } from './WrongNetworkModal'
import { PageNetworkSupportModal } from './PageNetworkSupportModal'
import useActiveWeb3React from 'hooks/useActiveWeb3React'

export const hideWrongNetworkModalAtom = atom(false)

export const NetworkModal = ({ pageSupportedChains = SUPPORT_MULTI_CHAINS }: { pageSupportedChains?: number[] }) => {
  const { pathname } = useRouter()
  const { chainId, chain, isWrongNetwork } = useActiveWeb3React()
  const { chains } = useNetwork()
  const [dismissWrongNetwork, setDismissWrongNetwork] = useAtom(hideWrongNetworkModalAtom)

  const isBNBOnlyPage = useMemo(() => {
    return pageSupportedChains?.length === 1 && pageSupportedChains[0] === ChainId.BSC
  }, [pageSupportedChains])

  const isPageNotSupported = useMemo(
    () => Boolean(pageSupportedChains.length) && !pageSupportedChains.includes(chainId),
    [chainId, pageSupportedChains],
  )

  const switchNetworkLocal = useSwitchNetworkLocal()

  if (isPageNotSupported && isBNBOnlyPage) {
    switchNetworkLocal(ChainId.BSC)
  }

  if (['/', '/about', '/bitcoin-funds', 'venture-funds', '/venture-funds', '/exchange'].includes(pathname)) return null

  if ((chain?.unsupported ?? false) || isPageNotSupported) {
    return (
      <ModalV2 isOpen closeOnOverlayClick={false}>
        <UnsupportedNetworkModal pageSupportedChains={pageSupportedChains?.length ? pageSupportedChains : CHAIN_IDS} />
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
