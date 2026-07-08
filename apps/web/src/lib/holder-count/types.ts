export type HolderCountSource = 'bscscan' | 'unavailable'

export type HolderCountResult =
  | {
      status: 'ready'
      count: number
      source: HolderCountSource
      checkedAt: string
    }
  | {
      status: 'unavailable'
      reason: string
      source: 'unavailable'
      diagnostic: string
      checkedAt: string
    }
