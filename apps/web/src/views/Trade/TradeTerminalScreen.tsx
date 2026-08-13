import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { typography } from 'design-system/melega'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { useCurrency } from 'hooks/Tokens'
import TradeTerminalGlobalStyle from './TradeTerminalGlobalStyle'
import TradePageHeader from './components/TradePageHeader'
import TradeCockpit from './TradeCockpit'
import TradeCenterPanel from './TradeCenterPanel'
import TradeRecentSwaps from './components/TradeRecentSwaps'
import TradeRouterPanel from './components/TradeRouterPanel'
import TradeMarcoIconPatch from './components/TradeMarcoIconPatch'
import useTradeTerminalData from './useTradeTerminalData'
import useTradeVisibilityStatus from './useTradeVisibilityStatus'
import { TradeRuntimeProvider } from './tradeRuntime/TradeRuntimeContext'
import { tradeColors, tradeLayout } from './tradeTokens'
import { resolveProjectByContractAddress, resolveProjectByTokenSymbol } from 'registry/projects/identity'

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
  gap: ${tradeLayout.verticalRhythm};

  @media (max-width: 767px) {
    padding: 16px 16px ${tradeLayout.mobileBottomPad};
  }
`

const TopGrid = styled.div`
  display: grid;
  gap: ${tradeLayout.columnGap};
  align-items: stretch;
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

const BottomGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(320px, 0.75fr);
  grid-auto-rows: ${tradeLayout.tradeTerminalRecentSwapsHeight};
  gap: ${tradeLayout.columnGap};
  min-width: 0;
  align-items: stretch;

  @media (max-width: 899px) {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
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

const AreaSwaps = styled.div`
  ${stretchColumn}
`

const AreaRoutes = styled.div`
  ${stretchColumn}
`

export const TradeTerminalScreen: React.FC = () => {
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  const inputSymbol = inputCurrency?.symbol ?? 'BNB'
  const outputSymbol = outputCurrency?.symbol ?? 'MARCO'
  const outputProject = React.useMemo(() => {
    const byAddress = outputCurrencyId ? resolveProjectByContractAddress(outputCurrencyId) : undefined
    return byAddress ?? resolveProjectByTokenSymbol(outputSymbol)
  }, [outputCurrencyId, outputSymbol])
  const projectPageActive = Boolean(
    outputProject &&
      outputProject.registryStatus === 'listed' &&
      outputProject.capabilities.tradable.status === 'live' &&
      outputProject.lifecycleStatus !== 'inactive',
  )
  const projectAddress =
    outputCurrencyId ?? outputProject?.resources.tokens.find((token) => token.symbol === outputSymbol)?.address
  const visibility = useTradeVisibilityStatus({
    projectSlug: outputProject?.slug,
    projectAddress,
  })

  // Market/indexer reads are intentionally created once for the whole terminal.
  // TradeCenterPanel used to create a second identical runtime (SWR, multicall,
  // holder and candle subscriptions), which made route entry especially heavy in Firefox.
  const tradeData = useTradeTerminalData(inputSymbol, outputSymbol, outputCurrencyId)
  const { recentSwaps, isIndexing, swapEmptyReason, missingReason, missingReasonDetail, swapDiagnostic } = tradeData

  return (
    <Root data-trade-terminal-screen="true" data-trade-one-page-workspace="true" data-r200-premium="true">
      <PageMeta />
      <TradeTerminalGlobalStyle />
      <TradeMarcoIconPatch />
      <Content>
        <TradePageHeader
          inputSymbol={inputSymbol}
          outputSymbol={outputSymbol}
          projectName={outputProject?.displayName}
          projectHref={projectPageActive ? `/@${outputProject?.slug}/` : undefined}
          bridgeHref={outputSymbol.toUpperCase() === 'MARCO' ? '/bridge' : undefined}
          featured={visibility.featured}
          featuredRemaining={visibility.featuredRemaining}
          boosted={visibility.boosted}
          boostedRemaining={visibility.boostedRemaining}
        />
        <TradeRuntimeProvider>
          <TopGrid>
            <AreaCockpit>
              <TradeCockpit />
            </AreaCockpit>
            <AreaCenter>
              <TradeCenterPanel
                data={tradeData}
                inputSymbol={inputSymbol}
                outputSymbol={outputSymbol}
                inputCurrencyId={inputCurrencyId}
                outputCurrencyId={outputCurrencyId}
              />
            </AreaCenter>
          </TopGrid>
          <BottomGrid>
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
            <AreaRoutes>
              <TradeRouterPanel />
            </AreaRoutes>
          </BottomGrid>
        </TradeRuntimeProvider>
      </Content>
    </Root>
  )
}

export default TradeTerminalScreen
