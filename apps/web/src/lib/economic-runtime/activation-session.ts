import {
  ActivationPipelineReadModel,
  resolveActivationReadModel,
} from 'lib/economic-activation'
import { buildActivationJournal } from './activation-journal'
import { computeActivationProgress } from './activation-progress'
import { buildRuntimeStages } from './activation-state'
import { buildActivationTimeline } from './activation-timeline'
import { ActivationSession } from './runtime-types'

const RUNTIME_VERSION = '0.1.0'

export const buildSessionId = (model: ActivationPipelineReadModel): string =>
  model.projectSlug ? `activation:project:${model.projectSlug}` : 'activation:labs_preview'

export const createActivationSession = (model: ActivationPipelineReadModel): ActivationSession => {
  const stages = buildRuntimeStages(model)
  const progress = computeActivationProgress(stages)
  const timeline = buildActivationTimeline(stages)
  const journal = buildActivationJournal(model, stages, model.asOf)

  return {
    sessionId: buildSessionId(model),
    mode: model.mode,
    projectSlug: model.projectSlug,
    startedAt: model.asOf,
    asOf: model.asOf,
    disclaimer: model.disclaimer,
    readOnly: true,
    executionEnabled: false,
    constitutional: model.constitutional,
    stages,
    timeline,
    journal,
    progress,
  }
}

export const resolveActivationSession = (options?: { projectSlug?: string }): ActivationSession => {
  const model = resolveActivationReadModel(options)
  return createActivationSession(model)
}

export const getRuntimeVersion = (): string => RUNTIME_VERSION
