import {
  ActivationPipelineReadModel,
  ActivationStage,
  ActivationStageId,
  getPipelineStage,
} from 'lib/economic-activation'
import { ActivationEvidenceItem } from './runtime-types'

const PHASE2_STAGES: ActivationStageId[] = [
  'treasury_runtime',
  'radar',
  'space',
  'smartdrop',
]

const executionSurface = 'manifest://melega/platform/execution@0.2.0'

export const getFutureExecutionSurface = (): string => executionSurface

export const buildStageEvidence = (
  stage: ActivationStage,
  model: ActivationPipelineReadModel,
): ActivationEvidenceItem[] => {
  const items: ActivationEvidenceItem[] = []
  const def = getPipelineStage(stage.id)

  if (def?.machineSurface) {
    items.push({
      id: `${stage.id}:surface`,
      kind: 'manifest',
      source: def.machineSurface,
      summary: `Machine surface for ${stage.label}`,
    })
  }

  if (stage.href) {
    items.push({
      id: `${stage.id}:href`,
      kind: 'registry',
      source: stage.href,
      summary: `Registry route — ${stage.summary}`,
      href: stage.href,
    })
  }

  switch (stage.id) {
    case 'narrative':
      items.push({
        id: 'narrative:labs',
        kind: 'labs',
        source: 'labs://narrative/validated',
        summary: model.labsConnected
          ? 'Labs narrative indexed'
          : 'Labs narrative not indexed in this build',
      })
      break
    case 'validation':
      items.push({
        id: 'validation:constitutional',
        kind: 'constitutional',
        source: 'MELEGA_DEX_CONSTITUTION_V1',
        summary: `Canonical ${model.constitutional.canonicalAsset} on ${model.constitutional.canonicalChain}`,
      })
      break
    case 'canonical_asset':
      items.push({
        id: 'canonical_asset:constitutional',
        kind: 'constitutional',
        source: 'manifest://melega/platform/asset-registry@0.1.0#canonical',
        summary: `${model.constitutional.canonicalAsset} constitutional binding — immutable`,
      })
      break
    case 'economic_presence':
      model.presenceTargets.forEach((target) => {
        items.push({
          id: `presence:${target.chainId}`,
          kind: 'presence',
          source: `presence://${target.chainId}`,
          summary: `${target.displayName} — ${target.status} (${target.role})`,
        })
      })
      break
    default:
      break
  }

  if (stage.summary) {
    items.push({
      id: `${stage.id}:observation`,
      kind: 'observation',
      source: `read-model://${stage.id}`,
      summary: stage.summary,
    })
  }

  if (stage.notes) {
    items.push({
      id: `${stage.id}:notes`,
      kind: 'observation',
      source: `read-model://${stage.id}/notes`,
      summary: stage.notes,
    })
  }

  if (PHASE2_STAGES.includes(stage.id)) {
    items.push({
      id: `${stage.id}:phase2`,
      kind: 'manifest',
      source: def?.machineSurface ?? `manifest://melega/platform/${stage.id}@0.2.0`,
      summary: 'Phase 2 runtime surface — read model compatibility only',
    })
  }

  if (stage.id === 'smartdrop') {
    items.push({
      id: 'execution:future',
      kind: 'execution',
      source: executionSurface,
      summary: 'Execution runtime reserved — no on-chain execution in this phase',
    })
  }

  return items
}
