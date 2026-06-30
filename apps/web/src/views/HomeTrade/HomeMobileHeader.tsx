import React from 'react'
import styled from 'styled-components'
import { useAccount } from 'wagmi'
import ConnectWalletButton from 'components/ConnectWalletButton'
import UserMenu from 'components/Menu/UserMenu'
import { NetworkSwitcher } from 'components/NetworkSwitcher'
import { MelegaBrandLockup } from './MelegaBrandLockup'
import { ht } from './homeTradeTokens'

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 56px;
  margin-bottom: 12px;

  @media (min-width: 1024px) {
    display: none;
  }
`

const NetworkWrap = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;

  button {
    height: 38px !important;
    max-width: 170px;
    border-radius: 12px !important;
    background: ${ht.sidebarBg} !important;
    border: 1px solid ${ht.borderMedium} !important;
    font-size: 12px !important;
  }
`

const WalletSquare = styled(ConnectWalletButton)`
  width: 42px;
  height: 42px;
  min-width: 42px;
  padding: 0;
  border-radius: 10px;
  border: 1px solid ${ht.gold};
  background: ${ht.goldSoftBg};
  color: ${ht.gold};
`

const WalletIconBtn = styled.div`
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const HomeMobileHeader: React.FC = () => {
  const { address } = useAccount()

  return (
    <Header>
      <MelegaBrandLockup size="mobile" />
      <NetworkWrap>
        <NetworkSwitcher />
      </NetworkWrap>
      {address ? (
        <WalletIconBtn>
          <UserMenu />
        </WalletIconBtn>
      ) : (
        <WalletSquare aria-label="Connect wallet">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <path d="M17 12h4v4h-4z" />
          </svg>
        </WalletSquare>
      )}
    </Header>
  )
}

export default HomeMobileHeader
