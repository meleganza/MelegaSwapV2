import { CapabilityStatus } from './types'

export const getCapabilityStatusLabel = (status: CapabilityStatus): string => {
  switch (status) {
    case 'live':
      return 'Live'
    case 'partial':
      return 'Partial'
    case 'finished':
      return 'Finished'
    case 'planned':
      return 'Planned'
    case 'scheduled':
      return 'Scheduled'
    case 'clear':
      return 'Clear'
    case 'watch':
      return 'Watch'
    case 'unverified':
      return 'Unverified'
    case 'none':
    default:
      return 'None'
  }
}
