import React from 'react'
import styled from 'styled-components'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { NetworkSwitcher } from 'components/NetworkSwitcher'
import GlobalSettings from 'components/Menu/GlobalSettings'
import { SettingsMode } from 'components/Menu/GlobalSettings/types'
import { SocialIcons } from './homeTradeShared'
import { ht } from './homeTradeTokens'

const Bar = styled.header`
  display: none;
  position: sticky;
  top: 0;
  z-index: 50;
  height: 48px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: ${ht.canvas};
  margin: -16px -26px 0;
  padding: 0 26px 12px;

  @media (min-width: 1024px) {
    display: flex;
  }
`

const Search = styled.div`
  width: 500px;
  height: 42px;
  background: #080808;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  gap: 10px;
  cursor: text;
  flex-shrink: 0;
  transition: border-color 180ms ease, box-shadow 180ms ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.16);
    box-shadow: 0 0 0 1px rgba(244, 196, 48, 0.05);
  }
`

const SearchIcon = styled.span`
  color: #777777;
  font-size: 16px;
`

const SearchPlaceholder = styled.span`
  flex: 1;
  font-family: ${ht.fontBody};
  font-size: 14px;
  color: ${ht.textPlaceholder};
`

const Kbd = styled.span`
  width: 38px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ${ht.fontBody};
  font-size: 12px;
  color: #777777;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
`

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-left: auto;
`

const NetworkWrap = styled.div`
  min-width: 140px;

  button,
  [role='button'] {
    height: 40px !important;
    padding: 0 16px !important;
    border-radius: 10px !important;
    background: #060606 !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    font-size: 14px !important;
    font-weight: 700 !important;
  }
`

const WalletBtn = styled(ConnectWalletButton)`
  min-width: 136px !important;
  height: 40px !important;
  border-radius: 10px !important;
  background: linear-gradient(180deg, ${ht.goldBright}, ${ht.gold}) !important;
  color: #000000 !important;
  font-weight: 700 !important;
  font-size: 14px !important;
  white-space: nowrap !important;
  padding: 0 20px !important;
  border: none !important;
  transition: filter 180ms ease, transform 180ms ease, box-shadow 180ms ease !important;

  &:hover {
    filter: brightness(1.05) !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 0 16px rgba(244, 196, 48, 0.18) !important;
  }
`

const SettingsWrap = styled.div`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bdbdbd;
  transition: color 180ms ease;

  &:hover {
    color: ${ht.white};
  }
`

export const HomeTopBar: React.FC = () => (
  <Bar>
    <Search role="search" aria-label="Search">
      <SearchIcon>⌕</SearchIcon>
      <SearchPlaceholder>Search tokens, farms, projects...</SearchPlaceholder>
      <Kbd>⌘K</Kbd>
    </Search>
    <Right>
      <SocialIcons compact />
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
