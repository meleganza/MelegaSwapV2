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
  border-radius: 16px;
  padding: 18px;
  width: 100%;
  min-height: auto;
  display: flex;
  flex-direction: column;
  overflow: visible;
  box-sizing: border-box;

  @media (min-width: 1024px) {
    width: 500px;
    max-width: 500px;
    border-radius: 14px;
    padding: 22px;
    min-height: 360px;
  }
`

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
  flex-shrink: 0;
`

const TitleBlock = styled.div``

const Title = styled.h1`
  margin: 0;
  font-family: ${ht.fontBody};
  font-size: 24px;
  font-weight: 700;
  color: ${ht.white};
  line-height: 1.15;
`

const Subtitle = styled.p`
  margin: 4px 0 0;
  font-family: ${ht.fontBody};
  font-size: 15px;
  color: #bdbdbd;
  line-height: 1.45;
`

const SettingsBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid ${ht.borderSoft};
  background: ${ht.surface3};
  color: ${ht.textMuted};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:hover {
    border-color: ${ht.borderGold};
    color: ${ht.gold};
  }
`

const SwapBody = styled.div`
  flex: 1;
  overflow: visible;
  min-height: 0;
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
        <TitleBlock>
          <Title>Trade</Title>
          <Subtitle>Swap instantly on Melega DEX.</Subtitle>
        </TitleBlock>
        <SettingsBtn type="button" aria-label="Swap settings" onClick={onPresentSettingsModal}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
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
