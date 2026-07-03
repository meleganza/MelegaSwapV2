import React from 'react'
import styled from 'styled-components'
import { TRUSTED_INFRASTRUCTURE_COPY } from '../buildStudioData'
import { BS_FONT_BODY, BS_FONT_DISPLAY, buildStudioColors, buildStudioLayout } from '../buildStudioTokens'

const Banner = styled.section`
  padding: 24px;
  border-radius: ${buildStudioLayout.cardRadius};
  border: 1px solid rgba(214, 180, 69, 0.35);
  background: rgba(214, 180, 69, 0.06);
  text-align: center;
`

const Title = styled.h3`
  margin: 0 0 8px;
  font-family: ${BS_FONT_DISPLAY};
  font-size: 18px;
  font-weight: 700;
  color: ${buildStudioColors.gold};
`

const Text = styled.p`
  margin: 0;
  font-family: ${BS_FONT_BODY};
  font-size: 14px;
  line-height: 22px;
  color: ${buildStudioColors.body};
  max-width: 720px;
  margin-inline: auto;
`

export const ConstitutionalBanner: React.FC = () => (
  <Banner data-bs-constitutional>
    <Title>{TRUSTED_INFRASTRUCTURE_COPY.title}</Title>
    <Text>{TRUSTED_INFRASTRUCTURE_COPY.text}</Text>
  </Banner>
)

export default ConstitutionalBanner
