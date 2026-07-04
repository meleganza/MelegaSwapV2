import React from 'react'
import styled, { keyframes } from 'styled-components'
import { TRADE_TABS, tradeColors, type TradeMode } from '../tradeTokens'

const glow = keyframes`
  0%, 100% { box-shadow: inset 0 -2px 0 0 rgba(244, 197, 66, 0.08); }
  50% { box-shadow: inset 0 -2px 0 0 rgba(244, 197, 66, 0.12); }
`

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
  height: 44px;
  min-height: 44px;
  padding: 0 20px;
  margin-top: 18px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  overflow-x: auto;
  scrollbar-width: none;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    display: none;
  }
`

const Tab = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 44px;
  padding: 0;
  border: none;
  background: transparent;
  color: ${({ $active }) => ($active ? tradeColors.goldBright : '#a5a5a5')};
  font-size: 14px;
  font-weight: 600;
  cursor: ${({ $active }) => ($active ? 'default' : 'pointer')};
  white-space: nowrap;
  position: relative;
  animation: ${({ $active }) => ($active ? glow : 'none')} 4s ease-in-out infinite;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    background: ${({ $active }) => ($active ? tradeColors.goldBright : 'transparent')};
    border-radius: 1px;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    color: #ffffff;
  }

  &:not(:disabled):active {
    transform: scale(0.99);
  }
`

const LightningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={tradeColors.goldBright} aria-hidden>
    <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
  </svg>
)

export interface TradeTabBarProps {
  active: TradeMode
  onChange: (mode: TradeMode) => void
}

export const TradeTabBar: React.FC<TradeTabBarProps> = ({ active, onChange }) => (
  <Bar role="tablist" aria-label="Trade modes" data-trade-tab-bar>
    {TRADE_TABS.map((tab) => {
      const isActive = active === tab.id
      const isDisabled = tab.id === 'limit'
      const comingSoon = tab.id === 'limit'
      return (
        <Tab
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={isActive}
          $active={isActive}
          disabled={isDisabled}
          onClick={() => !isDisabled && onChange(tab.id)}
        >
          {tab.icon === 'lightning' && <LightningIcon />}
          {tab.label}
          {comingSoon ? ' · Coming soon' : ''}
        </Tab>
      )
    })}
  </Bar>
)

export default TradeTabBar
