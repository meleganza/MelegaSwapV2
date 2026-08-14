import { useMemo, type ReactNode } from 'react'
import { useAccount } from 'wagmi'
import { BLOCKED_ADDRESSES } from 'config/constants/blockedAddresses'

export default function Blocklist({ children }: { children: ReactNode }) {
  const { address: account } = useAccount()
  const blocked = useMemo(
    () =>
      Boolean(
        account && BLOCKED_ADDRESSES.some((blockedAddress) => blockedAddress.toLowerCase() === account.toLowerCase()),
      ),
    [account],
  )

  if (blocked) {
    return <div>Blocked address</div>
  }

  return <>{children}</>
}
