import React from 'react'
import styled from 'styled-components'
import { aiScoreColor } from '../trendingStudioData'
import { useTrendingRuntime } from '../trendingRuntime/TrendingRuntimeContext'
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

const ProjectCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

const ProjectName = styled.a`
  font-size: 15px;
  font-weight: 700;
  color: ${trendingStudioColors.white};
  text-decoration: none;

  &:hover {
    color: ${trendingStudioColors.gold};
  }
`

const AiScore = styled.span<{ $tone: 'green' | 'yellow' }>`
  font-size: 22px;
  font-weight: 800;
  color: ${({ $tone }) => ($tone === 'green' ? trendingStudioColors.green : trendingStudioColors.yellow)};
`

const UnavailableCell = styled.span`
  font-size: 12px;
  color: ${trendingStudioColors.gray};
`

function heatLabel(value: number): React.ReactNode {
  if (value <= 0) return <UnavailableCell>Unavailable</UnavailableCell>
  return <HeatBar $value={value} />
}

export const AIHeatmapTable: React.FC = () => {
  const { heatmap } = useTrendingRuntime()

  return (
    <Panel data-tr-panel data-tr-heatmap>
      <TrSectionTitle>Registry Heatmap</TrSectionTitle>
      <TableWrap>
        <Table>
          <thead>
            <tr>
              <Th>#</Th>
              <Th>Project</Th>
              <Th>Momentum</Th>
              <Th>Liquidity</Th>
              <Th>Holders</Th>
              <Th>Runtime Score</Th>
              <Th>Social</Th>
              <Th>Whales</Th>
              <Th>Volume</Th>
            </tr>
          </thead>
          <tbody>
            {heatmap.map((row) => {
              const tone = aiScoreColor(row.aiScore)
              const href = row.slug ? `/projects/${row.slug}` : undefined
              return (
                <tr key={`${row.project}-${row.rank}`}>
                  <Td>{row.rank}</Td>
                  <Td>
                    <ProjectCell>
                      <TrendingProjectLogo name={row.project} symbol={row.symbol} size={28} />
                      {href ? (
                        <ProjectName href={href}>{row.project}</ProjectName>
                      ) : (
                        <ProjectName as="span">{row.project}</ProjectName>
                      )}
                    </ProjectCell>
                  </Td>
                  <Td>{heatLabel(row.momentum)}</Td>
                  <Td>{heatLabel(row.liquidity)}</Td>
                  <Td>{heatLabel(row.holders)}</Td>
                  <Td>
                    <AiScore $tone={tone}>{row.aiScore > 0 ? row.aiScore : '—'}</AiScore>
                  </Td>
                  <Td>{heatLabel(row.social)}</Td>
                  <Td>{heatLabel(row.whales)}</Td>
                  <Td>{heatLabel(row.volume)}</Td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </TableWrap>
    </Panel>
  )
}

export default AIHeatmapTable
