import React from 'react'
import styled from 'styled-components'
import { HEATMAP_PROJECTS } from '../radarStudioData'
import { RADAR_FONT, radarStudioColors, radarStudioLayout } from '../radarStudioTokens'
import { HeatBlocks, RadarProjectLogo, RdPanel, RdSectionTitle } from './radarStudioPrimitives'

const Panel = styled(RdPanel)`
  padding: 16px 18px;
  height: ${radarStudioLayout.heatmapHeight};
  min-height: ${radarStudioLayout.heatmapHeight};
  display: flex;
  flex-direction: column;
`

const Legend = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 10px;
  font-family: ${RADAR_FONT};
  font-size: 10px;
  font-weight: 600;
  color: ${radarStudioColors.grey};
`

const TableWrap = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: ${RADAR_FONT};
  font-size: 12px;
`

const Th = styled.th`
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${radarStudioColors.grey};
  padding: 0 8px 8px;
  white-space: nowrap;
`

const Td = styled.td`
  padding: 6px 8px;
  color: ${radarStudioColors.white};
  vertical-align: middle;
`

const ProjectCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const RadarHeatmapTable: React.FC = () => (
  <Panel data-rd-panel data-rd-heatmap>
    <RdSectionTitle>AI Heatmap</RdSectionTitle>
    <Legend>
      <span style={{ color: radarStudioColors.green }}>Low Risk</span>
      <span>→</span>
      <span style={{ color: radarStudioColors.red }}>High Risk</span>
    </Legend>
    <TableWrap>
      <Table>
        <thead>
          <tr>
            <Th>#</Th>
            <Th>Project</Th>
            <Th>Liquidity</Th>
            <Th>Volume</Th>
            <Th>Whales</Th>
            <Th>Holders</Th>
            <Th>Social</Th>
            <Th>Momentum</Th>
            <Th>Developer</Th>
            <Th>Audit</Th>
            <Th>Risk</Th>
          </tr>
        </thead>
        <tbody>
          {HEATMAP_PROJECTS.map((row) => (
            <tr key={row.name}>
              <Td>{row.rank}</Td>
              <Td>
                <ProjectCell>
                  <RadarProjectLogo name={row.name} symbol={row.symbol} size={24} />
                  {row.name}
                </ProjectCell>
              </Td>
              <Td>
                <HeatBlocks value={row.liquidity} />
              </Td>
              <Td>
                <HeatBlocks value={row.volume} />
              </Td>
              <Td>
                <HeatBlocks value={row.whales} />
              </Td>
              <Td>
                <HeatBlocks value={row.holders} />
              </Td>
              <Td>
                <HeatBlocks value={row.social} />
              </Td>
              <Td>
                <HeatBlocks value={row.momentum} />
              </Td>
              <Td>
                <HeatBlocks value={row.developer} />
              </Td>
              <Td>
                <HeatBlocks value={row.audit} />
              </Td>
              <Td>
                <HeatBlocks value={row.risk} invert />
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrap>
  </Panel>
)

export default RadarHeatmapTable
