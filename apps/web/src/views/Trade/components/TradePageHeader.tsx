import React from 'react'
import {
  MelegaStudioGhostBtn,
  MelegaStudioPageHeader,
  STUDIO_PAGE_TITLES,
} from 'design-system/melega'

/** R785 — trade header without dead AI Mode / How it works controls. */
export const TradePageHeader: React.FC = () => (
  <MelegaStudioPageHeader
    data-studio-header="trade"
    title={STUDIO_PAGE_TITLES.trade}
    subtitle="Professional trading with best multichain routes."
    actions={
      <MelegaStudioGhostBtn as="a" href="/@marco/" style={{ textDecoration: 'none' }}>
        Open Project Page
      </MelegaStudioGhostBtn>
    }
  />
)

export default TradePageHeader
