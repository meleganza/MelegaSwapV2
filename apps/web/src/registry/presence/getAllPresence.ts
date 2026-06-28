import { STATIC_PRESENCE_RECORDS } from './presence.data'
import { StaticPresenceRecord } from './presence-types'

export const getAllPresence = (): StaticPresenceRecord[] =>
  STATIC_PRESENCE_RECORDS.map((record) => ({
    ...record,
    warnings: [...record.warnings],
    links: { ...record.links },
  }))
