import React, { useState } from 'react'
import styled from 'styled-components'
import { liquidityStudioColors, liquidityStudioLayout } from '../liquidityStudioTokens'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'
import { LsPanel, LsRightLabel, LsRightRow, LsRightValue, LsSectionTitle } from './liquidityStudioPrimitives'

const Delta = styled.span`
  font-size: 12px;
  font-weight: 800;
  color: ${liquidityStudioColors.green};
  margin-left: 6px;
`

const ValueWrap = styled.span`
  display: inline-flex;
  align-items: baseline;
`

const LoadingLine = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${liquidityStudioColors.muted};
`

const MachineToggle = styled.button`
  margin-top: 10px;
  border: none;
  background: transparent;
  color: ${liquidityStudioColors.muted};
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-align: left;
`

const MachinePre = styled.pre`
  margin: 8px 0 0;
  padding: 8px;
  border-radius: 8px;
  background: #0c0c0c;
  border: 1px solid ${liquidityStudioColors.border};
  font-size: 9px;
  line-height: 1.35;
  color: ${liquidityStudioColors.muted};
  max-height: 80px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
`

export const MarketIntelligencePanel: React.FC = () => {
  const { terminal, machine, loadingLabel } = useLiquidityRuntime()
  const [machineOpen, setMachineOpen] = useState(false)
  const { marketMetrics, isIndexing } = terminal

  return (
    <LsPanel
      data-ls-panel
      $width={liquidityStudioLayout.rightWidth}
      $height={liquidityStudioLayout.marketIntelHeight}
      $radius={liquidityStudioLayout.rightPanelRadius}
      $pad={liquidityStudioLayout.rightPanelPadding}
    >
      <LsSectionTitle>Market Intelligence</LsSectionTitle>
      {loadingLabel || isIndexing ? (
        <LoadingLine>{loadingLabel ?? 'Loading pool metrics…'}</LoadingLine>
      ) : (
        marketMetrics.map((m) => (
          <LsRightRow key={m.label}>
            <LsRightLabel>{m.label}</LsRightLabel>
            <ValueWrap>
              <LsRightValue>{m.value}</LsRightValue>
              {m.delta && <Delta>{m.delta}</Delta>}
            </ValueWrap>
          </LsRightRow>
        ))
      )}
      <MachineToggle type="button" onClick={() => setMachineOpen((v) => !v)}>
        {machineOpen ? 'Hide' : 'Show'} machine-readable runtime
      </MachineToggle>
      {machineOpen && (
        <MachinePre data-ls-machine-json>{JSON.stringify(machine, null, 2)}</MachinePre>
      )}
    </LsPanel>
  )
}

export default MarketIntelligencePanel
