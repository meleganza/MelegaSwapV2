import { useTranslation } from '@pancakeswap/localization'
import { Button, ButtonProps } from '@pancakeswap/uikit'
import { createWallets, getDocLink } from 'config/wallet'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useAuth from 'hooks/useAuth'
import { loadExtendedWalletConnectors } from 'utils/wagmi'
import dynamic from 'next/dynamic'
// @ts-ignore
// eslint-disable-next-line import/extensions
import { useActiveHandle } from 'hooks/useEagerConnect.bmp.ts'
import { useMemo, useState } from 'react'
import { useConnect } from 'wagmi'
import Trans from './Trans'

let walletModalPromise: Promise<any> | null = null

export const preloadConnectWalletModal = () => {
  if (!walletModalPromise) {
    walletModalPromise = import('@pancakeswap/ui-wallets').then((walletUi) => walletUi.WalletModalV2)
  }
  return walletModalPromise
}

let walletRuntimePromise: Promise<unknown> | null = null

export const preloadConnectWalletRuntime = () => {
  if (!walletRuntimePromise) {
    walletRuntimePromise = Promise.all([preloadConnectWalletModal(), loadExtendedWalletConnectors()]).catch((error) => {
      walletRuntimePromise = null
      throw error
    })
  }
  return walletRuntimePromise
}

const WalletModalV2 = dynamic<any>(preloadConnectWalletModal, { ssr: false, loading: () => null })

const ConnectWalletButton = ({ children, ...props }: ButtonProps) => {
  const handleActive = useActiveHandle()
  const { login } = useAuth()
  const {
    t,
    currentLanguage: { code },
  } = useTranslation()
  const { connectAsync } = useConnect()
  const { chainId } = useActiveChainId()
  const [open, setOpen] = useState(false)
  const { onPointerEnter, onFocus, ...buttonProps } = props

  const docLink = useMemo(() => getDocLink(code), [code])

  const handleClick = () => {
    if (typeof __NEZHA_BRIDGE__ !== 'undefined') {
      handleActive()
    } else {
      void preloadConnectWalletRuntime().then(() => setOpen(true))
    }
  }

  const wallets = useMemo(() => (open ? createWallets(chainId, connectAsync) : []), [chainId, connectAsync, open])

  return (
    <>
      <Button
        onClick={handleClick}
        onPointerEnter={(event) => {
          void preloadConnectWalletRuntime()
          onPointerEnter?.(event)
        }}
        onFocus={(event) => {
          void preloadConnectWalletRuntime()
          onFocus?.(event)
        }}
        {...buttonProps}
      >
        {children || <Trans>Connect Wallet</Trans>}
      </Button>
      {open ? (
        <WalletModalV2
          docText={t('Learn How to Connect')}
          docLink={docLink}
          isOpen={open}
          wallets={wallets}
          login={login}
          onDismiss={() => setOpen(false)}
        />
      ) : null}
    </>
  )
}

export default ConnectWalletButton
