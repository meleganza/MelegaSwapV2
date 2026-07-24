import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { passportOne } from './passportTokens'
import type { PassportProjectCardModel } from './passportProjectsTypes'

const Card = styled.article`
  width: ${passportOne.projectsCardW};
  height: ${passportOne.projectsCardH};
  box-sizing: border-box;
  border-radius: 12px;
  border: 1px solid ${passportOne.border};
  background: ${passportOne.card};
  padding: 12px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  flex-shrink: 0;

  @media (max-width: 1199px) {
    width: 100%;
    max-width: none;
    height: auto;
    min-height: 144px;
  }
`

const Top = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
`

const Logo = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid ${passportOne.borderStrong};
  background: ${passportOne.elevated};
  color: ${passportOne.gold};
  font-size: 11px;
  font-weight: 750;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const Meta = styled.div`
  min-width: 0;
  flex: 1;
`

const Name = styled.div`
  font-size: 14px;
  line-height: 18px;
  font-weight: 750;
  color: ${passportOne.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Category = styled.div`
  margin-top: 2px;
  font-size: 11px;
  line-height: 14px;
  color: ${passportOne.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Status = styled.div`
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  font-size: 11px;
  line-height: 14px;
`

const Chip = styled.span`
  color: ${passportOne.muted};
  font-weight: 650;
  letter-spacing: 0.02em;
`

const ChipValue = styled.span`
  color: ${passportOne.text};
  font-weight: 700;
`

const Kpi = styled.div`
  margin-top: 8px;
  min-width: 0;
`

const KpiLabel = styled.div`
  font-size: 10px;
  line-height: 13px;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${passportOne.muted};
`

const KpiValue = styled.div`
  margin-top: 2px;
  font-size: 16px;
  line-height: 20px;
  font-weight: 750;
  color: ${passportOne.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Action = styled(Link)`
  margin-top: auto;
  height: 32px;
  border-radius: 8px;
  border: 1px solid ${passportOne.borderStrong};
  background: ${passportOne.elevated};
  color: ${passportOne.text};
  font-size: 12px;
  line-height: 16px;
  font-weight: 650;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${passportOne.gold};
    outline-offset: 2px;
  }
`

export const PassportProjectCard: React.FC<{ project: PassportProjectCardModel }> = ({ project }) => (
  <Card data-testid="passport-project-card" data-project-status={project.status} data-project-role={project.role}>
    <Top>
      <Logo aria-hidden="true">{project.logoLabel}</Logo>
      <Meta>
        <Name title={project.name}>{project.name}</Name>
        <Category>{project.category}</Category>
      </Meta>
    </Top>
    <Status>
      <span>
        <Chip>Status </Chip>
        <ChipValue>{project.status}</ChipValue>
      </span>
      <span>
        <Chip>Role </Chip>
        <ChipValue>{project.role}</ChipValue>
      </span>
    </Status>
    <Kpi>
      <KpiLabel>{project.kpiLabel}</KpiLabel>
      <KpiValue data-testid="passport-project-kpi">{project.kpiValue}</KpiValue>
    </Kpi>
    <Action href={project.actionHref} data-testid="passport-project-action" data-action-kind={project.actionKind}>
      {project.actionLabel}
    </Action>
  </Card>
)

export default PassportProjectCard
