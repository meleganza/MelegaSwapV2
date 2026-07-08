import React from 'react'
import styled from 'styled-components'
import { FARMS_STUDIO_PREVIEW_LABEL, farmsStudioColors } from '../farmsStudioTokens'
import { FsPreviewBadge } from './farmsStudioPrimitives'
import { DexPricingFeesLink } from 'components/DexPricing/DexPricingFeesLink'

const Row = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  min-width: 0;
`

const Left = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Title = styled.h1`
  margin: 0;
  font-size: 44px;
  font-weight: 800;
  line-height: 1;
  color: ${farmsStudioColors.text};
`

const Subtitle = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.3;
  color: ${farmsStudioColors.subtitle};
  max-width: 720px;
`

const LiveBadge = styled(FsPreviewBadge)`
  border-color: ${farmsStudioColors.green};
  color: ${farmsStudioColors.green};
  background: rgba(0, 230, 118, 0.08);
`

export const FarmsStudioPageHeader: React.FC = () => (
  <div data-fs-page-header>
    <Row>
      <Left>
        <Title>Farms</Title>
        <Subtitle>Earn yield across the Melega ecosystem.</Subtitle>
        <DexPricingFeesLink />
      </Left>
      <LiveBadge>{FARMS_STUDIO_PREVIEW_LABEL}</LiveBadge>
    </Row>
  </div>
)

export default FarmsStudioPageHeader
