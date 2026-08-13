import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { loadMarcoWidgetScript } from './loadMarcoWidgetScript'

const MARCO_CONNECT_SRC = 'https://marco.melega.ai/widgets/marco-connect.v2.1.js'
const PASSPORT_STORAGE_KEY = 'melega:marco-passport-number'

type MarcoConnectInstance = {
  on: (event: 'passportResolved', handler: (event: MarcoPassportResolvedEvent) => void) => void
  destroy?: () => void
}
type MarcoPassportResolvedEvent = { passport?: { passportNumber?: string | number } }
type MarcoConnectApi = {
  mount: (selector: string, options: { application: string; theme: 'dark'; size: MarcoConnectSize }) => MarcoConnectInstance
}
type MarcoConnectWindow = Window & { MarcoConnect?: MarcoConnectApi }
export type MarcoConnectSize = 'icon' | 'compact' | 'standard' | 'navbar' | 'full' | 'floating'
type Props = { id: string; size?: MarcoConnectSize; mediaQuery?: string; fallback?: React.ReactNode; className?: string }

const Root = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: max-content;
  min-height: 40px;
  flex: 0 0 auto;
`

/** Official MARCO Passport / wallet entry point. */
export const MarcoConnect: React.FC<Props> = ({ id, size = 'navbar', mediaQuery, fallback = null, className }) => {
  const instanceRef = useRef<MarcoConnectInstance | null>(null)
  const [active, setActive] = useState(!mediaQuery)
  const [mounted, setMounted] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!mediaQuery || typeof window === 'undefined') return undefined
    const media = window.matchMedia(mediaQuery)
    const update = () => setActive(media.matches)
    update()
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [mediaQuery])

  useEffect(() => {
    if (!active) return undefined
    let cancelled = false

    void loadMarcoWidgetScript(MARCO_CONNECT_SRC, () => Boolean((window as MarcoConnectWindow).MarcoConnect)).then(
      () => {
        if (cancelled) return
        const api = (window as MarcoConnectWindow).MarcoConnect
        if (!api) throw new Error('MARCO_CONNECT_API_UNAVAILABLE')
        const instance = api.mount(`#${id}`, {
          application: process.env.NEXT_PUBLIC_MARCO_CONNECT_APPLICATION?.trim() || 'Melega DEX',
          theme: 'dark',
          size,
        })
        instance.on('passportResolved', (event) => {
          const passportNumber = event?.passport?.passportNumber
          if (passportNumber === undefined || passportNumber === null) return
          const value = String(passportNumber)
          window.localStorage.setItem(PASSPORT_STORAGE_KEY, value)
          window.dispatchEvent(new CustomEvent('melega:marco-passport-resolved', { detail: { passportNumber: value } }))
        })
        instanceRef.current = instance
        setFailed(false)
        setMounted(true)
      },
      () => {
        if (!cancelled) setFailed(true)
      },
    )

    return () => {
      cancelled = true
      instanceRef.current?.destroy?.()
      instanceRef.current = null
    }
  }, [active, id, size])

  if (!active) return null
  return (
    <Root className={className} data-testid={`marco-connect-${size}`}>
      <div id={id} />
      {failed ? fallback : null}
    </Root>
  )
}

export default MarcoConnect
