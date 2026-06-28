import { ActivationRuntimeStage } from './runtime-types'
import { resolveCurrentFocusStageId } from './activation-state'

export const buildActivationTimeline = (stages: ActivationRuntimeStage[]) => {
  const focusId = resolveCurrentFocusStageId(stages)

  return stages.map((stage) => ({
    id: `timeline:${stage.id}`,
    stageId: stage.id,
    label: stage.label,
    state: stage.state,
    ordinal: stage.ordinal,
    isCurrentFocus: stage.id === focusId,
    isComplete: stage.state === 'READY',
  }))
}
