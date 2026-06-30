import React, { useCallback } from 'react'
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
  background: linear-gradient(180deg, ${ht.surface2} 0%, #090909 100%);
  border: 1px solid ${ht.borderMedium};
  border-radius: 14px;
  padding: 20px;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  transition: box-shadow 200ms ease, border-color 200ms ease;

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
    padding: 16px 20px 14px;
  }
`

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 6px;
  flex-shrink: 0;
`

const Title = styled.h1`
  margin: 0;
  font-family: ${ht.fontDisplay};
  font-size: 20px;
  font-weight: 700;
  color: ${ht.white};
  line-height: 1.15;
`

const Subtitle = styled.p`
  margin: 2px 0 0;
  font-family: ${ht.fontBody};
  font-size: 12px;
  color: ${ht.textMuted};
  line-height: 1.35;
`

const SettingsBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid ${ht.borderSoft};
  background: ${ht.surface3};
  color: ${ht.textMuted};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: border-color 150ms ease, color 150ms ease;

  &:hover {
    border-color: ${ht.borderGold};
    color: ${ht.gold};
  }
`

const SwapBody = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
`

const HomeSwapInner: React.FC = () => {
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

  return (
    <Panel data-home-swap-panel="true">
      <Header>
        <div>
          <Title>Trade</Title>
          <Subtitle>Swap instantly on Melega DEX.</Subtitle>
        </div>
        <SettingsBtn type="button" aria-label="Swap settings" onClick={onPresentSettingsModal}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2" />
          </svg>
        </SettingsBtn>
      </Header>
      <SwapBody className="home-trade-swap">
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
