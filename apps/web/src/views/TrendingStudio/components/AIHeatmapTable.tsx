import React from 'react'
import styled from 'styled-components'
import { HEATMAP_ROWS, aiScoreColor } from '../trendingStudioData'
import { trendingStudioColors, trendingStudioLayout } from '../trendingStudioTokens'
import { HeatBar, TrPanel, TrSectionTitle, TrendingProjectLogo } from './trendingStudioPrimitives'

const Panel = styled(TrPanel)`
  padding: 16px 18px;
  height: ${trendingStudioLayout.heatmapHeight};
  min-height: ${trendingStudioLayout.heatmapHeight};
  display: flex;
  flex-direction: column;
`

const TableWrap = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`

const Th = styled.th`
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${trendingStudioColors.gray};
  padding: 0 8px 10px;
  white-space: nowrap;
`

const Td = styled.td`
  padding: 8px;
  color: ${trendingStudioColors.white};
  vertical-align: middle;
  white-space: nowrap;
`

const Row = styled.tr`
  transition: background 150ms ease;
`

const ProjectCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

const ProjectName = styled.span`
  font-size: 15px;
  font-weight: 700;
`

const AiScore = styled.span<{ $tone: 'green' | 'yellow' }>`
  font-size: 22px;
  font-weight: 800;
  color: ${({ $tone }) => ($tone === 'green' ? trendingStudioColors.green : trendingStudioColors.yellow)};
`

export const AIHeatmapTable: React.FC = () => (
  <Panel data-tr-panel data-tr-heatmap>
    <TrSectionTitle>AI Heatmap</TrSectionTitle>
    <TableWrap>
      <Table>
        <thead>
          <tr>
            <Th>#</Th>
            <Th>Project</Th>
            <Th>Momentum</Th>
            <Th>Liquidity</Th>
            <Th>Holders</Th>
            <Th>AI Score</Th>
            <Th>Social</Th>
            <Th>Whales</Th>
            <Th>Volume</Th>
          </tr>
        </thead>
        <tbody>
          {HEATMAP_ROWS.map((row) => (
            <Row key={row.project} data-tr-heat-row>
              <Td>{row.rank}</Td>
              <Td>
                <ProjectCell>
                  <TrendingProjectLogo name={row.project} symbol={row.symbol} size={28} />
                  <ProjectName>{row.project}</ProjectName>
                </ProjectCell>
              </Td>
              <Td>
                <HeatBar value={row.momentum} />
              </Td>
              <Td>
                <HeatBar value={row.liquidity} />
              </Td>
              <Td>
                <HeatBar value={row.holders} />
              </Td>
              <Td>
                <AiScore $tone={aiScoreColor(row.aiScore)}>{row.aiScore}</AiScore>
              </Td>
              <Td>
                <HeatBar value={row.social} />
              </Td>
              <Td>
                <HeatBar value={row.whales} />
              </Td>
              <Td>
                <HeatBar value={row.volume} />
              </Td>
            </Row>
          ))}
        </tbody>
      </Table>
    </TableWrap>
  </Panel>
)

export default AIHeatmapTable
