import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useAccount, useConnect } from 'wagmi'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { MARCO_LOGO_URI } from 'design-system/melega/constants/brand'
import { loadMarcoWidgetScript } from './loadMarcoWidgetScript'

const MARCO_CONNECT_SRC = 'https://marco.melega.ai/widgets/marco-connect.v2.1.js'
const DEFAULT_APPLICATION = process.env.NEXT_PUBLIC_MARCO_CONNECT_APPLICATION?.trim() || 'Melega DEX'

type MarcoConnectSize = 'compact' | 'standard' | 'full' | 'navbar' | 'floating' | 'icon'
type MarcoConnectActivation = 'always' | 'desktop' | 'mobile'
type MarcoConnectEvent = { state?: unknown; wallet?: { address?: string } }
type MarcoConnectSdk = {
  on: (event: string, listener: (payload: MarcoConnectEvent) => void) => (() => void) | void
  destroy: () => void
}
type MarcoConnectApi = {
  mount: (
    target: HTMLElement,
    options: { application: string; theme: 'dark'; size: MarcoConnectSize; signature: boolean },
  ) => MarcoConnectSdk
}

const Root = styled.div<{ $size: MarcoConnectSize }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  width: ${({ $size }) => ($size === 'icon' ? '44px' : $size === 'navbar' ? '164px' : 'auto')};
  min-width: ${({ $size }) => ($size === 'icon' ? '44px' : $size === 'navbar' ? '148px' : '0')};
  max-width: 100%;
  flex: ${({ $size }) => ($size === 'navbar' ? '0 1 164px' : '0 0 auto')};
  box-sizing: border-box;
  overflow: hidden;
`

const Host = styled.div<{ $concealed: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-width: 0;
  min-height: 40px;
  opacity: ${({ $concealed }) => ($concealed ? 0 : 1)};

  > * {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }
`

const ConnectedDisplay = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  min-width: 0;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid rgba(244, 196, 48, 0.36);
  border-radius: 14px;
  background: linear-gradient(115deg, rgba(244, 196, 48, 0.13), rgba(18, 18, 18, 0.98));
  color: #fff;
  font-size: 13px;
  font-weight: 780;
  font-variant-numeric: tabular-nums;
  pointer-events: none;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;

  img {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    flex: 0 0 20px;
  }

  img:only-child {
    margin-right: 0;
  }
`

const Fallback = styled.div<{ $hidden: boolean }>`
  position: absolute;
  inset: 0;
  z-index: 2;
  width: 100%;
  min-width: 0;
  display: ${({ $hidden }) => ($hidden ? 'none' : 'inline-flex')};
  align-items: center;
  justify-content: center;

  > button {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    height: 40px !important;
    min-height: 40px !important;
    padding-left: 8px !important;
    padding-right: 8px !important;
    font-size: 11px !important;
    line-height: 1 !important;
    letter-spacing: -0.01em;
    overflow: hidden;
    white-space: nowrap;
  }

  img {
    width: 20px;
    height: 20px;
    margin-right: 8px;
    border-radius: 50%;
    object-fit: cover;
    flex: 0 0 20px;
  }

  img:only-child {
    margin-right: 0;
  }
