import fs from 'fs'
import path from 'path'
import type { IndexerCheckpoint, IndexerHealthSnapshot, NormalizedIndexerEvent, OhlcvCandle } from '../types'
import type { IndexerStorage } from './types'

const DEFAULT_DIR = path.join(process.cwd(), 'data', 'bsc-indexer')

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true })
}

function readJson<T>(file: string): T | null {
  if (!fs.existsSync(file)) return null
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as T
  } catch {
    return null
  }
}

function writeJson(file: string, data: unknown) {
  ensureDir(path.dirname(file))
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

export function createJsonFileStorage(rootDir = process.env.BSC_INDEXER_DATA_DIR || DEFAULT_DIR): IndexerStorage {
  const eventsFile = path.join(rootDir, 'events.json')
  const checkpointFile = path.join(rootDir, 'checkpoint.json')
  const healthFile = path.join(rootDir, 'health.json')
  const candlesDir = path.join(rootDir, 'candles')

  const configured = Boolean(rootDir)

  return {
    backend: 'json-filesystem',
    configured,
    async loadCheckpoint() {
      return readJson<IndexerCheckpoint>(checkpointFile)
    },
    async saveCheckpoint(checkpoint) {
      writeJson(checkpointFile, checkpoint)
    },
    async loadHealth() {
      return readJson<IndexerHealthSnapshot>(healthFile)
    },
    async saveHealth(health) {
      writeJson(healthFile, health)
    },
    async appendEvents(events) {
      const existing = readJson<NormalizedIndexerEvent[]>(eventsFile) ?? []
      const seen = new Set(existing.map((e) => `${e.txHash}:${e.logIndex}`))
      const added = events.filter((e) => {
        const key = `${e.txHash}:${e.logIndex}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      if (added.length) writeJson(eventsFile, [...existing, ...added])
      return added.length
    },
    async listEvents(query) {
      const all = readJson<NormalizedIndexerEvent[]>(eventsFile) ?? []
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
      const all = readJson<NormalizedIndexerEvent[]>(eventsFile) ?? []
      const counts: Record<string, number> = {}
      for (const e of all) counts[e.eventType] = (counts[e.eventType] ?? 0) + 1
      return counts
    },
    async saveCandles(candles) {
      ensureDir(candlesDir)
      const byKey = new Map<string, OhlcvCandle[]>()
      for (const c of candles) {
        const key = `${c.pairAddress.toLowerCase()}-${c.interval}.json`
        if (!byKey.has(key)) {
          const file = path.join(candlesDir, key)
          byKey.set(key, readJson<OhlcvCandle[]>(file) ?? [])
        }
        byKey.get(key)!.push(c)
      }
      for (const [key, batch] of byKey) {
        const file = path.join(candlesDir, key)
        const existing = readJson<OhlcvCandle[]>(file) ?? []
        const map = new Map(existing.map((c) => [c.bucketTimestamp, c]))
        for (const c of batch) map.set(c.bucketTimestamp, c)
        writeJson(file, [...map.values()].sort((a, b) => a.bucketTimestamp - b.bucketTimestamp))
      }
    },
    async listCandles(pairAddress, interval, limit = 200) {
      const file = path.join(candlesDir, `${pairAddress.toLowerCase()}-${interval}.json`)
      const rows = readJson<OhlcvCandle[]>(file) ?? []
      return rows.slice(-limit)
    },
  }
}
