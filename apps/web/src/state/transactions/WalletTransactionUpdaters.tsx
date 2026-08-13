import { useActiveChainId } from 'hooks/useActiveChainId'
import TransactionUpdater from './updater'
import TreasuryHandoffUpdater from './treasuryHandoffUpdater'

/**
 * Wallet-only background work. A connected wallet previously mounted two
 * polling trees for every configured chain. Apart from wasting RPC capacity,
 * that could monopolise the main thread exactly while a user clicked the
 * header. Only the active chain can produce a wallet transaction, so keep one
 * watcher pair and remount it after a real network change.
 */
const WalletTransactionUpdaters = () => {
  const { chainId } = useActiveChainId()
  if (!chainId) return null
  return (
    <>
      <TransactionUpdater key={`tx-${chainId}`} chainId={chainId} />
      <TreasuryHandoffUpdater key={`treasury-${chainId}`} chainId={chainId} />
    </>
  )
}

export default WalletTransactionUpdaters
