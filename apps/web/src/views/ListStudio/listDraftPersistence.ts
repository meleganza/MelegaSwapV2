import type { ListIntent } from './listTokens'

export type ListDraftRecord = {
  schema: 'melega.list-draft.v1'
  wallet: string | null
  chainId: number
  intent: ListIntent
  projectKey: string | null
  values: Record<string, string>
  featuredOrderId: string | null
  updatedAt: string
}

function storageKey(input: { intent: ListIntent; wallet: string | null; chainId: number }): string {
  const w = (input.wallet || 'guest').toLowerCase()
  return `melega.list.draft.v1:${input.chainId}:${w}:${input.intent}`
}

export function loadListDraft(input: {
  intent: ListIntent
  wallet: string | null
  chainId: number
  projectKey?: string | null
}): ListDraftRecord | null {
  const storage = typeof window !== 'undefined' ? window.localStorage : undefined
  if (!storage?.getItem) return null
  try {
    const raw = storage.getItem(storageKey(input))
    if (!raw) return null
    const parsed = JSON.parse(raw) as ListDraftRecord
    if (!parsed || parsed.schema !== 'melega.list-draft.v1' || typeof parsed.values !== 'object' || !parsed.values) {
      return null
    }
    if (parsed.intent !== input.intent) return null
    if ((parsed.wallet || 'guest').toLowerCase() !== (input.wallet || 'guest').toLowerCase()) return null
    if (parsed.chainId !== input.chainId) return null
    return parsed
  } catch {
    return null
  }
}

export function saveListDraft(record: Omit<ListDraftRecord, 'schema' | 'updatedAt'>): ListDraftRecord {
  const full: ListDraftRecord = {
    ...record,
    schema: 'melega.list-draft.v1',
    updatedAt: new Date().toISOString(),
  }
  const storage = typeof window !== 'undefined' ? window.localStorage : undefined
  if (storage?.setItem) {
    try {
      storage.setItem(
        storageKey({
          intent: full.intent,
          wallet: full.wallet,
          chainId: full.chainId,
        }),
        JSON.stringify(full),
      )
    } catch {
      // Draft persistence is best-effort and must never crash the listing flow.
    }
  }
  return full
}

export function deleteListDraft(input: {
  intent: ListIntent
  wallet: string | null
  chainId: number
  projectKey?: string | null
}): void {
  const storage = typeof window !== 'undefined' ? window.localStorage : undefined
  try {
    storage?.removeItem?.(storageKey(input))
  } catch {
    // Storage may be blocked by privacy settings; closing the flow must still work.
  }
}
