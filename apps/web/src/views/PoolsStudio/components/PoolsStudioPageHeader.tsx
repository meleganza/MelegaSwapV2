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
    data-ps-wallet-first-header="true"
    title={STUDIO_PAGE_TITLES.pools}
    subtitle={
      <>
        Your pool positions first — then explore and stake new pools.
      </>
    }
    badge={
      <MelegaStudioLiveBadge data-ps-live-runtime>
        <MelegaStudioLiveDot data-ps-live-dot aria-hidden />
        {STUDIO_LIVE_RUNTIME_LABEL}
      </MelegaStudioLiveBadge>
    }
    actions={
      <>
        <MelegaStudioGhostBtn as="a" href="/@melega-dex/" style={{ textDecoration: 'none' }}>
          Open Project Page
        </MelegaStudioGhostBtn>
        <MelegaStudioPrimaryBtn type="button" data-ps-header-create-pool onClick={scrollToCreatePool}>
          + Create Pool
        </MelegaStudioPrimaryBtn>
      </>
    }
  />
)

export default PoolsStudioPageHeader
