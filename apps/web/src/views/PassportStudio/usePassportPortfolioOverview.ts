/**
 * PASSPORT_MODULE_002 — single factual source for Portfolio Overview presentation.
 */
import { useMemo } from 'react'
import { useAccount } from 'wagmi'
import {
  buildPassportPortfolioOverviewViewModel,
  type PassportPortfolioOverviewInput,
} from './buildPassportPortfolioOverviewViewModel'
import type { PassportPortfolioOverviewViewModel } from './passportPortfolioOverviewTypes'

export type UsePassportPortfolioOverviewOptions = {
  fixture?: PassportPortfolioOverviewInput['fixture']
}

export function usePassportPortfolioOverview(
  options: UsePassportPortfolioOverviewOptions = {},
): PassportPortfolioOverviewViewModel {
  const { address, isConnecting, isReconnecting } = useAccount()

  return useMemo(
    () =>
      buildPassportPortfolioOverviewViewModel({
        address: address ?? null,
        loading: Boolean(isConnecting || isReconnecting),
        fixture: options.fixture,
      }),
    [address, isConnecting, isReconnecting, options.fixture],
  )
}
