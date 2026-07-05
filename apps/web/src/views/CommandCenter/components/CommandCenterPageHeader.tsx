import React from 'react'
import styled from 'styled-components'
import { CC_FONT_BODY, CC_FONT_DISPLAY, commandCenterColors } from '../commandCenterTokens'

const Wrap = styled.header`
  margin-bottom: 4px;
`

const Title = styled.h1`
  margin: 0;
  font-family: ${CC_FONT_DISPLAY};
  font-size: 36px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: ${commandCenterColors.white};

  @media (max-width: 768px) {
    font-size: 28px;
  }
`

const Subtitle = styled.p`
  margin: 8px 0 0;
  max-width: 720px;
  font-family: ${CC_FONT_BODY};
  font-size: 15px;
  line-height: 24px;
  color: ${commandCenterColors.subtitle};
`

export const CommandCenterPageHeader: React.FC = () => (
  <Wrap data-cc-page-header>
    <Title>COMMAND CENTER</Title>
    <Subtitle>Everything you own, build, earn and operate across the Melega ecosystem.</Subtitle>
  </Wrap>
)

export default CommandCenterPageHeader
