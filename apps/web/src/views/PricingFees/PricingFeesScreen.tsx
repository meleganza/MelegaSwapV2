import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { typography } from 'design-system/melega'
import { DexPricingFeesSurface } from 'components/DexPricing/DexPricingFeesSurface'

const Root = styled.div`
  color: #f2f2f2;
  font-family: ${typography.fontFamily.body};
  padding: 24px 0 48px;
`

const Content = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px;
`

const PricingFeesScreen: React.FC = () => (
  <Root>
    <PageMeta title="Pricing & Fees" />
    <Content>
      <DexPricingFeesSurface />
    </Content>
  </Root>
)

export default PricingFeesScreen