`

export const MarcoConnect: React.FC<{
  size?: MarcoConnectSize
  className?: string
  activation?: MarcoConnectActivation
}> = ({ size = 'navbar', className, activation = 'always' }) => {
  const { address } = useAccount()
  const { connectAsync, connectors } = useConnect()
  const hostRef = useRef<HTMLDivElement | null>(null)
  const addressRef = useRef<string | undefined>(undefined)
  const walletIntentUntilRef = useRef(0)
  const walletSyncPendingRef = useRef(false)
  const connectorsRef = useRef(connectors)
  const connectAsyncRef = useRef(connectAsync)
  const [ready, setReady] = useState(false)
  const [widgetVisible, setWidgetVisible] = useState(false)
  const [failed, setFailed] = useState(false)
  const [widgetAddress, setWidgetAddress] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(activation === 'always')

  addressRef.current = address
  connectorsRef.current = connectors
  connectAsyncRef.current = connectAsync

  useEffect(() => {
    if (activation === 'always') {
      setIsActive(true)
      return undefined
    }

    const media = window.matchMedia(activation === 'desktop' ? '(min-width: 1024px)' : '(max-width: 1023px)')
    const sync = () => setIsActive(media.matches)
    sync()
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', sync)
      return () => media.removeEventListener('change', sync)
    }
    // Firefox ESR and older WebKit expose the legacy MediaQueryList API.
    media.addListener(sync)
    return () => media.removeListener(sync)
  }, [activation])

  const syncWalletSession = useCallback(async (payload?: MarcoConnectEvent) => {
    const payloadAddress = payload?.wallet?.address
    if (payloadAddress) setWidgetAddress(payloadAddress)
    if (addressRef.current) return
    // The official widget can replay its current Passport session when it is
    // mounted after a route change. That passive replay must never reopen the
    // Web3 permission/signature flow. Synchronise wagmi only after a real user
    // interaction with MARCO Connect; persisted DEX sessions are restored by
    // WalletSessionRuntime without another prompt.
    if (Date.now() > walletIntentUntilRef.current) return
    if (walletSyncPendingRef.current) return
    // Consume the user intent once. Some versions of the official widget emit
    // more than one connect notification while Passport and Web3 converge.
    // Only the first event may open the injected wallet permission flow.
    walletIntentUntilRef.current = 0
    const connector =
      connectorsRef.current.find((candidate) => candidate.id === 'metaMask' && candidate.ready) ??
      connectorsRef.current.find((candidate) => candidate.id === 'injected' && candidate.ready)
    if (!connector) return
    walletSyncPendingRef.current = true
    try {
      await connectAsyncRef.current({ connector })
    } catch {
      // MARCO Connect owns the Passport session. A rejected DEX wallet sync
      // remains visible through the existing wallet fallback on the next render.
    } finally {
      walletSyncPendingRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!isActive || !hostRef.current) return undefined
    let cancelled = false
    let sdk: MarcoConnectSdk | null = null
    let idleHandle: number | undefined
    let timeoutHandle: number | undefined
    let visibilityFrame: number | undefined
    let mutationObserver: MutationObserver | undefined
    let resizeObserver: ResizeObserver | undefined
    const unsubscribers: Array<() => void> = []

    setFailed(false)
    setReady(false)
    setWidgetVisible(false)
    const loadWidget = () => {
      void loadMarcoWidgetScript(MARCO_CONNECT_SRC, () =>
        Boolean((window as Window & { MarcoConnect?: MarcoConnectApi }).MarcoConnect?.mount),
      )
        .then(() => {
          if (cancelled || !hostRef.current) return
          const api = (window as Window & { MarcoConnect?: MarcoConnectApi }).MarcoConnect
          if (!api) throw new Error('MARCO_CONNECT_API_UNAVAILABLE')
          sdk = api.mount(hostRef.current, {
            application: DEFAULT_APPLICATION,
            theme: 'dark',
            size,
            signature: false,
          })
          const updateWidgetVisibility = () => {
            const host = hostRef.current
            if (!host) return
            const visibleChild = Array.from(host.children).some((child) => {
              const element = child as HTMLElement
              const rect = element.getBoundingClientRect()
              const style = window.getComputedStyle(element)
              return rect.width >= 32 && rect.height >= 32 && style.display !== 'none' && style.visibility !== 'hidden'
            })
            setWidgetVisible(visibleChild)
          }
          mutationObserver = new MutationObserver(updateWidgetVisibility)
          mutationObserver.observe(hostRef.current, { childList: true, subtree: true, attributes: true })
          if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(updateWidgetVisibility)
            resizeObserver.observe(hostRef.current)
            Array.from(hostRef.current.children).forEach((child) => resizeObserver?.observe(child))
          }
          visibilityFrame = window.requestAnimationFrame(updateWidgetVisibility)
          const unsubscribe = sdk.on('connect', (payload) => {
            setWidgetVisible(true)
            void syncWalletSession(payload)
          })
          if (unsubscribe) unsubscribers.push(unsubscribe)
          setReady(true)
        })
        .catch(() => {
          if (!cancelled) setFailed(true)
        })
    }

    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
      cancelIdleCallback?: (handle: number) => void
    }
    if (idleWindow.requestIdleCallback) {
      idleHandle = idleWindow.requestIdleCallback(loadWidget, { timeout: 1500 })
    } else {
      timeoutHandle = window.setTimeout(loadWidget, 250)
    }

    return () => {
      cancelled = true
      if (idleHandle != null) idleWindow.cancelIdleCallback?.(idleHandle)
      if (timeoutHandle != null) window.clearTimeout(timeoutHandle)
      if (visibilityFrame != null) window.cancelAnimationFrame(visibilityFrame)
      mutationObserver?.disconnect()
      resizeObserver?.disconnect()
      unsubscribers.forEach((unsubscribe) => unsubscribe())
      sdk?.destroy()
      hostRef.current?.replaceChildren()
    }
  }, [isActive, size, syncWalletSession])

  useEffect(() => {
    if (!address) setWidgetAddress(null)
  }, [address])

  const displayedAddress = widgetAddress || address || null
  const shortAddress = displayedAddress ? `${displayedAddress.slice(0, 6)}…${displayedAddress.slice(-4)}` : null

  return (
    <Root
      $size={size}
      className={className}
      data-testid="marco-connect"
      data-marco-connect-active={isActive ? 'true' : 'false'}
      data-marco-connect-ready={ready ? 'true' : 'false'}
      data-marco-connect-provider="official-v2.1"
      onPointerDownCapture={() => {
        walletIntentUntilRef.current = Date.now() + 15_000
      }}
      onKeyDownCapture={(event) => {
        if (event.key === 'Enter' || event.key === ' ') walletIntentUntilRef.current = Date.now() + 15_000
      }}
    >
      <Host ref={hostRef} $concealed={Boolean(ready && shortAddress)} />
      {ready && widgetVisible && shortAddress ? (
        <ConnectedDisplay data-testid="marco-connect-connected-address" aria-hidden="true">
          <img src={MARCO_LOGO_URI} alt="" />
          {size === 'icon' ? null : shortAddress}
        </ConnectedDisplay>
      ) : null}
      <Fallback $hidden={ready && widgetVisible && !failed}>
        <ConnectWalletButton
          className={size === 'icon' ? 'melega-shell-mobile-connect' : 'melega-shell-connect'}
          aria-label="MARCO Connect"
        >
          <img src={MARCO_LOGO_URI} alt="" aria-hidden="true" width={20} height={20} />
          {size === 'icon' ? null : 'MARCO CONNECT'}
        </ConnectWalletButton>
      </Fallback>
    </Root>
  )
}

export default MarcoConnect
