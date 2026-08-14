export type YieldParticipantIndexStatus = 'ready' | 'indexing' | 'unavailable' | 'error'

export type YieldParticipantCount = {
  participants: number
  lastIndexedBlock: number
  chainHead: number
  updatedAt: string
}

export type YieldParticipantSnapshot = {
  schema: 'melega.yield-participants.v1'
  status: YieldParticipantIndexStatus
  updatedAt: string | null
  source: 'masterchef-smartchef-event-index'
  farms: Record<string, YieldParticipantCount>
  pools: Record<string, YieldParticipantCount>
}

export type YieldParticipantApiResponse = YieldParticipantSnapshot & {
  farmCount: number
  poolCount: number
}
