/**
 * PASSPORT_MODULE_003 — single factual source for Assets presentation.
 */
import { useMemo } from 'react'
import { useAccount, useNetwork } from 'wagmi'
import {
  buildPassportAssetsViewModel,
  type PassportAssetsInput,
} from './buildPassportAssetsViewModel'
import type { PassportAssetsViewModel } from './passportAssetsTypes'

export type UsePassportAssetsOptions = {
  fixture?: PassportAssetsInput['fixture']
}

export function usePassportAssets(options: UsePassportAssetsOptions = {}): PassportAssetsViewModel {
  const { address, connector, isConnecting, isReconnecting } = useAccount()
  const { chain } = useNetwork()

  return useMemo(
    () =>
      buildPassportAssetsViewModel({
        address: address ?? null,
        loading: Boolean(isConnecting || isReconnecting),
        connectorName: connector?.name ?? null,
        chainName: chain?.name ?? null,
        fixture: options.fixture,
      }),
    [address, connector?.name, chain?.name, isConnecting, isReconnecting, options.fixture],
  )
}
