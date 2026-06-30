import React from 'react'
import styled from 'styled-components'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { NetworkSwitcher } from 'components/NetworkSwitcher'
import GlobalSettings from 'components/Menu/GlobalSettings'
import { SettingsMode } from 'components/Menu/GlobalSettings/types'
import { ht } from './homeTradeTokens'

const Bar = styled.header`
  display: none;
  position: sticky;
  top: 0;
  z-index: 50;
  height: 64px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: ${ht.canvas};
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  margin: -20px -28px 14px;
  padding: 0 28px;

  @media (min-width: 1024px) {
    display: flex;
  }
`

const Search = styled.div`
  width: 520px;
  height: 42px;
  background: ${ht.surface1};
  border: 1px solid ${ht.borderMedium};
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  gap: 10px;
  cursor: text;
`

const SearchIcon = styled.span`
  color: ${ht.textMuted};
  font-size: 16px;
`

const SearchPlaceholder = styled.span`
  flex: 1;
  font-family: ${ht.fontBody};
  font-size: 14px;
  color: ${ht.textMuted};
`

const Kbd = styled.span`
  font-family: ${ht.fontBody};
  font-size: 12px;
  color: ${ht.textSoft};
  border: 1px solid ${ht.borderMedium};
  border-radius: 6px;
  padding: 2px 8px;
`

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
`

const NetworkWrap = styled.div`
  min-width: 180px;

  button,
  [role='button'] {
    height: 42px !important;
    border-radius: 10px !important;
    background: ${ht.surface1} !important;
    border: 1px solid ${ht.borderMedium} !important;
    font-size: 14px !important;
  }
`

const WalletBtn = styled(ConnectWalletButton)`
  width: 146px;
  height: 42px;
  border-radius: 10px;
  background: ${ht.gold};
  color: #000000;
  font-weight: 700;
  font-size: 14px;
`

const SettingsWrap = styled.div`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const HomeTopBar: React.FC = () => (
  <Bar>
    <Search role="search" aria-label="Search">
      <SearchIcon>⌕</SearchIcon>
      <SearchPlaceholder>Search tokens, farms, projects...</SearchPlaceholder>
      <Kbd>⌘K</Kbd>
    </Search>
    <Right>
      <NetworkWrap>
        <NetworkSwitcher />
      </NetworkWrap>
      <WalletBtn />
      <SettingsWrap>
        <GlobalSettings mode={SettingsMode.GLOBAL} />
      </SettingsWrap>
    </Right>
  </Bar>
)

export default HomeTopBar
