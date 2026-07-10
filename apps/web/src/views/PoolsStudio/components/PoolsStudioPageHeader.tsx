import React from 'react'
import {
  MelegaStudioLiveBadge,
  MelegaStudioLiveDot,
  MelegaStudioPageHeader,
  MelegaStudioPrimaryBtn,
  STUDIO_PAGE_TITLES,
  STUDIO_LIVE_RUNTIME_LABEL,
} from 'design-system/melega'

const scrollToCreatePool = () => {
  const el = document.getElementById('create-pool')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }
  window.location.href = '/build-studio?intent=staking-pool#create-pool'
}

export const PoolsStudioPageHeader: React.FC = () => (
  <MelegaStudioPageHeader
    data-studio-header="pools"
    title={STUDIO_PAGE_TITLES.pools}
    subtitle={
      <>
        Stake assets. Earn rewards. Build long-term positions.
      </>
    }
    badge={
      <MelegaStudioLiveBadge data-ps-live-runtime>
        <MelegaStudioLiveDot data-ps-live-dot aria-hidden />
        {STUDIO_LIVE_RUNTIME_LABEL}
      </MelegaStudioLiveBadge>
    }
    actions={
      <MelegaStudioPrimaryBtn type="button" data-ps-header-create-pool onClick={scrollToCreatePool}>
        + Create Pool
      </MelegaStudioPrimaryBtn>
    }
  />
)

export default PoolsStudioPageHeader
