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
  height: 48px;
  margin-bottom: 0;

  @media (min-width: 1024px) {
    display: none;
  }
`

const NetworkWrap = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  min-width: 0;

  button {
    height: 38px !important;
    max-width: 150px;
    border-radius: 10px !important;
    background: ${ht.sidebarBg} !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    font-size: 12px !important;
  }
`

const WalletSquare = styled(ConnectWalletButton)`
  width: 42px !important;
  height: 42px !important;
  min-width: 42px !important;
  max-width: 42px !important;
  padding: 0 !important;
  border-radius: 10px;
  border: 1px solid ${ht.gold};
  background: ${ht.goldSoftBg};
  color: ${ht.gold};
  font-size: 0 !important;
  overflow: hidden;

  & > span,
  & > div {
    font-size: 0 !important;
    line-height: 0 !important;
    color: transparent !important;
  }
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
    <Header data-home-mobile-header="true">
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
