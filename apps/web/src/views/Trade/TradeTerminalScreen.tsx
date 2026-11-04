import React, { useState } from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { typography } from 'design-system/melega'
import { FeaturedProjectsRail } from 'views/HomeTrade/FeaturedProjectsRail'
import TradeTerminalGlobalStyle from './TradeTerminalGlobalStyle'
import { TradeCockpit } from './TradeCockpit'
import type { SmartSwapProductAction } from 'views/SmartSwapStudio/SmartSwapProductActions'
import { TradeMarcoIconPatch } from './components/TradeMarcoIconPatch'
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
  max-width: ${tradeLayout.cockpitWidth};
  margin: 0 auto;
  padding: ${tradeLayout.contentPaddingTop} ${tradeLayout.contentPaddingX} ${tradeLayout.contentPaddingBottom};
  box-sizing: border-box;
  min-width: 0;
  display: block;

  @media (max-width: 767px) {
    padding: 10px 8px ${tradeLayout.mobileBottomPad};
  }
`

const Promotions = styled.div`
  margin-top: 16px;
  & > section { padding: 0; }
`

export const TradeTerminalScreen: React.FC = () => {
  const [productAction, setProductAction] = useState<SmartSwapProductAction>('swap')

  return (
    <Root data-trade-terminal-screen="true" data-trade-one-page-workspace="true" data-r200-premium="true">
      <PageMeta />
      <TradeTerminalGlobalStyle />
      <TradeMarcoIconPatch />
      <Content>
        <TradeCockpit productAction={productAction} onProductActionChange={setProductAction} />
        <Promotions aria-label="Featured projects">
          <FeaturedProjectsRail />
        </Promotions>
      </Content>
    </Root>
  )
}

export default TradeTerminalScreen
