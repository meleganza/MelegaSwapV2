import React, { useMemo } from 'react'
import styled from 'styled-components'
import { RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'
import TradeTechnicalDetails from 'views/Trade/components/TradeTechnicalDetails'
import { farmsStudioColors } from '../farmsStudioTokens'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import { FsPanel, FsSectionTitle } from './farmsStudioPrimitives'

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 1;
  min-height: 0;
`

const Row = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  column-gap: 16px;
  align-items: center;
  min-height: 48px;
`

const Label = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${farmsStudioColors.muted};
  min-width: 0;
`

const Value = styled.span<{ $tone?: 'green' | 'gold' | 'muted' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.2;
  white-space: normal;
  text-align: center;
  word-break: break-word;
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
`

const DetailsWrap = styled.div`
  display: block;
  margin-top: 18px;
  margin-bottom: 0;
`

export const AIYieldAdvisorPanel: React.FC = () => {
  const { advisorItems, loadingLabel, machine, rewardingFarmCount } = useFarmsRuntime()
  const noRewarding = rewardingFarmCount === 0
  const isEmptyState = noRewarding || (advisorItems.length === 1 && !advisorItems[0]?.value)
  const rows = isEmptyState ? [] : advisorItems.slice(0, 4)

  const technicalDetail = useMemo(() => JSON.stringify(machine, null, 2), [machine])

  return (
    <FsPanel
      data-fs-panel
      data-fs-advisor
      $width="100%"
      $height="320px"
      style={{
        padding: '18px 18px 24px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: '260px',
        maxHeight: '320px',
        boxSizing: 'border-box',
      }}
    >
      <FsSectionTitle>AI Yield Advisor</FsSectionTitle>
      <List>
        {loadingLabel ? (
          <Label>{loadingLabel}</Label>
        ) : isEmptyState ? (
          <Label>{advisorItems[0]?.label ?? 'No eligible rewarding farms.'}</Label>
        ) : (
          rows.map((row, index) => (
            <Row key={`${row.label}-${index}`}>
              <Label>{row.label}</Label>
              <Value $tone={row.value === RUNTIME_UNAVAILABLE_LABEL ? 'muted' : row.tone}>
                {row.value}
              </Value>
            </Row>
          ))
        )}
      </List>
      <DetailsWrap>
        <TradeTechnicalDetails detail={technicalDetail} />
      </DetailsWrap>
    </FsPanel>
  )
}

export default AIYieldAdvisorPanel
