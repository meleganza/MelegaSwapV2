import React, { useState } from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { colors, typography } from 'design-system/melega'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { useCurrency } from 'hooks/Tokens'
import TradeTerminalGlobalStyle from './TradeTerminalGlobalStyle'
import TradeCockpit from './TradeCockpit'
import TradeMarketPanel from './TradeMarketPanel'
import { tradeLayout, type TradeMode } from './tradeTokens'

const Root = styled.div`
  color: ${colors.textPrimary};
  font-family: ${typography.fontFamily.body};
  background: #0a0a0a;
  padding: 0 0 32px;

  @media (max-width: 767px) {
    padding: 0 14px 24px;
  }
`

const Content = styled.div`
  max-width: ${tradeLayout.contentMax};
  margin: 0 auto;
  padding: 0 16px;
  box-sizing: border-box;
`

const PageHeader = styled.div`
  margin: 8px 0 20px;
`

const Title = styled.h1`
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  color: ${colors.textPrimary};
  line-height: 1.1;
`

const Subtitle = styled.p`
  margin: 8px 0 0;
  font-size: 14px;
  color: #9e9e9e;
  line-height: 1.45;
`

const Grid = styled.div`
  display: grid;
  gap: ${tradeLayout.columnGap};

  @media (min-width: 768px) {
    grid-template-columns: ${tradeLayout.cockpitWidth} 1fr;
    align-items: start;
  }
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

  return (
    <Root data-trade-terminal-screen="true">
      <PageMeta />
      <TradeTerminalGlobalStyle />
      <Content>
        <PageHeader>
          <Title>Trade</Title>
          <Subtitle>Professional trading with best multichain routes.</Subtitle>
        </PageHeader>
        <Grid>
          <TradeCockpit mode={mode} onModeChange={setMode} />
          <TradeMarketPanel
            inputSymbol={inputSymbol}
            outputSymbol={outputSymbol}
            inputCurrencyId={inputCurrencyId}
            outputCurrencyId={outputCurrencyId}
          />
        </Grid>
      </Content>
    </Root>
  )
}

export default TradeTerminalScreen
