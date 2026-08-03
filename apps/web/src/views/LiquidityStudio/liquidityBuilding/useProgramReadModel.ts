import { useMemo } from 'react'
import { useContract } from 'hooks/useContract'
import { useSingleCallResult } from 'state/multicall/hooks'
import { LB_DEPLOYED_ADDRESSES, isDeployedAddress } from './addresses'
import { LB_FACTORY_READ_ABI, LB_PROGRAM_VIEW_ABI } from './abi/fragments'
import { activeProgramCallArgs } from './activeProgramCallArgs'
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
  /** Factory bound and ready for createProgram even when no active clone yet. */
  factoryBound: boolean
}

export { activeProgramCallArgs }

/**
 * Live Program read model.
 * Without a verified deployed factory → UNAVAILABLE (honest).
 * NO_ACTIVE_PROGRAM means factory is live but this wallet/token has no clone yet.
 */
export function useProgramReadModel(input: {
  owner: string | null | undefined
  projectTokenAddress: string | null | undefined
  quoteAssetAddress?: string | null | undefined
  pairAddress?: string | null | undefined
  /** Deep-link / portfolio override — keeps single-program activeProgram path when unset. */
  programAddress?: string | null | undefined
}): ProgramReadModelResult {
  const boundProgram = LB_DEPLOYED_ADDRESSES.programAddress
  const lbFactory = LB_DEPLOYED_ADDRESSES.lbFactory
  const factoryBound = isDeployedAddress(lbFactory)
  const deepLinkedProgram = isDeployedAddress(input.programAddress ?? null)
    ? String(input.programAddress)
    : null

  const factoryContract = useContract(
    factoryBound ? lbFactory : undefined,
    LB_FACTORY_READ_ABI as unknown as any,
    false,
  )

  const activeArgs = deepLinkedProgram
    ? null
    : activeProgramCallArgs(
        input.owner,
        input.projectTokenAddress,
        input.quoteAssetAddress,
        input.pairAddress,
      )

  const activeProgramResult = useSingleCallResult(
    activeArgs ? factoryContract : undefined,
    'activeProgram',
    activeArgs ?? undefined,
  )

  const resolvedProgram =
    deepLinkedProgram ||
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
    if (!factoryBound && !isDeployedAddress(boundProgram)) {
      return {
        snapshot: emptyProgramSnapshot(),
        activity: [],
        source: 'UNAVAILABLE' as const,
        reason: 'LB_PROGRAM_NOT_DEPLOYED',
        factoryBound: false,
      }
    }

    if (!resolvedProgram) {
      return {
        snapshot: emptyProgramSnapshot(),
        activity: [],
        source: 'UNAVAILABLE' as const,
        reason: 'NO_ACTIVE_PROGRAM',
        factoryBound,
      }
    }

    if (viewResult.loading) {
      return {
        snapshot: emptyProgramSnapshot(),
        activity: [],
        source: 'UNAVAILABLE' as const,
        reason: 'LOADING',
        factoryBound,
      }
    }

    const raw = viewResult.result?.[0] as ProgramViewLike | undefined
    if (!raw) {
      return {
        snapshot: emptyProgramSnapshot(),
        activity: [],
        source: 'UNAVAILABLE' as const,
        reason: 'PROGRAM_VIEW_UNAVAILABLE',
        factoryBound,
      }
    }

    const snapshot = snapshotFromProgramView(resolvedProgram, raw)
    const activity = activityFromLatestExecution({
      executionCount: snapshot.executionCount,
      latest: (latestResult?.result?.[0] as any) ?? null,
    })

    return {
      snapshot,
      activity,
      source: 'ON_CHAIN' as const,
      reason: null,
      factoryBound,
    }
  }, [factoryBound, boundProgram, resolvedProgram, viewResult.loading, viewResult.result, latestResult?.result])
}
