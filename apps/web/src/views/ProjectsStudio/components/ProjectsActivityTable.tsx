import React from 'react'
import styled from 'styled-components'
import { PR_FONT_BODY, PR_FONT_DISPLAY, projectsStudioColors, projectsStudioLayout } from '../projectsStudioTokens'
import { useProjectsRuntime } from '../projectsRuntime/ProjectsRuntimeContext'
import { PrPanel } from './projectsStudioPrimitives'

const Panel = styled(PrPanel)`
  height: ${projectsStudioLayout.activityHeight};
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const Title = styled.h3`
  margin: 0 0 16px;
  font-family: ${PR_FONT_DISPLAY};
  font-size: 18px;
  font-weight: 700;
  color: ${projectsStudioColors.text};
`

const List = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-left: ${projectsStudioLayout.activityListPaddingLeft};
`

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  height: ${projectsStudioLayout.activityRowHeight};
  min-height: ${projectsStudioLayout.activityRowHeight};
  border-bottom: 1px solid ${projectsStudioColors.divider};

  &:last-child {
    border-bottom: none;
  }
`

const Dot = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${projectsStudioColors.gold};
  flex-shrink: 0;
`

const Middle = styled.div`
  flex: 1;
  min-width: 0;
`

const EventTitle = styled.div`
  font-family: ${PR_FONT_BODY};
  font-size: 15px;
  font-weight: 700;
  color: ${projectsStudioColors.text};
  line-height: 1.3;
`

const EventSub = styled.div`
  font-family: ${PR_FONT_BODY};
  font-size: 13px;
  font-weight: 400;
  color: ${projectsStudioColors.muted};
  line-height: 1.3;
`

const Right = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;
  margin-left: auto;
`

const StatusPill = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 12px;
  font-family: ${PR_FONT_BODY};
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  border: 1px solid
    ${({ $status }) =>
      $status === 'verified' ? projectsStudioColors.green : projectsStudioColors.cardBorder};
  color: ${({ $status }) =>
    $status === 'verified' ? projectsStudioColors.green : projectsStudioColors.muted};
  background: ${({ $status }) =>
    $status === 'verified' ? 'rgba(27,231,122,0.08)' : 'transparent'};
`

const Time = styled.span`
  font-family: ${PR_FONT_BODY};
  font-size: 13px;
  color: ${projectsStudioColors.muted};
`

export const ProjectsActivityTable: React.FC = () => {
  const { terminal } = useProjectsRuntime()
  const rows = terminal.rows

  return (
    <Panel data-pr-activity>
      <Title>Recent Project Activity</Title>
      <List>
        {rows.length === 0 ? (
          <Row>
            <Dot aria-hidden />
            <Middle>
              <EventTitle>No activity indexed</EventTitle>
              <EventSub>{terminal.label ?? 'Events appear here as projects are indexed.'}</EventSub>
            </Middle>
          </Row>
        ) : (
          rows.map((row) => (
            <Row key={`${row.time}-${row.project}-${row.action}`}>
              <Dot aria-hidden />
              <Middle>
                <EventTitle>{row.action}</EventTitle>
                <EventSub>
                  {row.project} · {row.details}
                </EventSub>
              </Middle>
              <Right>
                <StatusPill $status={row.status}>
                  {row.status === 'verified' ? 'Verified' : row.status === 'indexed' ? 'Indexed' : 'Live'}
                </StatusPill>
                <Time>{row.time}</Time>
              </Right>
            </Row>
          ))
        )}
      </List>
    </Panel>
  )
}

export default ProjectsActivityTable
