import {
  ActivationPipelineReadModel,
  ActivationStage,
  ActivationStageId,
  ActivationStageStatus,
  ACTIVATION_PIPELINE_STAGES,
} from 'lib/economic-activation'
import { ActivationRuntimeStage } from './runtime-types'
import { buildStageEvidence } from './activation-evidence'

const PHASE2_STAGES = new Set<ActivationStageId>([
  'treasury_runtime',
  'radar',
  'space',
  'smartdrop',
])

const prerequisiteFor = (stageId: ActivationStageId): ActivationStageId | null => {
  const index = ACTIVATION_PIPELINE_STAGES.findIndex((stage) => stage.id === stageId)
  if (index <= 0) return null
  return ACTIVATION_PIPELINE_STAGES[index - 1].id
}

const prerequisiteLabel = (stageId: ActivationStageId): string => {
  const def = ACTIVATION_PIPELINE_STAGES.find((stage) => stage.id === stageId)
  return def?.label ?? stageId
}

export const resolveStageReason = (stage: ActivationStage, model: ActivationPipelineReadModel): string => {
  if (stage.notes) return stage.notes
  if (stage.summary) return stage.summary

  if (model.mode === 'labs_preview' && stage.id === 'narrative') {
    return 'Awaiting indexed Labs narrative before constitutional validation'
  }

  return `${stage.label} — ${stage.status}`
}

export const resolveNextRequirement = (
  stage: ActivationStage,
  model: ActivationPipelineReadModel,
  stagesById: Map<ActivationStageId, ActivationStage>,
): string | null => {
  if (stage.status === 'READY') return null

  if (PHASE2_STAGES.has(stage.id)) {
    return 'Phase 2 runtime surface — indexed read model only, no execution'
  }

  if (stage.status === 'BLOCKED') {
    const prereq = prerequisiteFor(stage.id)
    if (prereq) {
      const prereqStage = stagesById.get(prereq)
      if (prereqStage && prereqStage.status !== 'READY') {
        return `Unblock ${prerequisiteLabel(prereq)} (${prereqStage.status})`
      }
    }
    return stage.notes ?? `Resolve blocker on ${stage.label}`
  }

  if (stage.status === 'PLANNED') {
    return stage.notes ?? `${stage.label} planned — no runtime indexed`
  }

  const prereq = prerequisiteFor(stage.id)
  if (prereq) {
    const prereqStage = stagesById.get(prereq)
    if (prereqStage && prereqStage.status !== 'READY') {
      return `Complete ${prerequisiteLabel(prereq)} first`
    }
  }

  if (stage.id === 'narrative' && !model.labsConnected) {
    return 'Indexed Labs narrative required'
  }

  if (stage.id === 'project_registry' && model.mode === 'labs_preview') {
    return 'Successful constitutional validation required'
  }

  return stage.notes ?? `Awaiting ${stage.label} readiness signal`
}

export const buildRuntimeStage = (
  stage: ActivationStage,
  model: ActivationPipelineReadModel,
  ordinal: number,
  stagesById: Map<ActivationStageId, ActivationStage>,
): ActivationRuntimeStage => ({
  id: stage.id,
  label: stage.label,
  ordinal,
  state: stage.status,
  reason: resolveStageReason(stage, model),
  evidence: buildStageEvidence(stage, model),
  nextRequirement: resolveNextRequirement(stage, model, stagesById),
  machineSurface: stage.machineSurface,
  href: stage.href,
})

export const buildRuntimeStages = (model: ActivationPipelineReadModel): ActivationRuntimeStage[] => {
  const stagesById = new Map(model.stages.map((stage) => [stage.id, stage]))
  return model.stages.map((stage, index) => buildRuntimeStage(stage, model, index + 1, stagesById))
}

export const resolveCurrentFocusStageId = (
  stages: ActivationRuntimeStage[],
): ActivationStageId | null => {
  const focus = stages.find(
    (stage) => stage.state === 'BLOCKED' || stage.state === 'WAITING',
  )
  if (focus) return focus.id

  const planned = stages.find((stage) => stage.state === 'PLANNED')
  return planned?.id ?? null
}
