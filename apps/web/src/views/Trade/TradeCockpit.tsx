import React, { useCallback, useRef } from 'react'
import styled from 'styled-components'
import { Currency } from '@pancakeswap/sdk'
import { useModal } from '@pancakeswap/uikit'
import { useWeb3React } from '@pancakeswap/wagmi'
import { useSwapActionHandlers } from 'state/swap/useSwapActionHandlers'
import { currencyId } from 'utils/currencyId'
import replaceBrowserHistory from '@pancakeswap/utils/replaceBrowserHistory'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import SettingsModal from 'components/Menu/GlobalSettings/SettingsModal'
import { SettingsMode } from 'components/Menu/GlobalSettings/types'
import useWarningImport from 'views/Swap/hooks/useWarningImport'
import { SmartSwapForm } from 'views/Swap/SmartSwap'
import { tradeColors, tradeLayout } from './tradeTokens'
import TradeRouteLine from './components/TradeRouteLine'
import TradeSmartRouteBox from './components/TradeSmartRouteBox'
import type { TradeMode } from './tradeTokens'

const Shell = styled.div`
  width: 100%;
  max-width: ${tradeLayout.cockpitWidth};
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 18px;
  background: ${tradeColors.panelGradient};
  border: 1px solid ${tradeColors.border};
  border-radius: 18px;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  contain: layout paint;
`

const ToolbarRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  min-height: 34px;
  margin-bottom: 12px;
  flex-shrink: 0;
`

const IconBtn = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #121212;
  color: #b5b5b5;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: color 150ms ease, border-color 150ms ease, transform 120ms ease;

  &:hover {
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.14);
  }

  &:active {
    transform: scale(0.99);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`

const SwapFormWrap = styled.div`
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  contain: layout paint;
  box-sizing: border-box;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`

const Placeholder = styled.div`
  padding: 18px;
  color: ${tradeColors.muted};
  font-size: 14px;
`

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
    />
  </svg>
)

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
    <path d="M21 12a9 9 0 11-2.64-6.36" />
    <path d="M21 3v6h-6" />
  </svg>
)

export interface TradeCockpitProps {
  mode: TradeMode
}

export const TradeCockpit: React.FC<TradeCockpitProps> = ({ mode }) => {
  const swapBodyRef = useRef<HTMLDivElement>(null)
  const { account } = useWeb3React()
  const warningSwapHandler = useWarningImport()
  const { onCurrencySelection } = useSwapActionHandlers()
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const [onPresentSettingsModal] = useModal(<SettingsModal mode={SettingsMode.SWAP_LIQUIDITY} />)

  const handleOutputSelect = useCallback(
    (newCurrencyOutput: Currency) => {
      onCurrencySelection(Field.OUTPUT, newCurrencyOutput)
      warningSwapHandler(newCurrencyOutput)
      const newCurrencyOutputId = currencyId(newCurrencyOutput)
      if (newCurrencyOutputId === inputCurrencyId) {
        replaceBrowserHistory('inputCurrency', outputCurrencyId)
      }
      replaceBrowserHistory('outputCurrency', newCurrencyOutputId)
    },
    [inputCurrencyId, outputCurrencyId, onCurrencySelection, warningSwapHandler],
  )

  const handleRefresh = useCallback(() => {
    const root = swapBodyRef.current
    if (!root) return
    const btn =
      root.querySelector('[class*="RefreshIcon"]') ||
      root.querySelector('button[aria-label*="Refresh"]') ||
      root.querySelector('[class*="CurrencyInputHeader"] button')
    if (btn instanceof HTMLElement) btn.click()
  }, [])

  if (mode !== 'smartswap') {
    return (
      <Shell data-trade-cockpit>
        <Panel data-trade-cockpit-shell>
          <Placeholder>Mode coming soon</Placeholder>
        </Panel>
      </Shell>
    )
  }

  return (
    <Shell data-trade-cockpit>
      <Panel data-trade-cockpit-shell className="trade-swap-cockpit">
        <ToolbarRow>
          <IconBtn type="button" aria-label="Swap settings" onClick={onPresentSettingsModal}>
            <SettingsIcon />
          </IconBtn>
          <IconBtn type="button" aria-label="Refresh price" onClick={handleRefresh}>
            <RefreshIcon />
          </IconBtn>
        </ToolbarRow>
        <TradeSmartRouteBox />
        <SwapFormWrap
          ref={swapBodyRef}
          className={`trade-terminal-swap${account ? '' : ' is-disconnected'} is-smartswap`}
          data-wallet-connected={account ? 'true' : 'false'}
          data-trade-swap-form
        >
          <SmartSwapForm handleOutputSelect={handleOutputSelect} />
          <TradeRouteLine />
        </SwapFormWrap>
      </Panel>
    </Shell>
  )
}

export default TradeCockpit
