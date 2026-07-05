import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { BS_FONT_BODY, BS_FONT_DISPLAY, buildStudioColors } from '../buildStudioTokens'
import { IconBook, IconDownload } from './buildStudioIcons'
import { BsOutlineBtn, BsPrimaryBtn } from './buildStudioPrimitives'
import BuildInfrastructureGuidePanel from './BuildInfrastructureGuidePanel'

const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  min-width: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`

const Left = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Title = styled.h1`
  margin: 0;
  font-family: ${BS_FONT_DISPLAY};
  font-size: 56px;
  font-weight: 700;
  line-height: 1;
  color: ${buildStudioColors.white};

  @media (max-width: 768px) {
    font-size: 42px;
  }
`

const Subtitle = styled.p`
  margin: 0;
  max-width: 520px;
  font-family: ${BS_FONT_BODY};
  font-size: 22px;
  line-height: 34px;
  color: ${buildStudioColors.subtitle};
`

const BtnRow = styled.div`
  display: flex;
  gap: 12px;
  flex-shrink: 0;
  align-items: center;
  flex-wrap: wrap;
  min-width: 0;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
  }
`

export const BuildStudioPageHeader: React.FC = () => {
  const [guideOpen, setGuideOpen] = useState(false)

  return (
  <>
  <Header data-bs-page-header>
    <Left>
      <Title>BUILD STUDIO</Title>
      <Subtitle>Build trusted economic infrastructure with AI assistance.</Subtitle>
    </Left>
    <BtnRow>
      <BsOutlineBtn type="button" $width="180px" $height="46px" data-bs-hero-guide onClick={() => setGuideOpen(true)}>
        <IconBook size={16} />
        AI Infrastructure Guide
      </BsOutlineBtn>
      <BsPrimaryBtn
        as={Link}
        to="/import-existing-token"
        $width="220px"
        $height="52px"
        data-bs-hero-import
        style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        <IconDownload size={16} color="#050505" />
        Import Existing Token
      </BsPrimaryBtn>
    </BtnRow>
  </Header>
  <BuildInfrastructureGuidePanel open={guideOpen} onClose={() => setGuideOpen(false)} />
  </>
  )
}

export default BuildStudioPageHeader
