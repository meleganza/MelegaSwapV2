import { useMemo } from 'react'
import { useAccount } from 'wagmi'
import { useAllTransactions } from 'state/transactions/hooks'
import { useActiveChainId } from 'hooks/useActiveChainId'
import type { FarmsActivityRow } from '../farmsStudioData'

const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor(Date.now() / 1000 - timestamp)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const inferAction = (summary: string): { action: string; tone: FarmsActivityRow['actionTone'] } => {
  const s = summary.toLowerCase()
  if (s.includes('harvest') || s.includes('claim')) return { action: 'Harvest', tone: 'gold' }
  if (s.includes('unstake') || s.includes('withdraw')) return { action: 'Withdraw', tone: 'muted' }
  if (s.includes('stake') || s.includes('deposit')) return { action: 'Stake', tone: 'green' }
  if (s.includes('compound')) return { action: 'Compound', tone: 'green' }
  return { action: 'Farm Tx', tone: 'muted' }
}

const inferPair = (summary: string): string => {
  const parts = summary.split(' ')
  const lpIdx = parts.findIndex((p) => p.toLowerCase().includes('lp') || p.includes('/'))
  if (lpIdx > 0) return parts.slice(Math.max(0, lpIdx - 2), lpIdx + 1).join(' ')
  return parts.slice(0, 3).join(' ') || 'Farm'
}

export const useFarmsTerminalData = () => {
  const { address: account } = useAccount()
  const { chainId } = useActiveChainId()
  const allTransactions = useAllTransactions()

  const activityRows = useMemo((): FarmsActivityRow[] => {
    if (!account || !chainId) return []
    const chainTxs = allTransactions[chainId] ?? {}
    return Object.values(chainTxs)
      .filter((tx) => {
        const summary = (tx.summary || '').toLowerCase()
        return (
          summary.includes('farm') ||
          summary.includes('stake') ||
          summary.includes('unstake') ||
          summary.includes('harvest') ||
          summary.includes('lp') ||
          summary.includes('marco')
        )
      })
      .slice(0, 12)
      .map((tx) => {
        const { action, tone } = inferAction(tx.summary || '')
        return {
          time: formatTimeAgo(tx.addedTime),
          pair: inferPair(tx.summary || ''),
          action,
          amount: tx.summary || '—',
          rewards: action === 'Harvest' ? tx.summary || '—' : '—',
          status: tx.receipt || tx.confirmedTime ? 'indexed' : 'preview',
          actionTone: tone,
          hash: tx.hash,
        } as FarmsActivityRow
      })
  }, [account, chainId, allTransactions])

  return { activityRows, isIndexing: false }
}

export default useFarmsTerminalData
