import { useTranslation } from '@pancakeswap/localization'
import { Button, ButtonProps } from '@pancakeswap/uikit'
import { createWallets, getDocLink } from 'config/wallet'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useAuth from 'hooks/useAuth'
import dynamic from 'next/dynamic'
// @ts-ignore
// eslint-disable-next-line import/extensions
import { useActiveHandle } from 'hooks/useEagerConnect.bmp.ts'
import { useEffect, useMemo, useState } from 'react'
import { useConnect } from 'wagmi'
import Trans from './Trans'

let walletModalPromise: Promise<any> | null = null

export const preloadConnectWalletModal = () => {
  if (!walletModalPromise) {
    walletModalPromise = import('@pancakeswap/ui-wallets').then((walletUi) => walletUi.WalletModalV2)
  }
  return walletModalPromise
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

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
      cancelIdleCallback?: (handle: number) => void
    }
    if (idleWindow.requestIdleCallback) {
      const handle = idleWindow.requestIdleCallback(() => void preloadConnectWalletModal(), { timeout: 1500 })
      return () => idleWindow.cancelIdleCallback?.(handle)
    }
    const handle = window.setTimeout(() => void preloadConnectWalletModal(), 600)
    return () => window.clearTimeout(handle)
  }, [])

  const handleClick = () => {
    if (typeof __NEZHA_BRIDGE__ !== 'undefined') {
      handleActive()
    } else {
      void preloadConnectWalletModal()
      setOpen(true)
    }
  }

  const wallets = useMemo(() => (open ? createWallets(chainId, connectAsync) : []), [chainId, connectAsync, open])

  return (
    <>
      <Button
        onClick={handleClick}
        onPointerEnter={(event) => {
          void preloadConnectWalletModal()
          onPointerEnter?.(event)
        }}
        onFocus={(event) => {
          void preloadConnectWalletModal()
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
