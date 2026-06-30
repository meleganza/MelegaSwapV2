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
  height: 48px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: ${ht.canvas};
  margin: -14px -24px 12px;
  padding: 0 24px;
  grid-column: 1 / -1;

  @media (min-width: 1024px) {
    display: flex;
  }
`

const Search = styled.div`
  width: 500px;
  height: 42px;
  background: ${ht.surface1};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 10px;
  cursor: text;
  flex-shrink: 0;
  transition: border-color 200ms ease, box-shadow 200ms ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.16);
    box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.06);
  }
`

const SearchIcon = styled.span`
  color: ${ht.textMuted};
  font-size: 15px;
`

const SearchPlaceholder = styled.span`
  flex: 1;
  font-family: ${ht.fontBody};
  font-size: 14px;
  color: ${ht.textPlaceholder};
`

const Kbd = styled.span`
  font-family: ${ht.fontBody};
  font-size: 11px;
  color: ${ht.textSoft};
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  padding: 2px 7px;
  background: rgba(255, 255, 255, 0.03);
`

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
`

const NetworkWrap = styled.div`
  min-width: 150px;

  button,
  [role='button'] {
    height: 40px !important;
    border-radius: 10px !important;
    background: ${ht.surface1} !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    font-size: 13px !important;
  }
`

const WalletBtn = styled(ConnectWalletButton)`
  width: auto !important;
  min-width: 130px !important;
  max-width: 150px !important;
  height: 40px !important;
  border-radius: 10px !important;
  background: ${ht.gold} !important;
  color: #000000 !important;
  font-weight: 700 !important;
  font-size: 14px !important;
  white-space: nowrap !important;
  padding: 0 20px !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  transition: filter 150ms ease, box-shadow 150ms ease, transform 100ms ease !important;

  &:hover {
    filter: brightness(1.05) !important;
    box-shadow: 0 0 16px rgba(212, 175, 55, 0.2) !important;
  }

  &:active {
    transform: scale(0.985) !important;
  }
`

const SettingsWrap = styled.div`
  width: 32px;
  height: 32px;
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
