import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import {
  MelegaStudioOutlineBtn,
  MelegaStudioPageHeader,
  MelegaStudioPrimaryBtn,
  STUDIO_PAGE_TITLES,
  studioConstitutionLayout,
} from 'design-system/melega'
import { IconBook, IconDownload } from './buildStudioIcons'
import BuildInfrastructureGuidePanel from './BuildInfrastructureGuidePanel'
import { DexPricingFeesLink } from 'components/DexPricing/DexPricingFeesLink'

const Meta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${studioConstitutionLayout.heroInnerGap};
`

export const BuildStudioPageHeader: React.FC = () => {
  const [guideOpen, setGuideOpen] = useState(false)

  return (
    <>
      <MelegaStudioPageHeader
        data-studio-header="build"
        title={STUDIO_PAGE_TITLES.build}
        subtitle={
          <Meta>
            <span>Build trusted economic infrastructure with AI assistance.</span>
            <DexPricingFeesLink />
          </Meta>
        }
        actions={
          <>
            <MelegaStudioOutlineBtn type="button" data-bs-hero-guide onClick={() => setGuideOpen(true)}>
              <IconBook size={16} />
              AI Infrastructure Guide
            </MelegaStudioOutlineBtn>
            <MelegaStudioPrimaryBtn
              as={Link}
              to="/import-existing-token"
              data-bs-hero-import
              style={{ textDecoration: 'none' }}
            >
              <IconDownload size={16} color="#050505" />
              Import Existing Token
            </MelegaStudioPrimaryBtn>
          </>
        }
      />
      <BuildInfrastructureGuidePanel open={guideOpen} onClose={() => setGuideOpen(false)} />
    </>
  )
}

export default BuildStudioPageHeader
