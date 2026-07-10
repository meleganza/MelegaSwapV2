import React, { useMemo } from 'react'
import styled from 'styled-components'
import { RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'
import TradeTechnicalDetails from 'views/Trade/components/TradeTechnicalDetails'
import { farmsStudioColors, farmsStudioLayout } from '../farmsStudioTokens'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import { FsPanel, FsSectionTitle } from './farmsStudioPrimitives'

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  flex: 1;
  min-height: 0;
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
  max-width: 58%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const AIYieldAdvisorPanel: React.FC = () => {
  const { advisorItems, loadingLabel, machine } = useFarmsRuntime()

  const technicalDetail = useMemo(() => JSON.stringify(machine, null, 2), [machine])

  return (
    <FsPanel
      data-fs-panel
      data-fs-advisor
      $width="100%"
      $height={farmsStudioLayout.featuredHeight}
      style={{ padding: '18px', display: 'flex', flexDirection: 'column' }}
    >
      <FsSectionTitle>AI Yield Advisor</FsSectionTitle>
      <List>
        {loadingLabel ? (
          <Label>{loadingLabel}</Label>
        ) : (
          advisorItems.map((row) => (
            <Row key={row.label}>
              <Label>{row.label}</Label>
              <Value $tone={row.value === RUNTIME_UNAVAILABLE_LABEL ? 'muted' : row.tone}>
                {row.value}
              </Value>
            </Row>
          ))
        )}
      </List>
      <TradeTechnicalDetails detail={technicalDetail} />
    </FsPanel>
  )
}

export default AIYieldAdvisorPanel
