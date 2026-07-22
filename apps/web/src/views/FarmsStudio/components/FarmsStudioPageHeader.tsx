import React from 'react'
import styled from 'styled-components'
import {
  MelegaStudioLiveBadge,
  MelegaStudioLiveDot,
  MelegaStudioPageHeader,
  STUDIO_PAGE_TITLES,
} from 'design-system/melega'
import { FARMS_STUDIO_PREVIEW_LABEL } from '../farmsStudioTokens'
import { DexPricingFeesLink } from 'components/DexPricing/DexPricingFeesLink'

const Meta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const FarmsStudioPageHeader: React.FC = () => (
  <MelegaStudioPageHeader
    data-studio-header="farms"
    data-fs-wallet-first-header="true"
    data-ux-rebuild-farms-header="true"
    title={STUDIO_PAGE_TITLES.farms}
    subtitle={
      <Meta>
        <span>Earn rewards from active Melega DEX farms.</span>
        <DexPricingFeesLink />
      </Meta>
    }
    badge={
      <MelegaStudioLiveBadge>
        <MelegaStudioLiveDot aria-hidden />
        {FARMS_STUDIO_PREVIEW_LABEL}
      </MelegaStudioLiveBadge>
    }
  />
)

export default FarmsStudioPageHeader
