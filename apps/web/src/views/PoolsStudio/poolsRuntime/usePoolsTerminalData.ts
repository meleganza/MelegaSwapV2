import { useMemo } from 'react'
import orderBy from 'lodash/orderBy'
import { useAccount } from 'wagmi'
import { useAllTransactions } from 'state/transactions/hooks'
import { useActiveChainId } from 'hooks/useActiveChainId'
import type { PoolsActivityRow } from '../poolsStudioData'
import { getPoolDisplayName } from './formatPoolsRuntime'

const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor(Date.now() / 1000 - timestamp)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const inferAction = (summary: string): { action: string; tone: PoolsActivityRow['actionTone'] } => {
  const s = summary.toLowerCase()
  if (s.includes('harvest') || s.includes('claim')) return { action: 'Claim', tone: 'gold' }
  if (s.includes('unstake') || s.includes('withdraw')) return { action: 'Unstake', tone: 'muted' }
  if (s.includes('stake') || s.includes('deposit')) return { action: 'Stake', tone: 'green' }
  if (s.includes('compound')) return { action: 'Compound', tone: 'green' }
  return { action: 'Pool Tx', tone: 'muted' }
}

export const usePoolsTerminalData = () => {
  const { address: account } = useAccount()
  const { chainId } = useActiveChainId()
  const allTransactions = useAllTransactions()

  const activityRows = useMemo((): PoolsActivityRow[] => {
    if (!account || !chainId) return []
    const chainTxs = allTransactions[chainId] ?? {}
    const rows = Object.values(chainTxs)
      .filter((tx) => {
        const summary = (tx.summary || '').toLowerCase()
        return (
          summary.includes('stake') ||
          summary.includes('unstake') ||
          summary.includes('harvest') ||
          summary.includes('claim') ||
          summary.includes('compound') ||
          summary.includes('marco')
        )
      })
      .slice(0, 12)
      .map((tx) => {
        const { action, tone } = inferAction(tx.summary || '')
        return {
          time: formatTimeAgo(tx.addedTime),
          pool: tx.summary?.split(' ').slice(0, 3).join(' ') || 'Pool',
          action,
          amount: tx.summary || '—',
          reward: action === 'Claim' ? tx.summary || '—' : '—',
          status: tx.receipt ? 'completed' : tx.confirmedTime ? 'completed' : 'pending',
          actionTone: tone,
          hash: tx.hash,
        } as PoolsActivityRow
      })
    return rows
  }, [account, chainId, allTransactions])

  return { activityRows, isIndexing: false }
}

export default usePoolsTerminalData
