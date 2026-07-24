import React from 'react'
import {
  MelegaStudioGhostBtn,
  MelegaStudioLiveBadge,
  MelegaStudioLiveDot,
  MelegaStudioPageHeader,
  MelegaStudioPrimaryBtn,
  STUDIO_PAGE_TITLES,
  STUDIO_LIVE_RUNTIME_LABEL,
} from 'design-system/melega'

export const PoolsStudioPageHeader: React.FC = () => (
  <MelegaStudioPageHeader
    data-studio-header="pools"
    data-ps-wallet-first-header="true"
    data-ux-rebuild-pools-header="true"
    title={STUDIO_PAGE_TITLES.pools}
    subtitle="Explore pools, manage positions and create liquidity markets."
    badge={
      <MelegaStudioLiveBadge data-ps-live-runtime>
        <MelegaStudioLiveDot data-ps-live-dot aria-hidden />
        {STUDIO_LIVE_RUNTIME_LABEL}
      </MelegaStudioLiveBadge>
    }
    actions={
      <>
        <MelegaStudioGhostBtn as="a" href="/liquidity-studio?view=add" style={{ textDecoration: 'none' }}>
          Add Liquidity
        </MelegaStudioGhostBtn>
        <MelegaStudioPrimaryBtn
          as="a"
          href="/liquidity-studio?view=add"
          data-ps-header-create-pool
          style={{ textDecoration: 'none' }}
        >
          Create Pool
        </MelegaStudioPrimaryBtn>
      </>
    }
  />
)

export default PoolsStudioPageHeader
