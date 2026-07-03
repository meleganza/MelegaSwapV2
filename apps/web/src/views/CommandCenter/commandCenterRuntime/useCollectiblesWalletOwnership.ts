import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useDNFTContract } from 'hooks/useContract'
import { getDNFTAddress } from 'utils/addressHelpers'

export function useCollectiblesWalletOwnership() {
  const { address: account } = useAccount()
  const { chainId } = useActiveChainId()
  const contract = useDNFTContract(getDNFTAddress(), false)
  const [ownedCount, setOwnedCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!account || !contract) {
        setOwnedCount(0)
        return
      }
      setLoading(true)
      try {
        const ids = await contract.walletOfOwner(account)
        if (!cancelled) setOwnedCount(ids?.length ?? 0)
      } catch {
        if (!cancelled) setOwnedCount(0)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [account, contract, chainId])

  return { ownedCount, loading, account }
}
