import React, { useCallback, useRef } from 'react'
import styled from 'styled-components'
import { Currency } from '@pancakeswap/sdk'
import { useModal } from '@pancakeswap/uikit'
import { useSwapActionHandlers } from 'state/swap/useSwapActionHandlers'
import { currencyId } from 'utils/currencyId'
import replaceBrowserHistory from '@pancakeswap/utils/replaceBrowserHistory'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import SettingsModal from 'components/Menu/GlobalSettings/SettingsModal'
import { SettingsMode } from 'components/Menu/GlobalSettings/types'
import useWarningImport from 'views/Swap/hooks/useWarningImport'
import { SmartSwapForm } from 'views/Swap/SmartSwap'
import { SwapFeaturesProvider } from 'views/Swap/SwapFeaturesContext'
import { ht } from './homeTradeTokens'

const Panel = styled.div`
  background: linear-gradient(180deg, #111111 0%, #090909 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 18px;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  transition: box-shadow 180ms ease, border-color 180ms ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.14);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
  }

  @media (min-width: 1024px) {
    width: ${ht.swapWidth};
    max-width: ${ht.swapWidth};
    height: ${ht.heroMaxHeight};
    max-height: ${ht.heroMaxHeight};
    flex-shrink: 0;
  }
`

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  height: 38px;
  flex-shrink: 0;
  margin-bottom: 4px;
`

const Title = styled.h1`
  margin: 0;
  font-family: ${ht.fontBody};
  font-size: 24px;
  font-weight: 700;
  color: ${ht.white};
  line-height: 1.1;
`

const Subtitle = styled.p`
  margin: 2px 0 0;
  font-family: ${ht.fontBody};
  font-size: 14px;
  color: ${ht.textMeta};
  line-height: 1.35;
`

const IconRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

const IconBtn = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: ${ht.textMeta};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: color 180ms ease, background 180ms ease;

  &:hover {
    color: ${ht.white};
    background: rgba(255, 255, 255, 0.05);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`

const SwapBody = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
`

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 6.34l1.41 1.41M16.24 16.24l1.41 1.41" />
  </svg>
)

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
    <path d="M21 12a9 9 0 11-2.64-6.36" />
    <path d="M21 3v6h-6" />
  </svg>
)

const HomeSwapInner: React.FC = () => {
  const swapBodyRef = useRef<HTMLDivElement>(null)
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

  return (
    <Panel data-home-swap-panel="true">
      <Header>
        <div>
          <Title>Swap</Title>
          <Subtitle>Trade tokens instantly on Melega DEX.</Subtitle>
        </div>
        <IconRow>
          <IconBtn type="button" aria-label="Swap settings" onClick={onPresentSettingsModal}>
            <SettingsIcon />
          </IconBtn>
          <IconBtn type="button" aria-label="Refresh price" onClick={handleRefresh}>
            <RefreshIcon />
          </IconBtn>
        </IconRow>
      </Header>
      <SwapBody ref={swapBodyRef} className="home-trade-swap">
        <SmartSwapForm handleOutputSelect={handleOutputSelect} />
      </SwapBody>
    </Panel>
  )
}

export const HomeSwapPanel: React.FC = () => (
  <SwapFeaturesProvider>
    <HomeSwapInner />
  </SwapFeaturesProvider>
)

export default HomeSwapPanel
