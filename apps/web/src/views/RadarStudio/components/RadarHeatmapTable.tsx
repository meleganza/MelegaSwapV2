import React from 'react'
import styled from 'styled-components'
import { HEATMAP_PROJECTS } from '../radarStudioData'
import { RADAR_FONT_BODY, RADAR_FONT_DISPLAY, radarStudioColors, radarStudioLayout } from '../radarStudioTokens'
import { HeatBlocks, RadarProjectLogo, RdPanel, RdSectionTitle } from './radarStudioPrimitives'

const Panel = styled(RdPanel)`
  padding: 16px 18px;
  min-height: ${radarStudioLayout.heatmapHeight};
  display: flex;
  flex-direction: column;
`

const TableWrap = styled.div`
  flex: 1;
  min-height: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`

const Table = styled.table`
  width: 100%;
  min-width: 1100px;
  border-collapse: collapse;
`

const Th = styled.th`
  text-align: left;
  font-family: ${RADAR_FONT_BODY};
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${radarStudioColors.grey};
  padding: 0 6px 10px;
  white-space: nowrap;
`

const Td = styled.td`
  padding: 6px;
  vertical-align: middle;
`

const ProjectCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 12px;
  font-weight: 700;
  color: ${radarStudioColors.white};
`

const METRICS = [
  { key: 'liquidity', label: 'Liquidity', invert: false },
  { key: 'volume', label: 'Volume', invert: false },
  { key: 'whales', label: 'Whales', invert: false },
  { key: 'holders', label: 'Holders', invert: false },
  { key: 'age', label: 'Age', invert: false },
  { key: 'social', label: 'Social', invert: false },
  { key: 'developers', label: 'Developers', invert: false },
  { key: 'audit', label: 'Audit', invert: false },
  { key: 'contract', label: 'Contract', invert: false },
  { key: 'momentum', label: 'Momentum', invert: false },
  { key: 'community', label: 'Community', invert: false },
  { key: 'risk', label: 'Risk', invert: true },
] as const

export const RadarHeatmapTable: React.FC = () => (
  <Panel data-rd-panel data-rd-heatmap>
    <RdSectionTitle>AI Heatmap</RdSectionTitle>
    <TableWrap>
      <Table>
        <thead>
          <tr>
            <Th>#</Th>
            <Th>Project</Th>
            {METRICS.map((m) => (
              <Th key={m.key}>{m.label}</Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HEATMAP_PROJECTS.map((row) => (
            <tr key={row.name} data-rd-heatmap-row>
              <Td>{row.rank}</Td>
              <Td>
                <ProjectCell>
                  <RadarProjectLogo name={row.name} symbol={row.symbol} size={22} />
                  {row.name}
                </ProjectCell>
              </Td>
              {METRICS.map((m) => (
                <Td key={m.key}>
                  <HeatBlocks value={row[m.key]} invert={m.invert} count={12} />
                </Td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrap>
  </Panel>
)

export default RadarHeatmapTable
