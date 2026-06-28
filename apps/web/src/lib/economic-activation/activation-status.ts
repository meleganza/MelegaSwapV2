import { CapabilityStatus } from 'registry/projects/types'
import { ActivationStageStatus } from './activation-types'

export const ACTIVATION_STATUS_ORDER: ActivationStageStatus[] = ['READY', 'WAITING', 'BLOCKED', 'PLANNED']

export const activationStatusLabel = (status: ActivationStageStatus): string => status

export const mapCapabilityToActivationStatus = (capability?: CapabilityStatus): ActivationStageStatus => {
  switch (capability) {
    case 'live':
    case 'finished':
      return 'READY'
    case 'partial':
    case 'scheduled':
    case 'watch':
      return 'WAITING'
    case 'planned':
    case 'none':
      return 'PLANNED'
    case 'unverified':
    case 'clear':
      return 'BLOCKED'
    default:
      return 'PLANNED'
  }
}

export const gateStatusFromPrerequisite = (
  prerequisiteReady: boolean,
  planned: boolean,
): ActivationStageStatus => {
  if (prerequisiteReady) return 'READY'
  if (planned) return 'PLANNED'
  return 'BLOCKED'
}

export const mergeActivationStatus = (
  current: ActivationStageStatus,
  next: ActivationStageStatus,
): ActivationStageStatus => {
  const currentIdx = ACTIVATION_STATUS_ORDER.indexOf(current)
  const nextIdx = ACTIVATION_STATUS_ORDER.indexOf(next)
  return ACTIVATION_STATUS_ORDER[Math.min(currentIdx, nextIdx)]
}
