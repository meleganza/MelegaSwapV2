import React from 'react'
import styled from 'styled-components'
import { RECENT_BUILDS } from '../buildStudioData'
import { BS_FONT_BODY, buildStudioColors, buildStudioLayout } from '../buildStudioTokens'
import { BsPanel, BsSectionTitle, BsStatusChip } from './buildStudioPrimitives'

const Inner = styled.div`
  padding: 0;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`

const Table = styled.div`
  flex: 1;
  overflow: auto;
`

const Head = styled.div`
  display: grid;
  grid-template-columns: 80px 1.1fr 1fr 0.9fr 80px 1fr 1fr 70px;
  gap: 10px;
  padding: 14px 24px;
  border-bottom: 1px solid ${buildStudioColors.border};
  font-family: ${BS_FONT_BODY};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: ${buildStudioColors.label};
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 80px 1.1fr 1fr 0.9fr 80px 1fr 1fr 70px;
  gap: 10px;
  padding: 14px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  font-family: ${BS_FONT_BODY};
  font-size: 13px;
  color: ${buildStudioColors.body};
  animation: fadeIn 300ms ease-out both;

  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

const Status = styled.span<{ $ready?: boolean }>`
  color: ${({ $ready }) => ($ready ? buildStudioColors.green : buildStudioColors.yellow)};
  font-weight: 700;
`

const Verified = styled.span<{ $verified: boolean }>`
  color: ${({ $verified }) => ($verified ? buildStudioColors.green : buildStudioColors.gray)};
  font-weight: 700;
  font-size: 12px;
`

const TitleWrap = styled.div`
  padding: 20px 24px 0;
`

export const RecentBuildsTable: React.FC = () => (
  <BsPanel data-bs-panel data-bs-recent-builds $height={buildStudioLayout.recentBuildsH}>
    <Inner>
      <TitleWrap>
        <BsSectionTitle>Recent Builds</BsSectionTitle>
      </TitleWrap>
      <Table>
        <Head>
          <span>Time</span>
          <span>Action</span>
          <span>Project</span>
          <span>Builder</span>
          <span>Status</span>
          <span>Infrastructure</span>
          <span>Execution Status</span>
          <span>AI Verified</span>
        </Head>
        {RECENT_BUILDS.map((row, i) => (
          <Row key={row.id} style={{ animationDelay: `${i * 60}ms` }}>
            <span>{row.time}</span>
            <span style={{ color: buildStudioColors.white, fontWeight: 600 }}>{row.action}</span>
            <span>{row.project}</span>
            <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{row.builder}</span>
            <Status $ready={row.status === 'Ready' || row.status === 'Validated'}>{row.status}</Status>
            <span>{row.infrastructure}</span>
            <BsStatusChip $status={row.executionStatusTone}>{row.executionStatus}</BsStatusChip>
            <Verified $verified={row.aiVerified}>{row.aiVerified ? 'Yes' : 'No'}</Verified>
          </Row>
        ))}
      </Table>
    </Inner>
  </BsPanel>
)

export default RecentBuildsTable
