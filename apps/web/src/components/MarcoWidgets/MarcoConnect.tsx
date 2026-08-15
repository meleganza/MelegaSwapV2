import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useAccount } from 'wagmi'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { MARCO_LOGO_URI } from 'design-system/melega/constants/brand'
import { loadMarcoWidgetScript } from './loadMarcoWidgetScript'

const MARCO_CONNECT_SRC = 'https://marco.melega.ai/widgets/marco-connect.v2.1.js'
const DEFAULT_APPLICATION = process.env.NEXT_PUBLIC_MARCO_CONNECT_APPLICATION?.trim() || 'Melega DEX'

type MarcoConnectSize = 'compact' | 'standard' | 'full' | 'navbar' | 'floating' | 'icon'
type MarcoConnectActivation = 'always' | 'desktop' | 'mobile'
type MarcoConnectSdk = {
  open: () => void
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
  height: ${({ $size }) => ($size === 'icon' || $size === 'navbar' ? '44px' : 'auto')};
  min-height: ${({ $size }) => ($size === 'icon' || $size === 'navbar' ? '44px' : '40px')};
  max-height: ${({ $size }) => ($size === 'icon' || $size === 'navbar' ? '44px' : 'none')};
  width: ${({ $size }) => ($size === 'icon' ? '44px' : $size === 'navbar' ? '164px' : 'auto')};
  min-width: ${({ $size }) => ($size === 'icon' ? '44px' : $size === 'navbar' ? '148px' : '0')};
  max-width: 100%;
  flex: ${({ $size }) => ($size === 'navbar' ? '0 1 164px' : '0 0 auto')};
  box-sizing: border-box;
  overflow: hidden;
`

const Host = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-width: 0;
  height: 100%;
  min-height: 0;
  max-height: 100%;
  overflow: hidden;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;

  > * {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }
`

const ConnectedDisplay = styled.button`
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
  font-family: inherit;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  z-index: 3;
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
  const hostRef = useRef<HTMLDivElement | null>(null)
  const sdkRef = useRef<MarcoConnectSdk | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [isActive, setIsActive] = useState(activation === 'always')

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

  useEffect(() => {
    if (!isActive || !hostRef.current) return undefined
    let cancelled = false
    let sdk: MarcoConnectSdk | null = null

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
          sdkRef.current = sdk
          setReady(true)
        })
        .catch(() => {
          if (!cancelled) setFailed(true)
        })
    }

    // Mount the Passport runtime immediately. It remains non-interactive while
    // disconnected, so it can never race the explicit DEX wallet chooser.
    loadWidget()

    return () => {
      cancelled = true
      if (sdkRef.current === sdk) sdkRef.current = null
      sdk?.destroy()
      hostRef.current?.replaceChildren()
    }
  }, [isActive, size])

  const displayedAddress = address || null
  const shortAddress = displayedAddress ? `${displayedAddress.slice(0, 6)}…${displayedAddress.slice(-4)}` : null

  return (
    <Root
      $size={size}
      className={className}
      data-testid="marco-connect"
      data-marco-connect-active={isActive ? 'true' : 'false'}
      data-marco-connect-ready={ready ? 'true' : 'false'}
      data-marco-connect-provider="official-v2.1"
    >
      <Host ref={hostRef} />
      {shortAddress ? (
        <ConnectedDisplay
          type="button"
          data-testid="marco-connect-connected-address"
          aria-label="Open MARCO Passport"
          onClick={() => {
            if (ready && !failed) sdkRef.current?.open()
          }}
        >
          <img src={MARCO_LOGO_URI} alt="" />
          {size === 'icon' ? null : shortAddress}
        </ConnectedDisplay>
      ) : null}
      <Fallback $hidden={Boolean(shortAddress)}>
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
