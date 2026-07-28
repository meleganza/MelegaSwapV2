import type { SmartSwapHistoryEntry, SmartSwapHistoryPage } from './types'

export const SMART_SWAP_HISTORY_DEFAULT_PAGE_SIZE = 10
export const SMART_SWAP_HISTORY_MAX_ENTRIES = 20

/** Latest-first stable ordering by timestamp then hash. */
export function sortHistoryLatestFirst(entries: SmartSwapHistoryEntry[]): SmartSwapHistoryEntry[] {
  return [...entries].sort((a, b) => {
    const ta = a.timestamp ? Date.parse(a.timestamp) : 0
    const tb = b.timestamp ? Date.parse(b.timestamp) : 0
    if (tb !== ta) return tb - ta
    return a.transactionHash.localeCompare(b.transactionHash)
  })
}

/**
 * Controlled pagination — no infinite uncontrolled loading.
 * Caps at SMART_SWAP_HISTORY_MAX_ENTRIES before paging.
 */
export function paginateSmartSwapHistory(
  entries: SmartSwapHistoryEntry[],
  page = 1,
  pageSize = SMART_SWAP_HISTORY_DEFAULT_PAGE_SIZE,
  emptyReason?: string | null,
): SmartSwapHistoryPage {
  const safePage = Math.max(1, Math.floor(page) || 1)
  const safeSize = Math.min(
    SMART_SWAP_HISTORY_MAX_ENTRIES,
    Math.max(1, Math.floor(pageSize) || SMART_SWAP_HISTORY_DEFAULT_PAGE_SIZE),
  )
  const sorted = sortHistoryLatestFirst(entries).slice(0, SMART_SWAP_HISTORY_MAX_ENTRIES)
  const total = sorted.length
  const start = (safePage - 1) * safeSize
  const pageEntries = sorted.slice(start, start + safeSize)

  if (total === 0) {
    return {
      entries: [],
      total: 0,
      page: safePage,
      pageSize: safeSize,
      hasMore: false,
      listState: emptyReason === 'Wallet required' ? 'UNAVAILABLE' : 'EMPTY',
      emptyReason: emptyReason ?? 'No Smart Swap history for this wallet yet.',
    }
  }

  return {
    entries: pageEntries,
    total,
    page: safePage,
    pageSize: safeSize,
    hasMore: start + safeSize < total,
    listState: 'READY',
    emptyReason: null,
  }
}
