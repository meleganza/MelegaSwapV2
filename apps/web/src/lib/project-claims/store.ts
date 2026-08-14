import { head, list, put } from '@vercel/blob'
import fs from 'fs'
import path from 'path'
import type { ProjectClaimRecord } from './types'

const BY_CONTRACT = new Map<string, ProjectClaimRecord>()
const BY_SLUG = new Map<string, ProjectClaimRecord>()

function dataDir(): string {
  return process.env.PROJECT_CLAIMS_DIR || path.join(process.cwd(), 'data', 'project-claims')
}

function contractKey(chainId: number, contract: string): string {
  return `${chainId}:${contract.toLowerCase()}`
}

function blobToken(): string | null {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || null
}

function slugBlobKey(slug: string): string {
  return `project-claims/v1/by-slug/${slug.toLowerCase()}.json`
}

function contractBlobKey(chainId: number, contract: string): string {
  return `project-claims/v1/by-contract/${chainId}/${contract.toLowerCase()}.json`
}

function hydrate(record: ProjectClaimRecord | null): ProjectClaimRecord | null {
  if (!record || record.schema !== 'melega.project-claim.v1') return null
  BY_CONTRACT.set(contractKey(record.chainId, record.contract), record)
  BY_SLUG.set(record.slug.toLowerCase(), record)
  return record
}

function readDisk(file: string): ProjectClaimRecord | null {
  try {
    return hydrate(JSON.parse(fs.readFileSync(file, 'utf8')) as ProjectClaimRecord)
  } catch {
    return null
  }
}

async function readBlob(key: string): Promise<ProjectClaimRecord | null> {
  const token = blobToken()
  if (!token) return null
  try {
    const meta = await head(key, { token })
    const response = await fetch(meta.url, { headers: { authorization: `Bearer ${token}` } })
    if (!response.ok) return null
    return hydrate((await response.json()) as ProjectClaimRecord)
  } catch {
    return null
  }
}

export async function getProjectClaimByContract(chainId: number, contract: string): Promise<ProjectClaimRecord | null> {
  const key = contractKey(chainId, contract)
  if (BY_CONTRACT.has(key)) return BY_CONTRACT.get(key)!
  const durable = await readBlob(contractBlobKey(chainId, contract))
  if (durable) return durable
  try {
    const names = fs.readdirSync(dataDir())
    for (const name of names) {
      const record = readDisk(path.join(dataDir(), name))
      if (record && contractKey(record.chainId, record.contract) === key) return record
    }
  } catch {
    // Empty local development store.
  }
  return null
}

export async function getProjectClaimBySlug(slug: string): Promise<ProjectClaimRecord | null> {
  const normalized = slug.toLowerCase()
  if (BY_SLUG.has(normalized)) return BY_SLUG.get(normalized)!
  const durable = await readBlob(slugBlobKey(normalized))
  if (durable) return durable
  return readDisk(path.join(dataDir(), `${normalized}.json`))
}

export async function listProjectClaims(): Promise<ProjectClaimRecord[]> {
  const token = blobToken()
  if (token) {
    try {
      const page = await list({ prefix: 'project-claims/v1/by-slug/', limit: 1_000, token })
      const records = await Promise.all(
        page.blobs.map(async (blob) => {
          try {
            const response = await fetch(blob.url, { headers: { authorization: `Bearer ${token}` } })
            if (!response.ok) return null
            return hydrate((await response.json()) as ProjectClaimRecord)
          } catch {
            return null
          }
        }),
      )
      return records.filter((record): record is ProjectClaimRecord => Boolean(record))
    } catch {
      return []
    }
  }

  try {
    return fs
      .readdirSync(dataDir())
      .map((name) => readDisk(path.join(dataDir(), name)))
      .filter((record): record is ProjectClaimRecord => Boolean(record))
  } catch {
    return []
  }
}

export async function persistProjectClaim(record: ProjectClaimRecord): Promise<ProjectClaimRecord> {
  const existingSlug = await getProjectClaimBySlug(record.slug)
  if (
    existingSlug &&
    contractKey(existingSlug.chainId, existingSlug.contract) !== contractKey(record.chainId, record.contract)
  ) {
    throw new Error('HANDLE_ALREADY_CLAIMED')
  }

  const token = blobToken()
  if (token) {
    const payload = JSON.stringify(record)
    await Promise.all([
      put(slugBlobKey(record.slug), payload, {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
        token,
      }),
      put(contractBlobKey(record.chainId, record.contract), payload, {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
        token,
      }),
    ])
  } else {
    if (process.env.NODE_ENV === 'production') throw new Error('DURABLE_PROJECT_CLAIMS_STORAGE_UNAVAILABLE')
    fs.mkdirSync(dataDir(), { recursive: true })
    fs.writeFileSync(path.join(dataDir(), `${record.slug}.json`), JSON.stringify(record, null, 2), 'utf8')
  }
  hydrate(record)
  return record
}
