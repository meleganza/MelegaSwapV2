import { ActivationPipelineReadModel } from 'lib/economic-activation'
import { ActivationJournalEntry, ActivationRuntimeStage } from './runtime-types'

export const buildActivationJournal = (
  model: ActivationPipelineReadModel,
  stages: ActivationRuntimeStage[],
  asOf: string,
): ActivationJournalEntry[] => {
  const entries: ActivationJournalEntry[] = [
    {
      id: 'journal:session:start',
      at: asOf,
      stageId: 'session',
      kind: 'constitutional',
      message: `Runtime session opened — ${model.constitutional.canonicalAsset} on ${model.constitutional.canonicalChain} (${model.constitutional.status})`,
      state: 'RUNTIME',
    },
    {
      id: 'journal:session:mode',
      at: asOf,
      stageId: 'session',
      kind: 'observation',
      message:
        model.mode === 'project_derived'
          ? `Project-derived read model: ${model.projectSlug}`
          : 'Labs preview — no project binding',
      state: 'RUNTIME',
    },
  ]

  stages.forEach((stage) => {
    entries.push({
      id: `journal:${stage.id}:state`,
      at: asOf,
      stageId: stage.id,
      kind: stage.state === 'BLOCKED' ? 'gate' : 'observation',
      message: `${stage.label}: ${stage.state} — ${stage.reason}`,
      state: stage.state,
    })

    if (stage.nextRequirement) {
      entries.push({
        id: `journal:${stage.id}:requirement`,
        at: asOf,
        stageId: stage.id,
        kind: 'requirement',
        message: stage.nextRequirement,
        state: stage.state,
      })
    }
  })

  const readyCount = stages.filter((stage) => stage.state === 'READY').length
  entries.push({
    id: 'journal:session:progress',
    at: asOf,
    stageId: 'session',
    kind: 'progress',
    message: `Activation progress: ${readyCount}/${stages.length} stages READY`,
    state: 'RUNTIME',
  })

  return entries
}
