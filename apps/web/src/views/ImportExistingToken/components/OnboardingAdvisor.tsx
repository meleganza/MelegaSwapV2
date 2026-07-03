import React from 'react'
import styled from 'styled-components'
import { ADVISOR_DATA } from '../importTokenData'
import { IT_FONT_BODY, IT_FONT_DISPLAY, importTokenColors } from '../importTokenTokens'
import { IconExternal, IconWarning } from './importTokenIcons'
import { ItPanel } from './importTokenPrimitives'

const Panel = styled(ItPanel)`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: sticky;
  top: 24px;

  @media (max-width: 768px) {
    position: static;
  }
`

const Title = styled.h3`
  margin: 0;
  font-family: ${IT_FONT_DISPLAY};
  font-size: 18px;
  font-weight: 700;
  color: ${importTokenColors.white};
`

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-family: ${IT_FONT_BODY};
  font-size: 13px;

  &:last-of-type {
    border-bottom: none;
  }
`

const RowLabel = styled.span`
  color: ${importTokenColors.label};
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`

const RowValue = styled.span`
  color: ${importTokenColors.white};
  font-weight: 600;
  text-align: right;
`

const WarningList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const WarningItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-family: ${IT_FONT_BODY};
  font-size: 12px;
  color: ${importTokenColors.yellow};
`

const MissingList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

const Chip = styled.span`
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid ${importTokenColors.border};
  font-family: ${IT_FONT_BODY};
  font-size: 10px;
  color: ${importTokenColors.muted};
`

const SpaceCta = styled.div`
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid ${importTokenColors.border};
  text-align: center;
`

const SpaceLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 44px;
  border-radius: 14px;
  border: 1px solid ${importTokenColors.gold};
  background: ${importTokenColors.goldBg};
  color: ${importTokenColors.gold};
  font-family: ${IT_FONT_BODY};
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 150ms ease;

  &:hover {
    transform: scale(1.02);
  }
`

const SpaceText = styled.p`
  margin: 0 0 10px;
  font-family: ${IT_FONT_BODY};
  font-size: 13px;
  color: ${importTokenColors.body};
`

const a = ADVISOR_DATA

export const OnboardingAdvisor: React.FC = () => (
  <Panel data-iet-advisor>
    <Title>AI Onboarding Advisor</Title>
    <Row>
      <RowLabel>Project Health</RowLabel>
      <RowValue>{a.projectHealth}</RowValue>
    </Row>
    <Row>
      <RowLabel>Infrastructure Score</RowLabel>
      <RowValue style={{ color: importTokenColors.green }}>{a.infrastructureScore}%</RowValue>
    </Row>
    <Row>
      <RowLabel>Next Recommended Action</RowLabel>
      <RowValue>{a.nextAction}</RowValue>
    </Row>
    <Row>
      <RowLabel>AI Confidence</RowLabel>
      <RowValue style={{ color: importTokenColors.green }}>{a.confidence}%</RowValue>
    </Row>
    <div>
      <RowLabel style={{ display: 'block', marginBottom: 8 }}>Warnings</RowLabel>
      <WarningList>
        {a.warnings.map((w) => (
          <WarningItem key={w}>
            <IconWarning size={14} />
            {w}
          </WarningItem>
        ))}
      </WarningList>
    </div>
    <div>
      <RowLabel style={{ display: 'block', marginBottom: 8 }}>Top Missing Items</RowLabel>
      <MissingList>
        {a.missingItems.map((m) => (
          <Chip key={m}>{m}</Chip>
        ))}
      </MissingList>
    </div>
    <SpaceCta>
      <SpaceText>Need professional due diligence?</SpaceText>
      <SpaceLink href="https://space.melega.io" target="_blank" rel="noopener noreferrer">
        Open Melega Space <IconExternal size={14} />
      </SpaceLink>
    </SpaceCta>
  </Panel>
)

export default OnboardingAdvisor
