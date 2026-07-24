/**
 * PASSPORT_MODULE_004 — single factual source for My Projects presentation.
 */
import { useMemo } from 'react'
import { useAccount } from 'wagmi'
import {
  buildPassportProjectsViewModel,
  type PassportProjectsInput,
} from './buildPassportProjectsViewModel'
import type { PassportProjectsViewModel } from './passportProjectsTypes'

export type UsePassportProjectsOptions = {
  fixtureProjects?: PassportProjectsInput['fixtureProjects']
  sourceUnavailable?: boolean
}

export function usePassportProjects(
  options: UsePassportProjectsOptions = {},
): PassportProjectsViewModel {
  const { address, isConnecting, isReconnecting } = useAccount()

  return useMemo(
    () =>
      buildPassportProjectsViewModel({
        address: address ?? null,
        loading: Boolean(isConnecting || isReconnecting),
        fixtureProjects: options.fixtureProjects,
        sourceUnavailable: options.sourceUnavailable,
      }),
    [address, isConnecting, isReconnecting, options.fixtureProjects, options.sourceUnavailable],
  )
}
