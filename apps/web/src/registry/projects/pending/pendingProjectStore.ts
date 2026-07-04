import type { PendingProjectRecord, PendingProjectStatus } from './types'

export interface PendingRegistryStorage {
  getAll(): PendingProjectRecord[]
  getById(id: string): PendingProjectRecord | undefined
  getByContract(chainId: number, contract: string): PendingProjectRecord | undefined
  upsert(record: PendingProjectRecord): PendingProjectRecord
  updateStatus(
    id: string,
    status: PendingProjectStatus,
    review?: Partial<PendingProjectRecord['review']>,
  ): PendingProjectRecord | undefined
}

const STORAGE_KEY = 'melega.project-registry.pending.v1'

function normalizeContract(contract: string): string {
  return contract.trim().toLowerCase()
}

function createMemoryStorage(): PendingRegistryStorage {
  const records = new Map<string, PendingProjectRecord>()

  return {
    getAll: () => Array.from(records.values()),
    getById: (id) => records.get(id),
    getByContract: (chainId, contract) => {
      const key = `pending:${chainId}:${normalizeContract(contract)}`
      return records.get(key)
    },
    upsert: (record) => {
      records.set(record.id, record)
      return record
    },
    updateStatus: (id, status, review) => {
      const existing = records.get(id)
      if (!existing) return undefined
      const updated: PendingProjectRecord = {
        ...existing,
        status,
        updated_at: new Date().toISOString(),
        review: {
          ...existing.review,
          state: status,
          ...review,
          reviewed_at: review?.reviewed_at ?? new Date().toISOString(),
        },
      }
      records.set(id, updated)
      return updated
    },
  }
}

function createLocalStorageAdapter(): PendingRegistryStorage {
  const readAll = (): PendingProjectRecord[] => {
    if (typeof window === 'undefined') return []
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw) as PendingProjectRecord[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const writeAll = (records: PendingProjectRecord[]) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  }

  return {
    getAll: readAll,
    getById: (id) => readAll().find((r) => r.id === id),
    getByContract: (chainId, contract) =>
      readAll().find(
        (r) => r.chain === chainId && normalizeContract(r.contract) === normalizeContract(contract),
      ),
    upsert: (record) => {
      const all = readAll().filter((r) => r.id !== record.id)
      all.push(record)
      writeAll(all)
      return record
    },
    updateStatus: (id, status, review) => {
      const all = readAll()
      const index = all.findIndex((r) => r.id === id)
      if (index < 0) return undefined
      const updated: PendingProjectRecord = {
        ...all[index],
        status,
        updated_at: new Date().toISOString(),
        review: {
          ...all[index].review,
          state: status,
          ...review,
          reviewed_at: review?.reviewed_at ?? new Date().toISOString(),
        },
      }
      all[index] = updated
      writeAll(all)
      return updated
    },
  }
}

let serverStorage: PendingRegistryStorage | undefined

export function getPendingProjectRegistry(): PendingRegistryStorage {
  if (typeof window !== 'undefined' && window.localStorage) {
    return createLocalStorageAdapter()
  }
  if (!serverStorage) serverStorage = createMemoryStorage()
  return serverStorage
}

export function resetPendingProjectRegistryForTests(): void {
  serverStorage = createMemoryStorage()
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}
