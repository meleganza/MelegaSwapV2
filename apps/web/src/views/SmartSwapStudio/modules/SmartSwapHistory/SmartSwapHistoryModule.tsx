import styled from 'styled-components'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { getBlockExploreLink } from 'utils'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { SmartSwapHistoryPanel } from './SmartSwapHistoryPanel'
import { useSmartSwapHistory } from './useSmartSwapHistory'

const ConnectWrap = styled.div`
  margin-top: 8px;
  button {
    width: 100% !important;
    height: 44px !important;
    border-radius: 12px !important;
  }
`

/**
 * Module 005 mount — History tab Smart Swap experience.
 * Does not modify SmartSwapForm.
 */
export function SmartSwapHistoryModule() {
  const { chainId } = useActiveChainId()
  const { page, account, setPage, refresh } = useSmartSwapHistory()

  return (
    <SmartSwapHistoryPanel
      page={page}
      account={account}
      getExplorerUrl={(hash) => (chainId ? getBlockExploreLink(hash, 'transaction', chainId) : undefined)}
      onPageChange={(n) => {
        setPage(n)
        refresh()
      }}
      connectSlot={
        <ConnectWrap>
          <ConnectWalletButton>Connect wallet for your Smart Swap history</ConnectWalletButton>
        </ConnectWrap>
      }
    />
  )
}
