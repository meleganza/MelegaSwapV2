import React, { useState } from 'react'
import styled from 'styled-components'
import { useTrendingRuntime } from '../trendingRuntime/TrendingRuntimeContext'
import { trendingStudioColors } from '../trendingStudioTokens'
import { TrOutlineBtn, TrPanel, TrSectionTitle } from './trendingStudioPrimitives'

const Panel = styled(TrPanel)`
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const JsonBlock = styled.pre`
  margin: 0;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid ${trendingStudioColors.border};
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 11px;
  line-height: 1.55;
  color: ${trendingStudioColors.gray};
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
`

const ToggleBtn = styled.button`
  align-self: flex-start;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid ${trendingStudioColors.border};
  background: rgba(255, 255, 255, 0.04);
  color: ${trendingStudioColors.gold};
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
`

export const TrendingMachinePanel: React.FC = () => {
  const { machine, machineOpen, setMachineOpen } = useTrendingRuntime()
  const jsonText = JSON.stringify(machine, null, 2)

  return (
    <Panel data-tr-machine-summary>
      <TrSectionTitle style={{ fontSize: 18, marginBottom: 0 }}>Machine Summary</TrSectionTitle>
      <ToggleBtn type="button" onClick={() => setMachineOpen(!machineOpen)} aria-expanded={machineOpen}>
        {machineOpen ? 'Collapse' : 'Expand'} machine-readable runtime
      </ToggleBtn>
      {machineOpen ? <JsonBlock data-tr-machine-json>{jsonText}</JsonBlock> : null}
    </Panel>
  )
}

export default TrendingMachinePanel
