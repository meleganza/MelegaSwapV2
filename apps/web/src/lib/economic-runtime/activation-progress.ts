import { ActivationStageId } from 'lib/economic-activation'
import { ActivationProgress, ActivationRuntimeStage } from './runtime-types'
import { resolveCurrentFocusStageId } from './activation-state'

const phaseLabelFor = (focusId: ActivationStageId | null): string => {
  if (!focusId) return 'Activation complete — Phase 2 surfaces remain read-only'
  if (focusId === 'narrative' || focusId === 'validation') return 'Labs handoff'
  if (focusId === 'project_registry' || focusId === 'canonical_asset') return 'Registry binding'
  if (focusId === 'economic_presence' || focusId === 'venue_activation') return 'Economic presence'
  if (focusId === 'economic_events') return 'Event graph'
  return 'Phase 2 compatibility'
}

export const computeActivationProgress = (stages: ActivationRuntimeStage[]): ActivationProgress => {
  const readyCount = stages.filter((stage) => stage.state === 'READY').length
  const waitingCount = stages.filter((stage) => stage.state === 'WAITING').length
  const blockedCount = stages.filter((stage) => stage.state === 'BLOCKED').length
  const plannedCount = stages.filter((stage) => stage.state === 'PLANNED').length
  const totalStages = stages.length
  const focusId = resolveCurrentFocusStageId(stages)

  return {
    totalStages,
    readyCount,
    waitingCount,
    blockedCount,
    plannedCount,
    percentReady: totalStages === 0 ? 0 : Math.round((readyCount / totalStages) * 100),
    currentFocusStageId: focusId,
    phaseLabel: phaseLabelFor(focusId),
  }
}
