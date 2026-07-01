import React, { useState } from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { typography } from 'design-system/melega'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { useCurrency } from 'hooks/Tokens'
import TrendingRibbon from 'views/HomeTrade/TrendingRibbon'
import TradeTerminalGlobalStyle from './TradeTerminalGlobalStyle'
import TradePageHeader from './components/TradePageHeader'
import TradeTabBar from './components/TradeTabBar'
import TradeCockpit from './TradeCockpit'
import TradeCenterPanel from './TradeCenterPanel'
import TradeRightRail from './components/TradeRightRail'
import TradeRecentSwaps from './components/TradeRecentSwaps'
import useTradeTerminalData from './useTradeTerminalData'
import { tradeColors, tradeLayout, type TradeMode } from './tradeTokens'

const Root = styled.div`
  color: ${tradeColors.text};
  font-family: ${typography.fontFamily.body};
  background: ${tradeColors.canvas};
  padding: 0 0 32px;
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: 767px) {
    padding: 0 0 24px;
  }
`

const Content = styled.div`
  max-width: ${tradeLayout.contentMax};
  margin: 0 auto;
  padding: ${tradeLayout.contentPaddingTop} ${tradeLayout.contentPaddingX} 0;
  box-sizing: border-box;
  min-width: 0;

  @media (max-width: 767px) {
    padding: 12px 16px 0;
  }
`

const PageGrid = styled.div`
  display: grid;
  gap: ${tradeLayout.columnGap};
  align-items: start;
  min-width: 0;

  @media (min-width: 1100px) {
    grid-template-columns: ${tradeLayout.cockpitWidth} minmax(0, 1fr) ${tradeLayout.rightRailWidth};
    grid-template-areas:
      'cockpit center right'
      'swaps swaps right';
  }

  @media (max-width: 1099px) and (min-width: 768px) {
    grid-template-columns: ${tradeLayout.cockpitWidth} minmax(0, 1fr);
    grid-template-areas:
      'cockpit center'
      'right right'
      'swaps swaps';
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    grid-template-areas:
      'cockpit'
      'center'
      'right'
      'swaps';
  }
`

const AreaCockpit = styled.div`
  grid-area: cockpit;
  min-width: 0;
`

const AreaCenter = styled.div`
  grid-area: center;
  min-width: 0;
`

const AreaRight = styled.div`
  grid-area: right;
  min-width: 0;
`

const AreaSwaps = styled.div`
  grid-area: swaps;
  min-width: 0;
`

export const TradeTerminalScreen: React.FC = () => {
  const [mode, setMode] = useState<TradeMode>('smartswap')
  const [aiMode, setAiMode] = useState(false)
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  const inputSymbol = inputCurrency?.symbol ?? 'BNB'
  const outputSymbol = outputCurrency?.symbol ?? 'MARCO'

  const { recentSwaps } = useTradeTerminalData(inputSymbol, outputSymbol, outputCurrencyId)

  return (
    <Root data-trade-terminal-screen="true">
      <PageMeta />
      <TradeTerminalGlobalStyle />
      <TrendingRibbon />
      <Content>
        <TradePageHeader aiMode={aiMode} onAiModeChange={setAiMode} />
        <TradeTabBar active={mode} onChange={setMode} />
        <PageGrid>
          <AreaCockpit>
            <TradeCockpit mode={mode} />
          </AreaCockpit>
          <AreaCenter>
            <TradeCenterPanel
              inputSymbol={inputSymbol}
              outputSymbol={outputSymbol}
              inputCurrencyId={inputCurrencyId}
              outputCurrencyId={outputCurrencyId}
            />
          </AreaCenter>
          <AreaRight>
            <TradeRightRail />
          </AreaRight>
          <AreaSwaps>
            <TradeRecentSwaps rows={recentSwaps} />
          </AreaSwaps>
        </PageGrid>
      </Content>
    </Root>
  )
}

export default TradeTerminalScreen
