import React from 'react'
import styled from 'styled-components'
import { PROJECTS_ACTIVITY } from '../projectsStudioData'
import { PROJECTS_ACTIVITY_PREVIEW_LABEL, projectsStudioColors, projectsStudioLayout } from '../projectsStudioTokens'
import { PrPanel, PrPreviewBadge, ProjectLogo } from './projectsStudioPrimitives'

const Wrap = styled(PrPanel)`
  padding: 0;
  overflow: hidden;
`

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px;
  border-bottom: 1px solid ${projectsStudioColors.rowBorder};
`

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: ${projectsStudioColors.text};
`

const ViewAll = styled.button`
  border: none;
  background: none;
  color: ${projectsStudioColors.gold};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
`

const Table = styled.div`
  min-height: ${projectsStudioLayout.activityHeight};
`

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: 80px 1.1fr 1fr 1.4fr 0.9fr 100px;
  gap: 8px;
  padding: 0 20px;
  height: 36px;
  align-items: center;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${projectsStudioColors.muted};
  border-bottom: 1px solid ${projectsStudioColors.rowBorder};

  @media (max-width: 767px) {
    display: none;
  }
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 80px 1.1fr 1fr 1.4fr 0.9fr 100px;
  gap: 8px;
  padding: 0 20px;
  height: ${projectsStudioLayout.activityRowHeight};
  align-items: center;
  font-size: 13px;
  border-bottom: 1px solid ${projectsStudioColors.rowBorder};

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr 1fr;
    height: auto;
    padding: 12px 20px;
    gap: 4px;
  }
`

const ProjectCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
`

const Action = styled.span<{ $tone?: string }>`
  font-weight: 700;
  color: ${({ $tone }) =>
    $tone === 'green'
      ? projectsStudioColors.green
      : $tone === 'gold'
        ? projectsStudioColors.gold
        : projectsStudioColors.secondary};
`

const StatusPill = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  min-width: 80px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  justify-self: center;
  border: 1px solid
    ${({ $status }) =>
      $status === 'verified'
        ? projectsStudioColors.green
        : $status === 'indexed'
          ? projectsStudioColors.gold
          : projectsStudioColors.borderStrong};
  color: ${({ $status }) =>
    $status === 'verified'
      ? projectsStudioColors.green
      : $status === 'indexed'
        ? projectsStudioColors.gold
        : projectsStudioColors.muted};
  background: ${({ $status }) =>
    $status === 'verified'
      ? 'rgba(0,230,118,0.08)'
      : $status === 'indexed'
        ? projectsStudioColors.previewBadgeBg
        : 'rgba(255,255,255,0.04)'};
`

export const ProjectsActivityTable: React.FC = () => (
  <Wrap data-pr-activity $height="auto">
    <Head>
      <Title>Recent Project Activity</Title>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <PrPreviewBadge style={{ height: 20, padding: '0 8px', fontSize: 9 }}>
          {PROJECTS_ACTIVITY_PREVIEW_LABEL}
        </PrPreviewBadge>
        <ViewAll type="button">View all activity →</ViewAll>
      </div>
    </Head>
    <Table>
      <HeaderRow>
        <span>Time</span>
        <span>Project</span>
        <span>Action</span>
        <span>Details</span>
        <span>Source</span>
        <span>Status</span>
      </HeaderRow>
      {PROJECTS_ACTIVITY.map((row) => (
        <Row key={`${row.time}-${row.project}-${row.action}`}>
          <span style={{ color: projectsStudioColors.muted }}>{row.time}</span>
          <ProjectCell>
            <ProjectLogo name={row.project} symbol={row.projectSymbol} size={24} />
            {row.project}
          </ProjectCell>
          <Action $tone={row.actionTone}>{row.action}</Action>
          <span>{row.details}</span>
          <span style={{ color: projectsStudioColors.secondary }}>{row.source}</span>
          <StatusPill $status={row.status}>
            {row.status === 'verified' ? 'Verified' : row.status === 'indexed' ? 'Indexed' : 'Live'}
          </StatusPill>
        </Row>
      ))}
    </Table>
  </Wrap>
)

export default ProjectsActivityTable
