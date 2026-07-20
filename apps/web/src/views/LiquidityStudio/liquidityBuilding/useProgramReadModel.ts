import { useMemo } from 'react'
import { useContract } from 'hooks/useContract'
import { useSingleCallResult } from 'state/multicall/hooks'
import { LB_DEPLOYED_ADDRESSES, isDeployedAddress } from './addresses'
import { LB_FACTORY_READ_ABI, LB_PROGRAM_VIEW_ABI } from './abi/fragments'
import {
  emptyProgramSnapshot,
  snapshotFromProgramView,
  type ProgramReadSnapshot,
  type ProgramViewLike,
} from './mapProgramView'
import { activityFromLatestExecution } from './mapActivityEvents'
import type { LbActivityItem } from './uxCopy'

export type ProgramReadModelResult = {
  snapshot: ProgramReadSnapshot
  activity: LbActivityItem[]
  source: 'ON_CHAIN' | 'UNAVAILABLE'
  reason: string | null
}

/**
 * Live Program read model.
 * Without a verified deployed program/factory address → UNAVAILABLE (honest).
 * Never fills metrics from local draft state.
 */
export function useProgramReadModel(input: {
  owner: string | null | undefined
  projectTokenAddress: string | null | undefined
}): ProgramReadModelResult {
  const boundProgram = LB_DEPLOYED_ADDRESSES.programAddress
  const lbFactory = LB_DEPLOYED_ADDRESSES.lbFactory

  const factoryContract = useContract(
    isDeployedAddress(lbFactory) ? lbFactory : undefined,
    LB_FACTORY_READ_ABI as unknown as any,
    false,
  )

  const activeProgramResult = useSingleCallResult(
    factoryContract,
    'activeProgram',
    input.owner && input.projectTokenAddress ? [input.owner, input.projectTokenAddress] : undefined,
  )

  const resolvedProgram =
    (isDeployedAddress(boundProgram) ? boundProgram : null) ||
    (activeProgramResult?.result?.[0] && isDeployedAddress(String(activeProgramResult.result[0]))
      ? String(activeProgramResult.result[0])
      : null)

  const programContract = useContract(
    resolvedProgram ?? undefined,
    LB_PROGRAM_VIEW_ABI as unknown as any,
    false,
  )

  const viewResult = useSingleCallResult(programContract, 'getProgramView')
  const latestResult = useSingleCallResult(programContract, 'latestExecution')

  return useMemo(() => {
    if (!isDeployedAddress(lbFactory) && !isDeployedAddress(boundProgram)) {
      return {
        snapshot: emptyProgramSnapshot(),
        activity: [],
        source: 'UNAVAILABLE' as const,
        reason: 'LB_PROGRAM_NOT_DEPLOYED',
      }
    }

    if (!resolvedProgram) {
      return {
        snapshot: emptyProgramSnapshot(),
        activity: [],
        source: 'UNAVAILABLE' as const,
        reason: 'NO_ACTIVE_PROGRAM',
      }
    }

    if (viewResult.loading) {
      return {
        snapshot: emptyProgramSnapshot(),
        activity: [],
        source: 'UNAVAILABLE' as const,
        reason: 'LOADING',
      }
    }

    const raw = viewResult.result?.[0] as ProgramViewLike | undefined
    if (!raw) {
      return {
        snapshot: emptyProgramSnapshot(),
        activity: [],
        source: 'UNAVAILABLE' as const,
        reason: 'VIEW_UNAVAILABLE',
      }
    }

    const snapshot = snapshotFromProgramView(resolvedProgram, raw)
    const activity = activityFromLatestExecution({
      executionCount: snapshot.executionCount,
      latest: (latestResult.result?.[0] as any) ?? null,
    })

    return {
      snapshot,
      activity,
      source: 'ON_CHAIN' as const,
      reason: null,
    }
  }, [
    boundProgram,
    latestResult.result,
    lbFactory,
    resolvedProgram,
    viewResult.loading,
    viewResult.result,
  ])
}
