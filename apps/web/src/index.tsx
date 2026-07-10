import { Fragment, ReactNode, useEffect, useMemo } from 'react'
import { useAccount } from 'wagmi'
import { ensureKrmpTestnetOperationalActivation } from 'lib/kerl-constitutional'
import { BLOCKED_ADDRESSES } from './config/constants'
import ListsUpdater from './state/lists/updater'
import MulticallUpdater from './state/multicall/updater'
import TransactionUpdater from './state/transactions/updater'
import TreasuryHandoffUpdater from './state/transactions/treasuryHandoffUpdater'
import { chains } from './utils/wagmi'

export function Updaters() {
  useEffect(() => {
    ensureKrmpTestnetOperationalActivation()
  }, [])

  return (
    <>
      <ListsUpdater />
      {chains.map((chain) => (
        <Fragment key={chain.id}>
          <TransactionUpdater chainId={chain.id} />
          <TreasuryHandoffUpdater chainId={chain.id} />
        </Fragment>
      ))}
      <MulticallUpdater />
    </>
  )
}

export function Blocklist({ children }: { children: ReactNode }) {
  const { address: account } = useAccount()
  const blocked: boolean = useMemo(() => Boolean(account && BLOCKED_ADDRESSES.indexOf(account) !== -1), [account])
  if (blocked) {
    return <div>Blocked address</div>
  }
  return <>{children}</>
}
