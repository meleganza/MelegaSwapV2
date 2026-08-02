/**
 * Durable LB program inventory store (JSON filesystem + optional Vercel Blob).
 */
import fs from 'fs'
import path from 'path'
import type { LbIndexedEvent, LbIndexedProgram, LbProgramInventoryDocument } from './types'
import { LB_INDEXER_CHAIN_ID, LB_INVENTORY_SCHEMA } from './types'
import { rebuildProgramsFromEvents } from './parseEvents'

const BLOB_KEY = 'melega-indexer/v2/liquidity-building/inventory.json'

function defaultDir(): string {
  return (
    process.env.LB_PROGRAM_INDEXER_DATA_DIR?.trim() ||
    path.join(process.cwd(), 'data', 'liquidity-builder-indexer')
  )
}

function emptyDoc(): LbProgramInventoryDocument {
  return {
    schema: LB_INVENTORY_SCHEMA,
    chainId: LB_INDEXER_CHAIN_ID,
    updatedAt: new Date(0).toISOString(),
    programs: [],
    events: [],
    cursor: {
      factoryLastScannedBlock: null,
      feeLastScannedBlock: null,
      programsLastScannedBlock: null,
    },
  }
}

export type LbProgramStore = {
  backend: 'memory' | 'json-filesystem' | 'vercel-blob'
  load(): Promise<LbProgramInventoryDocument>
  save(doc: LbProgramInventoryDocument): Promise<void>
  ingestEvents(events: LbIndexedEvent[]): Promise<{ added: number; programs: LbIndexedProgram[] }>
}

function dedupeKey(e: LbIndexedEvent): string {
  return `${e.chainId}:${e.transactionHash}:${e.logIndex}`
}

async function mergeEvents(
  doc: LbProgramInventoryDocument,
  incoming: LbIndexedEvent[],
): Promise<{ doc: LbProgramInventoryDocument; added: number }> {
  const seen = new Set(doc.events.map(dedupeKey))
  const addedEvents = incoming.filter((e) => {
    const k = dedupeKey(e)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
  if (!addedEvents.length) return { doc, added: 0 }
  const events = [...doc.events, ...addedEvents]
  const programs = rebuildProgramsFromEvents(events)
  return {
    added: addedEvents.length,
    doc: {
      ...doc,
      events,
      programs,
      updatedAt: new Date().toISOString(),
    },
  }
}

export function createMemoryLbProgramStore(seed?: LbProgramInventoryDocument): LbProgramStore {
  let doc = seed ?? emptyDoc()
  return {
    backend: 'memory',
    async load() {
      return doc
    },
    async save(next) {
      doc = next
    },
    async ingestEvents(events) {
      const { doc: next, added } = await mergeEvents(doc, events)
      doc = next
      return { added, programs: next.programs }
    },
  }
}

export function createJsonLbProgramStore(rootDir = defaultDir()): LbProgramStore {
  const file = path.join(rootDir, 'inventory.json')
  return {
    backend: 'json-filesystem',
    async load() {
      if (!fs.existsSync(file)) return emptyDoc()
      try {
        return JSON.parse(fs.readFileSync(file, 'utf8')) as LbProgramInventoryDocument
      } catch {
        return emptyDoc()
      }
    },
    async save(doc) {
      fs.mkdirSync(path.dirname(file), { recursive: true })
      fs.writeFileSync(file, JSON.stringify(doc, null, 2))
    },
    async ingestEvents(events) {
      const current = await this.load()
      const { doc, added } = await mergeEvents(current, events)
      await this.save(doc)
      return { added, programs: doc.programs }
    },
  }
}

export function createBlobLbProgramStore(): LbProgramStore | null {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim()
  if (!token) return null
  // Lazy require to keep unit tests light when @vercel/blob unused
  return {
    backend: 'vercel-blob',
    async load() {
      try {
        const { head } = await import('@vercel/blob')
        const meta = await head(BLOB_KEY, { token })
        const res = await fetch(meta.url, { headers: { authorization: `Bearer ${token}` } })
        if (!res.ok) return emptyDoc()
        return (await res.json()) as LbProgramInventoryDocument
      } catch {
        return emptyDoc()
      }
    },
    async save(doc) {
      const { put } = await import('@vercel/blob')
      await put(BLOB_KEY, JSON.stringify(doc), {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
        token,
      })
    },
    async ingestEvents(events) {
      const current = await this.load()
      const { doc, added } = await mergeEvents(current, events)
      await this.save(doc)
      return { added, programs: doc.programs }
    },
  }
}

let testStoreOverride: LbProgramStore | null = null

/** Test-only store injection — never used in production paths. */
export function setLbProgramStoreForTests(store: LbProgramStore | null) {
  testStoreOverride = store
}

/** Prefer blob in production when configured; else JSON filesystem. */
export function resolveLbProgramStore(): LbProgramStore {
  if (testStoreOverride) return testStoreOverride
  return createBlobLbProgramStore() ?? createJsonLbProgramStore()
}
