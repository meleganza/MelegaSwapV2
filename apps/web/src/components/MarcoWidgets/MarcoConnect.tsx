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

let inFlightConnectSession = false

const normalizeAddress = (value: string | undefined | null): string => (value ?? '').toLowerCase().trim()

const normalizeConnectTarget = (candidate: HTMLDivElement): boolean => {
  const style = window.getComputedStyle(candidate)
  if (style.display === 'none' || style.visibility === 'hidden') return false
  return candidate.offsetWidth > 0 && candidate.offsetHeight > 0
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
  const hostRef = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const { address } = useAccount()
  const { connectAsync, connectors } = useConnect()
  const mountedHostRef = useRef(false)

  const syncWalletSession = useCallback(
    async (eventWalletAddress?: string) => {
      const eventAddress = normalizeAddress(eventWalletAddress)
      const currentAddress = normalizeAddress(address)

      if (!address) {
        if (inFlightConnectSession) return
      } else if (!eventAddress || eventAddress === currentAddress) {
        return
      }

      const connector =
        connectors.find((candidate) => candidate.id === 'metaMask' && candidate.ready) ??
        connectors.find((candidate) => candidate.id === 'injected' && candidate.ready)
      if (!connector) return

      inFlightConnectSession = true
      try {
        await connectAsync({ connector })
      } catch {
        // MARCO Connect owns the Passport session. A rejected DEX wallet sync
        // remains visible through the existing wallet fallback on the next render.
      } finally {
        inFlightConnectSession = false
      }
    },
    [address, connectAsync, connectors],
  )

  useEffect(() => {
    if (!hostRef.current) return undefined
    let cancelled = false
    let sdk: MarcoConnectSdk | null = null
    let idleHandle: number | undefined
    let timeoutHandle: number | undefined
    const hostNode = hostRef.current
    const unsubscribers: Array<() => void> = []

    setFailed(false)
    let scheduledAutoMount: number | undefined
    const loadWidget = async () => {
      if (!hostNode || !normalizeConnectTarget(hostNode) || mountedHostRef.current) return
      try {
        await loadMarcoWidgetScript(MARCO_CONNECT_SRC, () =>
          Boolean((window as Window & { MarcoConnect?: MarcoConnectApi }).MarcoConnect?.mount),
        )
        if (cancelled || !hostNode || !normalizeConnectTarget(hostNode)) return
        const api = (window as Window & { MarcoConnect?: MarcoConnectApi }).MarcoConnect
        if (!api) throw new Error('MARCO_CONNECT_API_UNAVAILABLE')
        sdk = api.mount(hostNode, {
          application: DEFAULT_APPLICATION,
          theme: 'dark',
          size,
          signature: false,
        })
        const unsubscribe = sdk.on('connect', ({ wallet }) => {
          syncWalletSession(wallet?.address).catch(() => null)
        })
        if (unsubscribe) unsubscribers.push(unsubscribe)
        mountedHostRef.current = true
        setReady(true)
      } catch {
        if (!cancelled) setFailed(true)
      }
    }

    const evaluateMount = () => {
      if (cancelled || mountedHostRef.current || !hostNode) return
      if (!normalizeConnectTarget(hostNode)) {
        if (scheduledAutoMount != null) {
          window.clearTimeout(scheduledAutoMount)
        }
        scheduledAutoMount = window.setTimeout(evaluateMount, 200)
        return
      }
      loadWidget().catch(() => null)
    }

    const scheduleResizeWatch = () => {
      if (typeof window === 'undefined') return
      if (typeof window.addEventListener !== 'function') return
      window.addEventListener('resize', evaluateMount)
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
    scheduleResizeWatch()

    return () => {
      cancelled = true
      if (idleHandle != null) idleWindow.cancelIdleCallback?.(idleHandle)
      if (timeoutHandle != null) window.clearTimeout(timeoutHandle)
      if (scheduledAutoMount != null) window.clearTimeout(scheduledAutoMount)
      window.removeEventListener('resize', evaluateMount)
      unsubscribers.forEach((unsubscribe) => unsubscribe())
      sdk?.destroy()
      mountedHostRef.current = false
      hostNode.replaceChildren()
    }
  }, [address, size, syncWalletSession])

  return (
    <Root
      className={`melega-marco-connect-root ${className ?? ''}`.trim()}
      data-testid="marco-connect"
      data-marco-connect-ready={ready ? 'true' : 'false'}
      data-marco-connect-provider="official-v2.1"
    >
      <Host ref={hostRef} className="melega-marco-connect-host" />
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
