import React, { useState } from 'react'
import styled from 'styled-components'
import { farmsStudioColors, farmsStudioLayout } from '../farmsStudioTokens'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import { FsPanel, FsSectionTitle } from './farmsStudioPrimitives'

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 24px;
`

const Label = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${farmsStudioColors.muted};
`

const Value = styled.span<{ $tone?: 'green' | 'gold' | 'muted' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  padding: ${({ $tone }) => ($tone === 'muted' ? '0' : '0 12px')};
  border-radius: 999px;
  font-size: 16px;
  font-weight: 800;
  color: ${({ $tone }) =>
    $tone === 'green'
      ? farmsStudioColors.green
      : $tone === 'gold'
        ? farmsStudioColors.gold
        : farmsStudioColors.muted};
  background: ${({ $tone }) =>
    $tone === 'green'
      ? 'rgba(0, 230, 118, 0.08)'
      : $tone === 'gold'
        ? farmsStudioColors.previewBadgeBg
        : 'transparent'};
  border: ${({ $tone }) =>
    $tone === 'green'
      ? `1px solid ${farmsStudioColors.green}`
      : $tone === 'gold'
        ? `1px solid ${farmsStudioColors.gold}`
        : 'none'};
  text-align: right;
`

const MachineToggle = styled.button`
  margin-top: 10px;
  border: none;
  background: transparent;
  color: ${farmsStudioColors.muted};
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
  border: 1px solid ${farmsStudioColors.border};
  font-size: 9px;
  line-height: 1.35;
  color: ${farmsStudioColors.muted};
  max-height: 80px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
`

export const AIYieldAdvisorPanel: React.FC = () => {
  const { advisorItems, loadingLabel, machine } = useFarmsRuntime()
  const [machineOpen, setMachineOpen] = useState(false)

  return (
    <FsPanel
      data-fs-panel
      data-fs-advisor
      $width="100%"
      $height={farmsStudioLayout.featuredHeight}
      style={{ padding: '18px' }}
    >
      <FsSectionTitle>AI Yield Advisor</FsSectionTitle>
      <List>
        {loadingLabel ? (
          <Label>{loadingLabel}</Label>
        ) : (
          advisorItems.map((row) => (
            <Row key={row.label}>
              <Label>{row.label}</Label>
              <Value $tone={row.tone}>{row.value}</Value>
            </Row>
          ))
        )}
      </List>
      <MachineToggle type="button" onClick={() => setMachineOpen((v) => !v)}>
        {machineOpen ? 'Hide' : 'Show'} machine-readable runtime
      </MachineToggle>
      {machineOpen && (
        <MachinePre data-fs-machine-json>{JSON.stringify(machine, null, 2)}</MachinePre>
      )}
    </FsPanel>
  )
}

export default AIYieldAdvisorPanel
