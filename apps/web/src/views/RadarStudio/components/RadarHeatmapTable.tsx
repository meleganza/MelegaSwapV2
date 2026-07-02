import React from 'react'
import styled from 'styled-components'
import { HEATMAP_PROJECTS } from '../radarStudioData'
import { RADAR_FONT_BODY, RADAR_FONT_DISPLAY, radarStudioColors, radarStudioLayout } from '../radarStudioTokens'
import { HeatBlocks, RadarProjectLogo, RdPanel } from './radarStudioPrimitives'

const Panel = styled(RdPanel)`
  width: 100%;
  min-height: ${radarStudioLayout.heatmapMinHeight};
  margin-top: ${radarStudioLayout.heatmapMarginTop};
  padding: 18px;
  background: ${radarStudioColors.panelAlt};
  border: 1px solid rgba(212, 175, 55, 0.58);
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
`

const Title = styled.h2`
  margin: 0;
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 26px;
  font-weight: 800;
  color: ${radarStudioColors.white};
`

const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: ${RADAR_FONT_BODY};
  font-size: 11px;
  color: ${radarStudioColors.muted};
`

const TableWrap = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`

const Table = styled.table`
  width: 100%;
  min-width: 1360px;
  border-collapse: collapse;
`

const Th = styled.th<{ $w?: string }>`
  width: ${({ $w }) => $w || '120px'};
  min-width: 100px;
  text-align: left;
  font-family: ${RADAR_FONT_BODY};
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${radarStudioColors.label};
  padding: 0 6px 10px;
  white-space: nowrap;
`

const Td = styled.td`
  padding: 8px 6px;
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
    <Header>
      <Title>AI Heatmap</Title>
      <Legend>
        <span style={{ color: radarStudioColors.green }}>Low Risk</span>
        <span>→</span>
        <span style={{ color: radarStudioColors.red }}>High Risk</span>
      </Legend>
    </Header>
    <TableWrap>
      <Table>
        <thead>
          <tr>
            <Th $w="40px">#</Th>
            <Th $w="120px">Project</Th>
            {METRICS.map((m) => (
              <Th key={m.key} $w="120px">
                {m.label}
              </Th>
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
