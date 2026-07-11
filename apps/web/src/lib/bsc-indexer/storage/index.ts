import { head, put } from '@vercel/blob'
import path from 'path'
import type { IndexerCheckpoint, IndexerHealthSnapshot, NormalizedIndexerEvent, OhlcvCandle } from '../types'
import type { IndexerStorage } from './types'
import { createJsonFileStorage } from './jsonFileStorage'
import { featuredPairPrefix, LEGACY_BLOB_PREFIX } from '../v2/paths'

function blobPath(prefix: string, key: string): string {
  return `${prefix}/${key}`
}

/** Vercel Blob adapter — R771 v2 featured-pair namespace. */
export function createV2FeaturedPairBlobStorage(prefix = featuredPairPrefix()): IndexerStorage | null {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim()
  if (!token) return null

  async function readJson<T>(key: string): Promise<T | null> {
    try {
      const meta = await head(blobPath(prefix, key), { token })
      const res = await fetch(meta.url, { headers: { authorization: `Bearer ${token}` } })
      if (!res.ok) return null
      return (await res.json()) as T
    } catch {
      return null
    }
  }

  async function writeJson(key: string, data: unknown) {
    await put(blobPath(prefix, key), JSON.stringify(data), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
      token,
    })
  }

  return {
    backend: 'vercel-blob-v2-featured-pair',
    configured: true,
    async loadCheckpoint() {
      return readJson<IndexerCheckpoint>('checkpoint.json')
    },
    async saveCheckpoint(checkpoint) {
      await writeJson('checkpoint.json', checkpoint)
    },
    async loadHealth() {
      return readJson<IndexerHealthSnapshot>('health.json')
    },
    async saveHealth(health) {
      await writeJson('health.json', health)
    },
    async appendEvents(events) {
      const existing = (await readJson<NormalizedIndexerEvent[]>('events.json')) ?? []
      const seen = new Set(existing.map((e) => `${e.txHash}:${e.logIndex}`))
      const added = events.filter((e) => {
        const key = `${e.txHash}:${e.logIndex}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      if (added.length) await writeJson('events.json', [...existing, ...added])
      return added.length
    },
    async listEvents(query) {
      const all = (await readJson<NormalizedIndexerEvent[]>('events.json')) ?? []
      let rows = all
      if (query.pairAddress) {
        const p = query.pairAddress.toLowerCase()
        rows = rows.filter((e) => e.pairAddress?.toLowerCase() === p)
      }
      if (query.eventTypes?.length) {
        const set = new Set(query.eventTypes)
        rows = rows.filter((e) => set.has(e.eventType))
      }
      if (query.fromBlock) rows = rows.filter((e) => e.blockNumber >= query.fromBlock!)
      rows = [...rows].sort((a, b) => b.blockNumber - a.blockNumber || b.logIndex - a.logIndex)
      const offset = query.offset ?? 0
      const limit = query.limit ?? 50
      return rows.slice(offset, offset + limit)
    },
    async countEvents() {
      const all = (await readJson<NormalizedIndexerEvent[]>('events.json')) ?? []
      const counts: Record<string, number> = {}
      for (const e of all) counts[e.eventType] = (counts[e.eventType] ?? 0) + 1
      return counts
    },
    async saveCandles(candles) {
      const grouped = new Map<string, OhlcvCandle[]>()
      for (const c of candles) {
        const key = `candles/${c.pairAddress.toLowerCase()}-${c.interval}.json`
        if (!grouped.has(key)) grouped.set(key, [])
        grouped.get(key)!.push(c)
      }
      for (const [key, batch] of grouped) {
        const existing = (await readJson<OhlcvCandle[]>(key)) ?? []
        const map = new Map(existing.map((c) => [c.bucketTimestamp, c]))
        for (const c of batch) map.set(c.bucketTimestamp, c)
        await writeJson(key, [...map.values()].sort((a, b) => a.bucketTimestamp - b.bucketTimestamp))
      }
    },
    async listCandles(pairAddress, interval, limit = 200) {
      const key = `candles/${pairAddress.toLowerCase()}-${interval}.json`
      const rows = (await readJson<OhlcvCandle[]>(key)) ?? []
      return rows.slice(-limit)
    },
  }
}

let cached: IndexerStorage | null = null

export function resolveIndexerStorage(): IndexerStorage {
  if (cached) return cached
  const blob = createV2FeaturedPairBlobStorage()
  if (blob) {
    cached = blob
    return blob
  }
  const localRoot = path.join(process.cwd(), 'data', featuredPairPrefix())
  cached = createJsonFileStorage(localRoot)
  return cached
}

export function isProductionDurableStorageConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim())
}

/** Smoke helper for production blob verification. */
export async function verifyBlobRoundTrip(): Promise<{ ok: boolean; reason?: string }> {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim()
  if (!token) return { ok: false, reason: 'BLOB_READ_WRITE_TOKEN missing' }
  const key = blobPath(featuredPairPrefix(), `smoke-${Date.now()}.json`)
  const payload = { ts: new Date().toISOString(), generation: 'v2-featured-pair' }
  try {
    await put(key, JSON.stringify(payload), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
      token,
    })
    const meta = await head(key, { token })
    const res = await fetch(meta.url, { headers: { authorization: `Bearer ${token}` } })
    if (!res.ok) return { ok: false, reason: `Blob read HTTP ${res.status}` }
    const json = await res.json()
    if (json?.ts !== payload.ts) return { ok: false, reason: 'Blob round-trip payload mismatch' }
    return { ok: true }
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : 'Blob smoke failed' }
  }
}

/** Legacy R768 prefix — read-only compatibility note, not active source. */
export const LEGACY_INDEXER_BLOB_PREFIX = LEGACY_BLOB_PREFIX
