import React from 'react'
import styled from 'styled-components'
import { BS_FONT_BODY, BS_FONT_DISPLAY, buildStudioColors } from '../buildStudioTokens'
import { IconBook, IconDownload } from './buildStudioIcons'
import { BsOutlineBtn, BsPrimaryBtn } from './buildStudioPrimitives'

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

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
  }
`

export const BuildStudioPageHeader: React.FC = () => (
  <Header data-bs-page-header>
    <Left>
      <Title>BUILD STUDIO</Title>
      <Subtitle>Build trusted economic infrastructure with AI assistance.</Subtitle>
    </Left>
    <BtnRow>
      <BsOutlineBtn type="button" $width="180px" $height="46px" data-bs-hero-guide>
        <IconBook size={16} />
        AI Infrastructure Guide
      </BsOutlineBtn>
      <BsPrimaryBtn type="button" $width="220px" $height="52px" data-bs-hero-import>
        <IconDownload size={16} color="#050505" />
        Import Existing Token
      </BsPrimaryBtn>
    </BtnRow>
  </Header>
)

export default BuildStudioPageHeader
