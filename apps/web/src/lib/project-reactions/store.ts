import { del, list, put } from '@vercel/blob'
import {
  PROJECT_REACTION_IDS,
  type ProjectReactionCounts,
  type ProjectReactionId,
} from './contract'

export interface ProjectReactionSnapshot {
  slug: string
  counts: ProjectReactionCounts
  selected: ProjectReactionId[]
  durable: boolean
  updatedAt: string
}

const MEMORY = new Set<string>()
const PREFIX = 'project-reactions/v1'

function blobToken(): string | null {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || null
}

function normalizedSlug(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
}

function normalizedAccount(value: string): string {
  return value.trim().toLowerCase()
}

function reactionKey(slug: string, reaction: ProjectReactionId, account: string): string {
  return `${PREFIX}/${normalizedSlug(slug)}/${reaction}/${normalizedAccount(account)}.json`
}

function emptyCounts(): ProjectReactionCounts {
  return { like: 0, watching: 0, bullish: 0, bearish: 0, moon: 0 }
}

function parseReaction(pathname: string, slug: string): ProjectReactionId | null {
  const prefix = `${PREFIX}/${normalizedSlug(slug)}/`
  if (!pathname.startsWith(prefix)) return null
  const id = pathname.slice(prefix.length).split('/')[0]
  return PROJECT_REACTION_IDS.includes(id as ProjectReactionId) ? (id as ProjectReactionId) : null
}

async function listDurableKeys(slug: string, token: string): Promise<string[]> {
  const pathnames: string[] = []
  let cursor: string | undefined
  do {
    const page = await list({ prefix: `${PREFIX}/${normalizedSlug(slug)}/`, limit: 1_000, cursor, token })
    pathnames.push(...page.blobs.map((blob) => blob.pathname))
    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor)
  return pathnames
}

export async function loadProjectReactionSnapshot(
  slug: string,
  account?: string | null,
): Promise<ProjectReactionSnapshot> {
  const token = blobToken()
  const pathnames = token
    ? await listDurableKeys(slug, token)
    : [...MEMORY].filter((key) => key.startsWith(`${PREFIX}/${normalizedSlug(slug)}/`))
  const counts = emptyCounts()
  for (const pathname of pathnames) {
    const reaction = parseReaction(pathname, slug)
    if (reaction) counts[reaction] += 1
  }
  const selected = account
    ? PROJECT_REACTION_IDS.filter((reaction) => pathnames.includes(reactionKey(slug, reaction, account)))
    : []
  return {
    slug: normalizedSlug(slug),
    counts,
    selected,
    durable: Boolean(token),
    updatedAt: new Date().toISOString(),
  }
}

export async function setProjectReaction(input: {
  slug: string
  account: string
  reaction: ProjectReactionId
  active: boolean
}): Promise<ProjectReactionSnapshot> {
  const key = reactionKey(input.slug, input.reaction, input.account)
  const token = blobToken()
  if (token) {
    if (input.active) {
      await put(
        key,
        JSON.stringify({
          schema: 'melega.project-reaction.v1',
          slug: normalizedSlug(input.slug),
          account: normalizedAccount(input.account),
          reaction: input.reaction,
          createdAt: new Date().toISOString(),
        }),
        {
          access: 'private',
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: 'application/json',
          token,
        },
      )
    } else {
      await del(key, { token })
    }
  } else {
    if (process.env.NODE_ENV === 'production') throw new Error('DURABLE_REACTION_STORAGE_UNAVAILABLE')
    if (input.active) MEMORY.add(key)
    else MEMORY.delete(key)
  }
  return loadProjectReactionSnapshot(input.slug, input.account)
}

export function clearProjectReactionsForTests() {
  MEMORY.clear()
}
