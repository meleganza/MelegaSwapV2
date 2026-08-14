import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useAccount, useConnect } from 'wagmi'
import ConnectWalletButton from 'components/ConnectWalletButton'
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

const Host = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
`

const Fallback = styled.div<{ $hidden: boolean }>`
  display: ${({ $hidden }) => ($hidden ? 'none' : 'inline-flex')};
`

export const MarcoConnect: React.FC<{ size?: MarcoConnectSize; className?: string }> = ({
  size = 'navbar',
  className,
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const { address } = useAccount()
  const { connectAsync, connectors } = useConnect()

  const syncWalletSession = useCallback(async () => {
    if (address) return
    const connector =
      connectors.find((candidate) => candidate.id === 'metaMask' && candidate.ready) ??
      connectors.find((candidate) => candidate.id === 'injected' && candidate.ready)
    if (!connector) return
    try {
      await connectAsync({ connector })
    } catch {
      // MARCO Connect owns the Passport session. A rejected DEX wallet sync
      // remains visible through the existing wallet fallback on the next render.
    }
  }, [address, connectAsync, connectors])

  useEffect(() => {
    if (!hostRef.current || address) return undefined
    let cancelled = false
    let sdk: MarcoConnectSdk | null = null
    const unsubscribers: Array<() => void> = []

    void loadMarcoWidgetScript(MARCO_CONNECT_SRC, () =>
      Boolean((window as Window & { MarcoConnect?: MarcoConnectApi }).MarcoConnect?.mount),
    ).then(
      () => {
        if (cancelled || !hostRef.current) return
        const api = (window as Window & { MarcoConnect?: MarcoConnectApi }).MarcoConnect
        if (!api) throw new Error('MARCO_CONNECT_API_UNAVAILABLE')
        sdk = api.mount(hostRef.current, {
          application: DEFAULT_APPLICATION,
          theme: 'dark',
          size,
          signature: false,
        })
        const unsubscribe = sdk.on('connect', () => void syncWalletSession())
        if (unsubscribe) unsubscribers.push(unsubscribe)
        setReady(true)
      },
      () => {
        if (!cancelled) setFailed(true)
      },
    )

    return () => {
      cancelled = true
      unsubscribers.forEach((unsubscribe) => unsubscribe())
      sdk?.destroy()
      hostRef.current?.replaceChildren()
    }
  }, [address, size, syncWalletSession])

  if (address) return null

  return (
    <Root className={className} data-testid="marco-connect" data-marco-connect-ready={ready ? 'true' : 'false'}>
      <Host ref={hostRef} />
      <Fallback $hidden={ready && !failed}>
        <ConnectWalletButton className={size === 'icon' ? 'melega-shell-mobile-connect' : 'melega-shell-connect'}>
          {size === 'icon' ? 'Connect' : 'Connect Wallet'}
        </ConnectWalletButton>
      </Fallback>
    </Root>
  )
}

export default MarcoConnect
