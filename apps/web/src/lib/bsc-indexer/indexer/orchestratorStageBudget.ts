import type { CoverageRange } from './coverageRanges'
import { findCoverageGaps } from './coverageRanges'
import type { IndexerDeadline } from './indexerDeadline'
import { IndexerDeadline as IndexerDeadlineClass } from './indexerDeadline'

/** Per-stage cap when interior bootstrap is complete and only head-edge sync remains. */
export const STAGE_BUDGET_HEAD_EDGE_MS = 30_000

export type OrchestratorStageMode = 'interior-gap' | 'head-edge-only'

export interface FeaturedCoverageContext {
  bootstrapFloor: number
  forwardHigh: number
  gapFillCursor: number
  coverageRanges: CoverageRange[]
}

/** True when any uncovered interval exists inside [bootstrapFloor, gapFillCursor]. */
export function hasInteriorBootstrapGap(
  coverageRanges: CoverageRange[],
  bootstrapFloor: number,
  gapFillCursor: number,
): boolean {
  if (gapFillCursor < bootstrapFloor) return true
  return findCoverageGaps(coverageRanges, bootstrapFloor, gapFillCursor).length > 0
}

export function resolveOrchestratorStageMode(ctx: FeaturedCoverageContext): OrchestratorStageMode {
  return hasInteriorBootstrapGap(ctx.coverageRanges, ctx.bootstrapFloor, ctx.gapFillCursor)
    ? 'interior-gap'
    : 'head-edge-only'
}

export function shouldRunTierStages(
  stageMode: OrchestratorStageMode,
  featuredBootstrapComplete: boolean,
): boolean {
  if (stageMode === 'head-edge-only') return true
  return featuredBootstrapComplete
}

export function resolveStageDeadline(
  globalDeadline: IndexerDeadline,
  stageMode: OrchestratorStageMode,
): IndexerDeadline {
  if (stageMode === 'head-edge-only') {
    return IndexerDeadlineClass.forStage(globalDeadline, STAGE_BUDGET_HEAD_EDGE_MS)
  }
  return globalDeadline
}
