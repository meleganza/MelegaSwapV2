import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useAccount, useConnect } from 'wagmi'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { MARCO_LOGO_URI } from 'design-system/melega/constants/brand'
import { loadMarcoWidgetScript } from './loadMarcoWidgetScript'

const MARCO_CONNECT_SRC = 'https://marco.melega.ai/widgets/marco-connect.v2.1.js'
const DEFAULT_APPLICATION = process.env.NEXT_PUBLIC_MARCO_CONNECT_APPLICATION?.trim() || 'Melega DEX'

type MarcoConnectSize = 'compact' | 'standard' | 'full' | 'navbar' | 'floating' | 'icon'
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

const Root = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  flex: 0 0 auto;
`

const Host = styled.div<{ $concealed: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  opacity: ${({ $concealed }) => ($concealed ? 0 : 1)};
`

const ConnectedDisplay = styled.div`
  position: absolute;
  inset: 0;
  min-width: 132px;
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

  img {
    width: 20px;
    height: 20px;
    border-radius: 50%;
  }
`

const Fallback = styled.div<{ $hidden: boolean }>`
  display: ${({ $hidden }) => ($hidden ? 'none' : 'inline-flex')};

  img {
    width: 20px;
    height: 20px;
    margin-right: 8px;
    border-radius: 50%;
    object-fit: cover;
    flex: 0 0 20px;
  }
`

export const MarcoConnect: React.FC<{ size?: MarcoConnectSize; className?: string }> = ({
  size = 'navbar',
  className,
}) => {
  const { address } = useAccount()
  const { connectAsync, connectors } = useConnect()
  const hostRef = useRef<HTMLDivElement | null>(null)
  const addressRef = useRef<string | undefined>(undefined)
  const connectorsRef = useRef(connectors)
  const connectAsyncRef = useRef(connectAsync)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [widgetAddress, setWidgetAddress] = useState<string | null>(null)

  addressRef.current = address
  connectorsRef.current = connectors
  connectAsyncRef.current = connectAsync

  const syncWalletSession = useCallback(async (payload?: MarcoConnectEvent) => {
    const payloadAddress = payload?.wallet?.address
    if (payloadAddress) setWidgetAddress(payloadAddress)
    if (addressRef.current) return
    const connector =
      connectorsRef.current.find((candidate) => candidate.id === 'metaMask' && candidate.ready) ??
      connectorsRef.current.find((candidate) => candidate.id === 'injected' && candidate.ready)
    if (!connector) return
    try {
      await connectAsyncRef.current({ connector })
    } catch {
      // MARCO Connect owns the Passport session. A rejected DEX wallet sync
      // remains visible through the existing wallet fallback on the next render.
    }
  }, [])

  useEffect(() => {
    if (!hostRef.current) return undefined
    let cancelled = false
    let sdk: MarcoConnectSdk | null = null
    let idleHandle: number | undefined
    let timeoutHandle: number | undefined
    const unsubscribers: Array<() => void> = []

    setFailed(false)
    setReady(false)
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
          const unsubscribe = sdk.on('connect', (payload) => void syncWalletSession(payload))
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
      unsubscribers.forEach((unsubscribe) => unsubscribe())
      sdk?.destroy()
      hostRef.current?.replaceChildren()
    }
  }, [size, syncWalletSession])

  useEffect(() => {
    if (!address) setWidgetAddress(null)
  }, [address])

  const displayedAddress = widgetAddress || address || null
  const shortAddress = displayedAddress ? `${displayedAddress.slice(0, 6)}…${displayedAddress.slice(-4)}` : null

  return (
    <Root
      className={className}
      data-testid="marco-connect"
      data-marco-connect-ready={ready ? 'true' : 'false'}
      data-marco-connect-provider="official-v2.1"
    >
      <Host ref={hostRef} $concealed={Boolean(ready && shortAddress)} />
      {ready && shortAddress ? (
        <ConnectedDisplay data-testid="marco-connect-connected-address" aria-hidden="true">
          <img src={MARCO_LOGO_URI} alt="" />
          {size === 'icon' ? shortAddress.slice(0, 6) : shortAddress}
        </ConnectedDisplay>
      ) : null}
      <Fallback $hidden={ready && !failed}>
        <ConnectWalletButton
          className={size === 'icon' ? 'melega-shell-mobile-connect' : 'melega-shell-connect'}
          aria-label="MARCO Connect"
        >
          <img src={MARCO_LOGO_URI} alt="" aria-hidden="true" width={20} height={20} />
          {size === 'icon' ? 'MARCO' : 'MARCO CONNECT'}
        </ConnectWalletButton>
      </Fallback>
    </Root>
  )
}

export default MarcoConnect
