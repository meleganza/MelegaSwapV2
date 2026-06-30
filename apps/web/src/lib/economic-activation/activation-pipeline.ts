import { ActivationStageId } from './activation-types'

export const ACTIVATION_PIPELINE_VERSION = '0.1.0'

export const ACTIVATION_DISCLAIMER =
  'Labs → DEX economic activation read model only. No blockchain writes, token deployment, or contract execution in this phase.'

export const ACTIVATION_AS_OF = '2026-06-28'

export interface PipelineStageDefinition {
  id: ActivationStageId
  label: string
  machineSurface: string
  defaultHref?: string
}

export const ACTIVATION_PIPELINE_STAGES: PipelineStageDefinition[] = [
  {
    id: 'narrative',
    label: 'Narrative',
    machineSurface: 'labs://narrative/validated',
  },
  {
    id: 'validation',
    label: 'Validation',
    machineSurface: 'labs://validation/constitutional',
  },
  {
    id: 'project_registry',
    label: 'Project Registry',
    machineSurface: 'manifest://melega/platform/project-registry@0.1.0',
    defaultHref: '/projects',
  },
  {
    id: 'canonical_asset',
    label: 'Canonical Asset',
    machineSurface: 'manifest://melega/platform/asset-registry@0.1.0',
    defaultHref: '/assets',
  },
  {
    id: 'economic_presence',
    label: 'Economic Presence',
    machineSurface: 'manifest://melega/platform/asset-registry@0.1.0#presence',
  },
  {
    id: 'venue_activation',
    label: 'Venue Activation',
    machineSurface: 'manifest://melega/platform/venue-registry@0.1.0',
    defaultHref: '/venues',
  },
  {
    id: 'economic_events',
    label: 'Economic Events',
    machineSurface: 'manifest://melega/platform/event-registry@0.1.0',
    defaultHref: '/events',
  },
  {
    id: 'treasury_runtime',
    label: 'Treasury Runtime',
    machineSurface: 'manifest://melega/platform/treasury-runtime@0.2.0',
  },
  {
    id: 'radar',
    label: 'Radar',
    machineSurface: 'manifest://melega/platform/radar@0.2.0',
  },
  {
    id: 'space',
    label: 'Space',
    machineSurface: 'manifest://melega/platform/space@0.2.0',
  },
  {
    id: 'smartdrop',
    label: 'SmartDrop',
    machineSurface: 'manifest://melega/platform/smartdrop@0.2.0',
  },
]

export const getPipelineStage = (id: ActivationStageId): PipelineStageDefinition | undefined =>
  ACTIVATION_PIPELINE_STAGES.find((stage) => stage.id === id)
