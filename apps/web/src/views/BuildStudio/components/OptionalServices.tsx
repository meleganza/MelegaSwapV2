import React from 'react'
import styled from 'styled-components'
import { OPTIONAL_SERVICES } from '../buildStudioData'
import { BS_FONT_BODY, BS_FONT_DISPLAY, buildStudioColors, buildStudioLayout } from '../buildStudioTokens'
import { BsBody } from './buildStudioPrimitives'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const Card = styled.div`
  padding: 16px;
  border-radius: 16px;
  border: 1px solid ${buildStudioColors.border};
  background: ${buildStudioColors.panel};
  transition: transform ${buildStudioLayout.btnTransition} ease, border-color ${buildStudioLayout.transition} ease;

  &:hover {
    border-color: ${buildStudioColors.gold};
    transform: translateY(-${buildStudioLayout.cardLift});
  }
`

const Title = styled.h4`
  margin: 0 0 6px;
  font-family: ${BS_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  color: ${buildStudioColors.white};
`

const Activation = styled.div`
  margin-top: 8px;
  font-family: ${BS_FONT_BODY};
  font-size: 11px;
  font-weight: 600;
  color: ${buildStudioColors.gold};
`

const SectionTitle = styled.h2`
  margin: 0 0 4px;
  font-family: ${BS_FONT_DISPLAY};
  font-size: 28px;
  font-weight: 600;
  color: ${buildStudioColors.white};
`

const SectionSub = styled.p`
  margin: 0 0 16px;
  font-family: ${BS_FONT_BODY};
  font-size: 14px;
  color: ${buildStudioColors.muted};
`

export const OptionalServices: React.FC = () => (
  <div data-bs-optional-services>
    <SectionTitle>Infrastructure Extensions</SectionTitle>
    <SectionSub>Services</SectionSub>
    <Grid>
      {OPTIONAL_SERVICES.map((svc) => (
        <Card key={svc.id} data-bs-panel>
          <Title>{svc.title}</Title>
          <BsBody style={{ fontSize: 13, lineHeight: '20px' }}>{svc.purpose}</BsBody>
          <Activation>Est. activation: {svc.activationTime}</Activation>
        </Card>
      ))}
    </Grid>
  </div>
)

export default OptionalServices
