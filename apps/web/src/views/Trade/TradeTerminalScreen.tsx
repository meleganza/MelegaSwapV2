import React, { useState } from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { typography } from 'design-system/melega'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { useCurrency } from 'hooks/Tokens'
import TradeTerminalGlobalStyle from './TradeTerminalGlobalStyle'
import TradePageHeader from './components/TradePageHeader'
import TradeTabBar from './components/TradeTabBar'
import TradeCockpit from './TradeCockpit'
import TradeCenterPanel from './TradeCenterPanel'
import TradeRightRail from './components/TradeRightRail'
import TradeRecentSwaps from './components/TradeRecentSwaps'
import TradeMarcoIconPatch from './components/TradeMarcoIconPatch'
import useTradeTerminalData from './useTradeTerminalData'
import { TradeRuntimeProvider } from './tradeRuntime/TradeRuntimeContext'
import { TradeUiProvider } from './TradeUiContext'
import { tradeColors, tradeLayout, type TradeMode } from './tradeTokens'

const Root = styled.div`
  color: ${tradeColors.text};
  font-family: ${typography.fontFamily.body};
  background: ${tradeColors.canvas};
  padding: 0 0 32px;
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: 767px) {
    padding: 0 0 calc(24px + env(safe-area-inset-bottom, 0px));
  }
`

const Content = styled.div`
  max-width: ${tradeLayout.contentMax};
  margin: 0 auto;
  padding: ${tradeLayout.contentPaddingTop} ${tradeLayout.contentPaddingX} ${tradeLayout.contentPaddingBottom};
  box-sizing: border-box;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${tradeLayout.sectionGap};

  @media (max-width: 767px) {
    padding: 16px 16px ${tradeLayout.mobileBottomPad};
  }
`

const PageGrid = styled.div`
  display: grid;
  gap: ${tradeLayout.columnGap};
  align-items: stretch;
  min-width: 0;

  @media (min-width: 1100px) {
    grid-template-columns: ${tradeLayout.cockpitWidth} minmax(0, ${tradeLayout.centerWidth}) ${tradeLayout.rightRailWidth};
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

const stretchColumn = `
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;

  & > * {
    flex: 1;
    min-height: 0;
  }
`

const AreaCockpit = styled.div`
  grid-area: cockpit;
  ${stretchColumn}
`

const AreaCenter = styled.div`
  grid-area: center;
  ${stretchColumn}
`

const AreaRight = styled.div`
  grid-area: right;
  ${stretchColumn}
  align-self: stretch;
`

const AreaSwaps = styled.div`
  grid-area: swaps;
  min-width: 0;
`

export const TradeTerminalScreen: React.FC = () => {
  const [mode, setMode] = useState<TradeMode>('smartswap')
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  const inputSymbol = inputCurrency?.symbol ?? 'BNB'
  const outputSymbol = outputCurrency?.symbol ?? 'MARCO'

  const { recentSwaps, isIndexing, swapEmptyReason, missingReason, missingReasonDetail, swapDiagnostic } =
    useTradeTerminalData(inputSymbol, outputSymbol, outputCurrencyId)

  return (
    <Root data-trade-terminal-screen="true" data-r200-premium="true">
      <PageMeta />
      <TradeTerminalGlobalStyle />
      <TradeMarcoIconPatch />
      <TradeUiProvider value={{ mode, setMode, helpOpen: false, setHelpOpen: () => undefined }}>
      <Content>
        <TradePageHeader />
        <TradeTabBar active={mode} onChange={setMode} />
        <TradeRuntimeProvider>
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
              <TradeRecentSwaps
                rows={recentSwaps}
                isIndexing={isIndexing}
                swapEmptyReason={swapEmptyReason}
                missingReason={missingReason}
                missingReasonDetail={missingReasonDetail}
                swapDiagnostic={swapDiagnostic}
              />
            </AreaSwaps>
          </PageGrid>
        </TradeRuntimeProvider>
      </Content>
      </TradeUiProvider>
    </Root>
  )
}

export default TradeTerminalScreen
