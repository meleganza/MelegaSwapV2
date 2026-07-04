import React, { useState } from 'react'
import styled from 'styled-components'
import { HEATMAP_METRICS, HEATMAP_TOOLTIPS } from '../radarStudioData'
import { useRadarRuntime } from '../radarRuntime/RadarRuntimeContext'
import { RADAR_FONT_BODY, RADAR_FONT_DISPLAY, radarStudioColors, radarStudioLayout } from '../radarStudioTokens'
import { HeatBlocks, RadarProjectLogo, RdPanel } from './radarStudioPrimitives'

const Panel = styled(RdPanel)`
  width: 100%;
  min-height: ${radarStudioLayout.heatmapMinHeight};
  margin-top: ${radarStudioLayout.heatmapMarginTop};
  padding: ${radarStudioLayout.cardPadding};
  border-color: rgba(212, 175, 55, 0.58);
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
  font-weight: 500;
  color: ${radarStudioColors.muted};
`

const TableWrap = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  max-width: 100%;
  min-width: 0;

  @media (max-width: 767px) {
    margin: 0;
  }
`

const Table = styled.table`
  width: 100%;
  min-width: 100%;
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
  font-weight: 800;
  color: ${radarStudioColors.white};
`

const TooltipWrap = styled.span`
  position: relative;
  display: inline-flex;
  cursor: default;

  &:hover [data-rd-heat-tip] {
    opacity: 1;
    visibility: visible;
  }
`

const Tooltip = styled.span`
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  width: 160px;
  padding: 6px 8px;
  border-radius: 8px;
  background: #1a1a1a;
  border: 1px solid ${radarStudioColors.border};
  font-family: ${RADAR_FONT_BODY};
  font-size: 10px;
  line-height: 14px;
  font-weight: 500;
  color: ${radarStudioColors.secondary};
  opacity: 0;
  visibility: hidden;
  transition: opacity ${radarStudioColors.transition} ease;
  z-index: 3;
  pointer-events: none;
`

export const RadarHeatmapTable: React.FC = () => {
  const { heatmap } = useRadarRuntime()
  const [tip, setTip] = useState<string | null>(null)

  return (
    <Panel data-rd-panel data-rd-heatmap>
      <Header>
        <Title>AI Heatmap</Title>
        <Legend>
          <span style={{ color: radarStudioColors.heatInactive }}>Unavailable</span>
          <span>→</span>
          <span style={{ color: radarStudioColors.green }}>Available</span>
        </Legend>
      </Header>
      <TableWrap>
        <Table>
          <thead>
            <tr>
              <Th $w="40px">#</Th>
              <Th $w="120px">Project</Th>
              {HEATMAP_METRICS.map((m) => (
                <Th key={m.key} $w="120px" title={HEATMAP_TOOLTIPS[m.key]}>
                  {m.label}
                </Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmap.map((row) => (
              <tr key={row.name} data-rd-heatmap-row>
                <Td>{row.rank}</Td>
                <Td>
                  <ProjectCell>
                    <RadarProjectLogo name={row.name} symbol={row.symbol} size={22} />
                    {row.name}
                  </ProjectCell>
                </Td>
                {HEATMAP_METRICS.map((m) => {
                  const val = row[m.key as keyof typeof row] as number
                  const invert = 'invert' in m && m.invert
                  const label = val <= 0 ? 'Unavailable' : 'Available'
                  return (
                    <Td key={m.key}>
                      <TooltipWrap
                        onMouseEnter={() => setTip(`${row.name} · ${m.label}: ${label}`)}
                        onMouseLeave={() => setTip(null)}
                      >
                        <HeatBlocks value={val} invert={!!invert} count={12} />
                        <Tooltip data-rd-heat-tip role="tooltip">
                          {label} — {HEATMAP_TOOLTIPS[m.key]}
                        </Tooltip>
                      </TooltipWrap>
                    </Td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
      {tip ? (
        <div
          style={{
            marginTop: 8,
            fontFamily: RADAR_FONT_BODY,
            fontSize: 11,
            color: radarStudioColors.muted,
          }}
          aria-live="polite"
        >
          {tip}
        </div>
      ) : null}
    </Panel>
  )
}

export default RadarHeatmapTable
