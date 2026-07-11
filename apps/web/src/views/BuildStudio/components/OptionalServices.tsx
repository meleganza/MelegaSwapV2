import React from 'react'
import styled from 'styled-components'
import { premiumUiValue } from 'design-system/melega/tokens/premiumStudio'
import { NAV_COMING_SOON_LABEL } from 'lib/navigation/comingSoon'
import { useBuildRuntime } from '../buildRuntime/BuildRuntimeContext'
import { BS_FONT_BODY, BS_FONT_DISPLAY, buildStudioColors } from '../buildStudioTokens'
import { BsBody, BsComingSoonBadge } from './buildStudioPrimitives'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const Card = styled.a`
  padding: 16px;
  border-radius: 16px;
  border: 1px solid ${buildStudioColors.border};
  background: ${buildStudioColors.panel};
  transition: border-color 180ms ease;
  text-decoration: none;
  display: block;
  color: inherit;

  &:hover {
    border-color: ${buildStudioColors.gold};
  }
`

const DisabledCard = styled.div`
  padding: 16px;
  border-radius: 16px;
  border: 1px solid ${buildStudioColors.border};
  background: ${buildStudioColors.panel};
  display: block;
  color: inherit;
  opacity: 0.72;
  cursor: default;
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

const Status = styled.div`
  margin-top: 4px;
  font-size: 11px;
  color: ${({ $available }: { $available: boolean }) => ($available ? buildStudioColors.green : buildStudioColors.muted)};
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

export const OptionalServices: React.FC = () => {
  const { extensions } = useBuildRuntime()

  return (
    <div data-bs-optional-services>
      <SectionTitle>Infrastructure Extensions</SectionTitle>
      <SectionSub>Services</SectionSub>
      <Grid>
        {extensions.map((svc) => {
          const content = (
            <>
              <Title>{svc.title}</Title>
              <BsBody style={{ fontSize: 13, lineHeight: '20px' }}>{svc.purpose}</BsBody>
              <Activation>Est. activation: {svc.activationTime}</Activation>
              <Status $available={svc.available}>
                {premiumUiValue(svc.status)} · {svc.requirements}
              </Status>
              {!svc.href ? <BsComingSoonBadge>{NAV_COMING_SOON_LABEL}</BsComingSoonBadge> : null}
            </>
          )
          if (!svc.href) {
            return (
              <DisabledCard key={svc.id} data-bs-panel title="Coming soon">
                {content}
              </DisabledCard>
            )
          }
          return (
            <Card key={svc.id} data-bs-panel href={svc.href}>
              {content}
            </Card>
          )
        })}
      </Grid>
    </div>
  )
}

export default OptionalServices
