/**
 * PASSPORT_MODULE_001 — single factual identity source for Hero + Identity Card.
 * Presentation components must not independently infer identity.
 */
import { useMemo } from 'react'
import { useAccount } from 'wagmi'
import {
  buildPassportHeroIdentityViewModel,
  type PassportHeroIdentityInput,
} from './buildPassportHeroIdentityViewModel'
import type { PassportHeroIdentityViewModel } from './passportHeroIdentityTypes'

export type UsePassportHeroIdentityOptions = {
  /** Test/cert only — never pass production mock Passport rows. */
  fixture?: PassportHeroIdentityInput['fixture']
  sourceUnavailable?: boolean
}

export function usePassportHeroIdentity(
  options: UsePassportHeroIdentityOptions = {},
): PassportHeroIdentityViewModel {
  const { address, isConnecting, isReconnecting } = useAccount()

  return useMemo(
    () =>
      buildPassportHeroIdentityViewModel({
        address: address ?? null,
        loading: Boolean(isConnecting || isReconnecting),
        sourceUnavailable: options.sourceUnavailable,
        fixture: options.fixture,
      }),
    [address, isConnecting, isReconnecting, options.fixture, options.sourceUnavailable],
  )
}
