import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import MulticallUpdater from 'state/multicall/updater'
import { resolveRuntimeProfile } from 'app-runtime/runtimeProfile'

const ListsUpdater = dynamic(() => import('state/lists/updater'), { ssr: false })
const WalletTransactionUpdaters = dynamic(() => import('state/transactions/WalletTransactionUpdaters'), {
  ssr: false,
})

export default function GlobalUpdaters() {
  const { address } = useAccount()
  const router = useRouter()
  const profile = resolveRuntimeProfile(router.pathname)

  // Testnet constitutional/activation code must never be imported by every
  // public page. Testnet screens own that runtime locally.
  if (profile === 'static') return null

  return (
    <>
      {profile === 'transactional' ? <ListsUpdater /> : null}
      {profile === 'transactional' && address ? <WalletTransactionUpdaters /> : null}
      <MulticallUpdater />
    </>
  )
}
