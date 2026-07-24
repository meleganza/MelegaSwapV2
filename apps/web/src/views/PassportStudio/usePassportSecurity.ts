/**
 * PASSPORT_MODULE_007 — factual Security trust summary.
 * Reuses Module 001 verification state + wagmi wallet presence only.
 */
import { useEffect, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { usePassportHeroIdentity } from './usePassportHeroIdentity'
import {
  buildPassportSecurityViewModel,
  type PassportSecurityInput,
} from './buildPassportSecurityViewModel'
import type { PassportSecurityRow, PassportSecurityViewModel } from './passportSecurityTypes'

export type UsePassportSecurityOptions = {
  fixtureRows?: readonly PassportSecurityRow[] | null
  forceDisconnected?: boolean
}

function readLocalhostFixture(): PassportSecurityInput | null {
  if (typeof window === 'undefined') return null
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return null
  }
  const fx = window.__PASSPORT_MODULE_007_FIXTURE__
  if (!fx) return null
  return {
    fixtureRows: fx.rows ?? null,
    forceDisconnected: typeof fx.walletConnected === 'boolean' ? !fx.walletConnected : undefined,
  }
}

export function usePassportSecurity(options: UsePassportSecurityOptions = {}): PassportSecurityViewModel {
  const { address, connector, isConnecting, isReconnecting } = useAccount()
  const identity = usePassportHeroIdentity()
  const [hostFixture, setHostFixture] = useState<PassportSecurityInput | null>(null)

  useEffect(() => {
    setHostFixture(readLocalhostFixture())
    const onMsg = () => setHostFixture(readLocalhostFixture())
    window.addEventListener('passport-module-007-fixture', onMsg)
    return () => window.removeEventListener('passport-module-007-fixture', onMsg)
  }, [])

  return useMemo(() => {
    const fx = hostFixture
    const hasFixture = options.fixtureRows != null || fx?.fixtureRows != null
    const loading = hasFixture
      ? false
      : Boolean(isConnecting || isReconnecting || identity.loading)

    return buildPassportSecurityViewModel({
      address: address ?? null,
      loading,
      forceDisconnected: options.forceDisconnected ?? fx?.forceDisconnected,
      verificationState: identity.verificationState,
      connectorName: connector?.name ?? null,
      fixtureRows: options.fixtureRows ?? fx?.fixtureRows ?? null,
    })
  }, [
    address,
    connector?.name,
    isConnecting,
    isReconnecting,
    identity.loading,
    identity.verificationState,
    options.fixtureRows,
    options.forceDisconnected,
    hostFixture,
  ])
}
