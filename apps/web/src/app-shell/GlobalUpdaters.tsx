import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import MulticallUpdater from 'state/multicall/updater'

const ListsUpdater = dynamic(() => import('state/lists/updater'), { ssr: false })
const WalletTransactionUpdaters = dynamic(() => import('state/transactions/WalletTransactionUpdaters'), {
  ssr: false,
})

export default function GlobalUpdaters() {
  const { address } = useAccount()
  const router = useRouter()

  const path = router.pathname
  const needsOnchainRuntime =
    path === '/' ||
    [
      '/swap',
      '/liquidity',
      '/farms',
      '/pools',
      '/list',
      '/projects',
      '/project-hq',
      '/token',
      '/bridge',
      '/portfolio',
    ].some((prefix) => path === prefix || path.startsWith(`${prefix}/`))

  // Testnet constitutional/activation code must never be imported by every
  // public page. Testnet screens own that runtime locally.
  if (!needsOnchainRuntime) return null

  return (
    <>
      <ListsUpdater />
      {address ? <WalletTransactionUpdaters /> : null}
      <MulticallUpdater />
    </>
  )
}
