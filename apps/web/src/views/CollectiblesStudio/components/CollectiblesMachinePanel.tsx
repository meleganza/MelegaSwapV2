import React from 'react'
import styled from 'styled-components'
import { useCollectiblesRuntime } from '../collectiblesRuntime/CollectiblesRuntimeContext'
import { CS_FONT_DISPLAY, collectiblesStudioColors } from '../collectiblesStudioTokens'

const Panel = styled.div`
  width: 100%;
  background: ${collectiblesStudioColors.panel};
  border: 1px solid ${collectiblesStudioColors.border};
  border-radius: 16px;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Title = styled.h3`
  margin: 0;
  font-family: ${CS_FONT_DISPLAY};
  font-size: 16px;
  font-weight: 700;
  color: ${collectiblesStudioColors.white};
`

const ToggleBtn = styled.button`
  align-self: flex-start;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid ${collectiblesStudioColors.border};
  background: rgba(255, 255, 255, 0.04);
  color: ${collectiblesStudioColors.gold};
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
`

const JsonBlock = styled.pre`
  margin: 0;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid ${collectiblesStudioColors.border};
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 11px;
  line-height: 1.55;
  color: ${collectiblesStudioColors.label};
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
`

export const CollectiblesMachinePanel: React.FC = () => {
  const { machine, machineOpen, setMachineOpen } = useCollectiblesRuntime()

  return (
    <Panel data-cs-machine-panel id="cs-machine-panel">
      <Title>Machine Summary</Title>
      <ToggleBtn type="button" onClick={() => setMachineOpen(!machineOpen)} aria-expanded={machineOpen}>
        {machineOpen ? 'Collapse' : 'Expand'} machine-readable runtime
      </ToggleBtn>
      {machineOpen ? <JsonBlock data-cs-machine-json>{JSON.stringify(machine, null, 2)}</JsonBlock> : null}
    </Panel>
  )
}

export default CollectiblesMachinePanel
