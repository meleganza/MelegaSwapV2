import { useCallback, useSyncExternalStore } from 'react'
import { buildCivilizationFabricProfile } from './buildCivilizationFabric'
import {
  getFabricHistorySnapshot,
  subscribeFabricConsumer,
  subscribeFabricEvents,
} from './event-fabric'
import type { CivilizationFabricProfile } from './types'

export function useCivilizationFabricSync(): CivilizationFabricProfile {
  const subscribe = useCallback((onStoreChange: () => void) => {
    const unsubFabric = subscribeFabricEvents(() => onStoreChange())
    const unsubConsumer = subscribeFabricConsumer('command_center')
    return () => {
      unsubFabric()
      unsubConsumer()
    }
  }, [])
  const getSnapshot = useCallback(() => getFabricHistorySnapshot(), [])
  const getServerSnapshot = useCallback(() => 0, [])

  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return buildCivilizationFabricProfile()
}

/** @deprecated Use useCivilizationFabricSync — React is a Fabric consumer only */
export function useCivilizationRuntimeSync(): CivilizationFabricProfile {
  return useCivilizationFabricSync()
}
