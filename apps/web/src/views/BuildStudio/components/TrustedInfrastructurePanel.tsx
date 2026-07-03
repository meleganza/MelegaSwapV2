import React from 'react'
import styled from 'styled-components'
import { TRUSTED_INFRASTRUCTURE_COPY } from '../buildStudioData'
import { BS_FONT_BODY, BS_FONT_DISPLAY, buildStudioColors, buildStudioLayout } from '../buildStudioTokens'

const Panel = styled.section`
  padding: 24px 28px;
  border-radius: ${buildStudioLayout.cardRadius};
  border: 1px solid rgba(214, 180, 69, 0.28);
  background: linear-gradient(135deg, rgba(214, 180, 69, 0.06) 0%, rgba(19, 19, 19, 0.95) 60%);
`

const Title = styled.h3`
  margin: 0 0 10px;
  font-family: ${BS_FONT_DISPLAY};
  font-size: 22px;
  font-weight: 700;
  color: ${buildStudioColors.gold};
`

const Text = styled.p`
  margin: 0;
  font-family: ${BS_FONT_BODY};
  font-size: 15px;
  line-height: 24px;
  color: ${buildStudioColors.body};
  max-width: 900px;
`

export const TrustedInfrastructurePanel: React.FC = () => (
  <Panel data-bs-trusted-infrastructure>
    <Title>{TRUSTED_INFRASTRUCTURE_COPY.title}</Title>
    <Text>{TRUSTED_INFRASTRUCTURE_COPY.text}</Text>
  </Panel>
)

export default TrustedInfrastructurePanel
