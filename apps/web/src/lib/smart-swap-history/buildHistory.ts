import { normalizeSmartSwapHistoryEntries, type SmartSwapHistoryTxSnapshot } from './normalizeEntry'
import { paginateSmartSwapHistory, SMART_SWAP_HISTORY_DEFAULT_PAGE_SIZE } from './paginate'
import type { SmartSwapHistoryPage } from './types'

export function buildSmartSwapHistory(input: {
  transactions: SmartSwapHistoryTxSnapshot[]
  account?: string | null
  page?: number
  pageSize?: number
}): SmartSwapHistoryPage {
  if (!input.account) {
    return paginateSmartSwapHistory([], input.page ?? 1, input.pageSize ?? SMART_SWAP_HISTORY_DEFAULT_PAGE_SIZE, 'Wallet required')
  }
  const entries = normalizeSmartSwapHistoryEntries(input.transactions, input.account)
  return paginateSmartSwapHistory(
    entries,
    input.page ?? 1,
    input.pageSize ?? SMART_SWAP_HISTORY_DEFAULT_PAGE_SIZE,
    'No Smart Swap history for this wallet yet.',
  )
}
