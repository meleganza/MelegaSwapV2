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
import { useCurrency } from 'hooks/Tokens'
import SettingsModal from 'components/Menu/GlobalSettings/SettingsModal'
import { SettingsMode } from 'components/Menu/GlobalSettings/types'
import useWarningImport from 'views/Swap/hooks/useWarningImport'
import { SmartSwapForm } from 'views/Swap/SmartSwap'
import { SwapIconButton } from 'design-system/melega'
import TradePairHeader from './components/TradePairHeader'
import TradeModeSelector from './components/TradeModeSelector'
import type { TradeMode } from './tradeTokens'

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 560px;
  overflow: hidden;
  box-sizing: border-box;
`

const CockpitCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(180deg, #141414 0%, #101010 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  box-sizing: border-box;
  min-height: 0;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  position: relative;
  contain: layout paint;
`

const SwapFormWrap = styled.div`
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  contain: layout paint;
  box-sizing: border-box;
`

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: -4px;
`

const SmartInsights = styled.div`
  display: grid;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(212, 175, 55, 0.22);
  background: rgba(212, 175, 55, 0.06);
`

const InsightRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  color: #b3b3b3;
`

const InsightValue = styled.span`
  color: #ffffff;
  font-weight: 600;
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
  onModeChange: (mode: TradeMode) => void
}

export const TradeCockpit: React.FC<TradeCockpitProps> = ({ mode, onModeChange }) => {
  const swapBodyRef = useRef<HTMLDivElement>(null)
  const { account } = useWeb3React()
  const warningSwapHandler = useWarningImport()
  const { onCurrencySelection } = useSwapActionHandlers()
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const [onPresentSettingsModal] = useModal(<SettingsModal mode={SettingsMode.SWAP_LIQUIDITY} />)

  const inputSymbol = inputCurrency?.symbol ?? '—'
  const outputSymbol = outputCurrency?.symbol ?? '—'

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

  return (
    <Shell data-trade-cockpit>
      <TradePairHeader inputSymbol={inputSymbol} outputSymbol={outputSymbol} />
      <TradeModeSelector mode={mode} onChange={onModeChange} />
      <CockpitCard data-trade-cockpit-shell>
        <Toolbar>
          <SwapIconButton type="button" aria-label="Swap settings" onClick={onPresentSettingsModal}>
            <SettingsIcon />
          </SwapIconButton>
          <SwapIconButton type="button" aria-label="Refresh price" onClick={handleRefresh}>
            <RefreshIcon />
          </SwapIconButton>
        </Toolbar>
        {mode === 'smartswap' && (
          <SmartInsights data-trade-smart-insights>
            <InsightRow>
              <span>Route quality</span>
              <InsightValue>{account ? 'Optimizing' : '—'}</InsightValue>
            </InsightRow>
            <InsightRow>
              <span>Estimated savings</span>
              <InsightValue>—</InsightValue>
            </InsightRow>
            <InsightRow>
              <span>Execution speed</span>
              <InsightValue>Fast</InsightValue>
            </InsightRow>
          </SmartInsights>
        )}
        <SwapFormWrap
          ref={swapBodyRef}
          className={`trade-terminal-swap${account ? '' : ' is-disconnected'}${mode === 'smartswap' ? ' is-smartswap' : ''}`}
          data-wallet-connected={account ? 'true' : 'false'}
          data-trade-swap-form
        >
          <SmartSwapForm handleOutputSelect={handleOutputSelect} />
        </SwapFormWrap>
      </CockpitCard>
    </Shell>
  )
}

export default TradeCockpit
