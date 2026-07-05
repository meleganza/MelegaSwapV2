import React, { useState } from 'react'
import styled from 'styled-components'
import { useRadarRuntime } from '../radarRuntime/RadarRuntimeContext'
import { RADAR_FONT_BODY, RADAR_FONT_DISPLAY, radarStudioColors, radarStudioLayout } from '../radarStudioTokens'
import { RdPanel } from './radarStudioPrimitives'

const Panel = styled(RdPanel)<{ $expanded?: boolean }>`
  min-height: ${radarStudioLayout.machineCollapsedHeight};
  padding: 0 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const Header = styled.button`
  height: ${radarStudioLayout.machineCollapsedHeight};
  min-height: ${radarStudioLayout.machineCollapsedHeight};
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  cursor: pointer;
  padding: 0;
  color: ${radarStudioColors.text};
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 16px;
  font-weight: 700;
  text-align: left;
`

const Chevron = styled.span<{ $open?: boolean }>`
  color: ${radarStudioColors.gold};
  transform: ${({ $open }) => ($open ? 'rotate(180deg)' : 'rotate(0)')};
  transition: transform 180ms ease;
`

const Body = styled.pre`
  margin: 0 0 20px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid ${radarStudioColors.cardBorder};
  background: #0a0a0a;
  font-family: ${RADAR_FONT_BODY};
  font-size: 12px;
  line-height: 1.45;
  color: ${radarStudioColors.secondary};
  overflow: auto;
  max-height: 320px;
`

export const RadarMachineSummaryPanel: React.FC = () => {
  const { machine } = useRadarRuntime()
  const [open, setOpen] = useState(false)

  return (
    <Panel data-rd-machine-summary $expanded={open}>
      <Header type="button" onClick={() => setOpen((v) => !v)}>
        Machine Summary
        <Chevron $open={open}>▼</Chevron>
      </Header>
      {open ? <Body>{JSON.stringify(machine, null, 2)}</Body> : null}
    </Panel>
  )
}

export default RadarMachineSummaryPanel
