import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { typography } from 'design-system/melega'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { useCurrency } from 'hooks/Tokens'
import type { SmartSwapProductAction } from 'views/SmartSwapStudio/SmartSwapProductActions'
import TradeTerminalGlobalStyle from './TradeTerminalGlobalStyle'
import { TradeSwapHero } from './components/TradeSwapHero'
import { TradeCockpit } from './TradeCockpit'
import { TradeCenterPanel } from './TradeCenterPanel'
import { TradeRecentSwaps } from './components/TradeRecentSwaps'
import { TradeRouterPanel } from './components/TradeRouterPanel'
import { TradeMarcoIconPatch } from './components/TradeMarcoIconPatch'
import { useTradeTerminalData } from './useTradeTerminalData'
import { TradeRuntimeProvider } from './tradeRuntime/TradeRuntimeContext'
import { tradeColors, tradeLayout } from './tradeTokens'

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
  /* Home desktop content rhythm; intentionally local to the Swap page shell. */
  gap: 20px;

  @media (max-width: 767px) {
    padding: 16px 0 ${tradeLayout.mobileBottomPad};
    gap: 14px;
  }
`

const TopGrid = styled.div`
  display: grid;
  gap: ${tradeLayout.columnGap};
  align-items: start;
  min-width: 0;

  @media (min-width: 900px) {
    grid-template-columns: minmax(0, 1fr) minmax(360px, ${tradeLayout.cockpitWidth});
    grid-template-areas: 'center cockpit';
  }

  @media (max-width: 899px) {
    grid-template-columns: 1fr;
    grid-template-areas:
      'cockpit'
      'center';
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

const LeftWorkspace = styled.div`
  grid-area: center;
  display: flex;
  flex-direction: column;
  gap: ${tradeLayout.verticalRhythm};
  min-width: 0;
  min-height: 0;
  align-self: start;
`

const RightWorkspace = styled.div`
  grid-area: cockpit;
  display: flex;
  flex-direction: column;
  gap: ${tradeLayout.verticalRhythm};
  min-width: 0;
  align-self: start;
`

const AreaSwaps = styled.div`
  ${stretchColumn}
`

const AreaRoutes = styled.div`
  ${stretchColumn}
`

export const TradeTerminalScreen: React.FC = () => {
  const [productAction, setProductAction] = React.useState<SmartSwapProductAction>('swap')
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  const inputSymbol = inputCurrency?.symbol ?? 'BNB'
  const outputSymbol = outputCurrency?.symbol ?? 'MARCO'

  // Market/indexer reads are intentionally created once for the whole terminal.
  // TradeCenterPanel used to create a second identical runtime (SWR, multicall,
  // holder and candle subscriptions), which made route entry especially heavy in Firefox.
  const tradeData = useTradeTerminalData(inputSymbol, outputSymbol, outputCurrencyId, inputCurrencyId)
  const { recentSwaps, isIndexing, swapEmptyReason, missingReason, missingReasonDetail, swapDiagnostic } = tradeData

  return (
    <Root data-trade-terminal-screen="true" data-trade-one-page-workspace="true" data-r200-premium="true">
      <PageMeta />
      <TradeTerminalGlobalStyle />
      <TradeMarcoIconPatch />
      <Content>
        <TradeSwapHero />
        <TradeRuntimeProvider>
          <TopGrid>
            <RightWorkspace>
              <TradeCockpit productAction={productAction} onProductActionChange={setProductAction} />
              {productAction === 'swap' ? (
                <AreaRoutes>
                  <TradeRouterPanel />
                </AreaRoutes>
              ) : null}
            </RightWorkspace>
            <LeftWorkspace>
              <TradeCenterPanel
                data={tradeData}
                inputSymbol={inputSymbol}
                outputSymbol={outputSymbol}
                inputCurrencyId={inputCurrencyId}
                outputCurrencyId={outputCurrencyId}
              />
              <AreaSwaps data-bridge-recent-swaps={productAction === 'bridge' ? 'true' : undefined}>
                <TradeRecentSwaps
                  rows={recentSwaps}
                  isIndexing={isIndexing}
                  swapEmptyReason={swapEmptyReason}
                  missingReason={missingReason}
                  missingReasonDetail={missingReasonDetail}
                  swapDiagnostic={swapDiagnostic}
                />
              </AreaSwaps>
            </LeftWorkspace>
          </TopGrid>
        </TradeRuntimeProvider>
      </Content>
    </Root>
  )
}

export default TradeTerminalScreen
