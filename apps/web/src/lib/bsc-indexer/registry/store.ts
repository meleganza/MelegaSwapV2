import { head, put } from '@vercel/blob'
import fs from 'fs'
import path from 'path'
import type { OnchainRegistry } from 'lib/onchain-registry'
import { registryBlobKey, registryMetaKey } from '../v2/paths'
import type { RegistryRefreshMeta } from './refreshOnChainRegistry'

const DISK_REGISTRY = path.join(process.cwd(), 'public', 'registry', 'onchain', 'bsc-mainnet.json')

let memoryRegistry: OnchainRegistry | null = null
let memoryMeta: RegistryRefreshMeta | null = null

function blobToken(): string | undefined {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim()
}

async function readBlobJson<T>(key: string): Promise<T | null> {
  const token = blobToken()
  if (!token) return null
  try {
    const meta = await head(key, { token })
    const res = await fetch(meta.url, { headers: { authorization: `Bearer ${token}` } })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

async function writeBlobJson(key: string, data: unknown): Promise<void> {
  const token = blobToken()
  if (!token) throw new Error('BLOB_READ_WRITE_TOKEN missing for registry persistence')
  await put(key, JSON.stringify(data), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    token,
  })
}

export function loadRegistryFromDisk(): OnchainRegistry | null {
  try {
    if (!fs.existsSync(DISK_REGISTRY)) return null
    return JSON.parse(fs.readFileSync(DISK_REGISTRY, 'utf8')) as OnchainRegistry
  } catch {
    return null
  }
}

export async function loadRegistryFromBlob(): Promise<OnchainRegistry | null> {
  if (memoryRegistry) return memoryRegistry
  const fromBlob = await readBlobJson<OnchainRegistry>(registryBlobKey())
  if (fromBlob) memoryRegistry = fromBlob
  return fromBlob
}

export async function loadRegistryMeta(): Promise<RegistryRefreshMeta | null> {
  if (memoryMeta) return memoryMeta
  const meta = await readBlobJson<RegistryRefreshMeta>(registryMetaKey())
  if (meta) memoryMeta = meta
  return meta
}

export async function resolveOnchainRegistry(): Promise<{
  registry: OnchainRegistry | null
  source: 'blob' | 'disk' | 'none'
  meta?: RegistryRefreshMeta | null
}> {
  const [fromBlob, meta] = await Promise.all([loadRegistryFromBlob(), loadRegistryMeta()])
  if (fromBlob) return { registry: fromBlob, source: 'blob', meta }
  const fromDisk = loadRegistryFromDisk()
  if (fromDisk) return { registry: fromDisk, source: 'disk', meta }
  return { registry: null, source: 'none', meta }
}

export async function persistRegistry(registry: OnchainRegistry, meta: RegistryRefreshMeta): Promise<void> {
  memoryRegistry = registry
  memoryMeta = meta
  await writeBlobJson(registryBlobKey(), registry)
  await writeBlobJson(registryMetaKey(), meta)
}

export function clearRegistryCache() {
  memoryRegistry = null
  memoryMeta = null
}
