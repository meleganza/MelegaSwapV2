/**
 * PASSPORT_MODULE_006 — factual Recent Activity source for Passport.
 * No durable Passport activity producer today — empty unless localhost fixture.
 */
import { useEffect, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import {
  buildPassportRecentActivityViewModel,
  type PassportRecentActivityInput,
} from './buildPassportRecentActivityViewModel'
import type {
  PassportActivityItem,
  PassportActivitySourceStatus,
  PassportRecentActivityViewModel,
} from './passportActivityTypes'

export type UsePassportRecentActivityOptions = {
  fixtureItems?: readonly PassportActivityItem[] | null
  fixtureSources?: readonly PassportActivitySourceStatus[] | null
  forceDisconnected?: boolean
  allSourcesFailed?: boolean
  loading?: boolean
  viewAllHref?: string | null
}

function readLocalhostFixture(): PassportRecentActivityInput | null {
  if (typeof window === 'undefined') return null
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return null
  }
  const fx = window.__PASSPORT_MODULE_006_FIXTURE__
  if (!fx) return null
  return {
    fixtureItems: fx.items ?? [],
    fixtureSources: fx.sources ?? null,
    forceDisconnected: typeof fx.walletConnected === 'boolean' ? !fx.walletConnected : undefined,
    allSourcesFailed: fx.allSourcesFailed,
    loading: fx.loading,
    viewAllHref: fx.viewAllHref,
  }
}

export function usePassportRecentActivity(
  options: UsePassportRecentActivityOptions = {},
): PassportRecentActivityViewModel {
  const { address, isConnecting, isReconnecting } = useAccount()
  const [hostFixture, setHostFixture] = useState<PassportRecentActivityInput | null>(null)

  useEffect(() => {
    setHostFixture(readLocalhostFixture())
    const onMsg = () => setHostFixture(readLocalhostFixture())
    window.addEventListener('passport-module-006-fixture', onMsg)
    return () => window.removeEventListener('passport-module-006-fixture', onMsg)
  }, [])

  return useMemo(() => {
    const fx = hostFixture
    const hasFixture =
      options.fixtureItems != null ||
      fx?.fixtureItems != null ||
      options.allSourcesFailed === true ||
      fx?.allSourcesFailed === true
    // Localhost/cert fixtures must not be blocked by wagmi connect churn.
    const loading = hasFixture
      ? Boolean(options.loading ?? fx?.loading)
      : Boolean(options.loading ?? fx?.loading ?? (isConnecting || isReconnecting))
    return buildPassportRecentActivityViewModel({
      address: address ?? null,
      loading,
      fixtureItems: options.fixtureItems ?? fx?.fixtureItems ?? null,
      fixtureSources: options.fixtureSources ?? fx?.fixtureSources ?? null,
      forceDisconnected: options.forceDisconnected ?? fx?.forceDisconnected,
      allSourcesFailed: options.allSourcesFailed ?? fx?.allSourcesFailed,
      viewAllHref: options.viewAllHref !== undefined ? options.viewAllHref : fx?.viewAllHref,
    })
  }, [
    address,
    isConnecting,
    isReconnecting,
    options.fixtureItems,
    options.fixtureSources,
    options.forceDisconnected,
    options.allSourcesFailed,
    options.loading,
    options.viewAllHref,
    hostFixture,
  ])
}
