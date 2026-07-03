import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useDNFTContract } from 'hooks/useContract'
import { getAllCollectibles } from 'registry/collectibles/getAllCollectibles'
import type { StaticCollectibleRecord } from 'registry/collectibles/collectible-types'
import { getDNFTAddress } from 'utils/addressHelpers'

export type OwnershipDisplayStatus =
  | 'Owned'
  | 'Not owned'
  | 'Delegated'
  | 'Expired'
  | 'Locked'
  | 'Burned'
  | 'Unavailable'

export interface WalletCollectibleOwnership {
  slug: string
  balance: number
  status: OwnershipDisplayStatus
  transferable: boolean | null
  tokenIds: string[]
}

export function useWalletCollectibleOwnership() {
  const { address: account } = useAccount()
  const { chainId } = useActiveChainId()
  const contract = useDNFTContract(getDNFTAddress(), false)
  const [ownershipBySlug, setOwnershipBySlug] = useState<Record<string, WalletCollectibleOwnership>>({})
  const [loading, setLoading] = useState(false)

  const indexedRecords = useMemo(() => getAllCollectibles(), [])

  const loadOwnership = useCallback(async () => {
    const next: Record<string, WalletCollectibleOwnership> = {}

    for (const record of indexedRecords) {
      if (!record.contract.indexed || !record.contract.address) {
        next[record.slug] = {
          slug: record.slug,
          balance: 0,
          status: record.status === 'planned' ? 'Unavailable' : 'Not owned',
          transferable: null,
          tokenIds: [],
        }
        continue
      }

      if (!account || !contract) {
        next[record.slug] = {
          slug: record.slug,
          balance: 0,
          status: 'Not owned',
          transferable: true,
          tokenIds: [],
        }
        continue
      }

      try {
        const ids = await contract.walletOfOwner(account)
        const tokenIds = (ids ?? []).map((id: { toString: () => string }) => id.toString())
        const balance = tokenIds.length
        next[record.slug] = {
          slug: record.slug,
          balance,
          status: balance > 0 ? 'Owned' : 'Not owned',
          transferable: true,
          tokenIds,
        }
      } catch {
        next[record.slug] = {
          slug: record.slug,
          balance: 0,
          status: 'Unavailable',
          transferable: null,
          tokenIds: [],
        }
      }
    }

    setOwnershipBySlug(next)
  }, [account, contract, indexedRecords])

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      await loadOwnership()
      if (!cancelled) setLoading(false)
    }
    run()
    return () => {
      cancelled = true
    }
  }, [loadOwnership, chainId])

  const totalOwned = useMemo(
    () => Object.values(ownershipBySlug).reduce((sum, o) => sum + o.balance, 0),
    [ownershipBySlug],
  )

  return {
    account,
    chainId,
    ownershipBySlug,
    totalOwned,
    loading,
    records: indexedRecords,
    getOwnership: (slug: string) => ownershipBySlug[slug],
  }
}

export function resolveOwnershipForRecord(
  record: StaticCollectibleRecord,
  ownership?: WalletCollectibleOwnership,
  account?: string,
): WalletCollectibleOwnership {
  if (ownership) return ownership
  if (!account) {
    return {
      slug: record.slug,
      balance: 0,
      status: 'Not owned',
      transferable: record.contract.indexed ? true : null,
      tokenIds: [],
    }
  }
  return {
    slug: record.slug,
    balance: 0,
    status: record.contract.indexed ? 'Not owned' : 'Unavailable',
    transferable: record.contract.indexed ? true : null,
    tokenIds: [],
  }
}
