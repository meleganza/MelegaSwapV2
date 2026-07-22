import React from 'react'
import styled, { css } from 'styled-components'
import { typography } from 'design-system/melega'
import { RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'

const Title = styled.h3<{ $compact?: boolean }>`
  margin: 0;
  font-family: Sora, sans-serif;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;

  ${({ $compact }) =>
    $compact
      ? css`
          font-size: 24px;
          line-height: 30px;
          margin-bottom: 8px;

          @media (max-width: 767px) {
            white-space: normal;
          }
        `
      : css`
          font-size: 30px;
          line-height: 1.1;
          margin-bottom: 6px;
        `}
`

const Subtitle = styled.p`
  margin: 0 0 12px;
  font-family: ${typography.fontFamily.body};
  font-size: 15px;
  line-height: 1.35;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.65);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const AskBtn = styled.button<{ $compact?: boolean }>`
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  font-family: Inter, ${typography.fontFamily.body};
  font-weight: 800;
  color: #F4C430;
  border: 1px solid #F4C430;

  ${({ $compact }) =>
    $compact
      ? css`
          width: 100%;
          height: 42px;
          margin-top: auto;
          font-size: 13px;
          flex-shrink: 0;
        `
      : css`
          width: 220px;
          height: 46px;
          margin: auto auto 0;
          font-size: 16px;
          font-weight: 600;
          border-radius: 14px;
          border-color: #f2c94c;
          color: #f2c94c;
        `}
`

const Row = styled.div<{ $compact?: boolean }>`
  display: grid;
  align-items: center;
  min-height: 0;
  border-bottom: 1px solid
    ${({ $compact }) => ($compact ? '#242424' : 'rgba(255, 255, 255, 0.06)')};

  ${({ $compact }) =>
    $compact
      ? css`
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 12px;
          height: 34px;
          min-height: 34px;
        `
      : css`
          grid-template-columns: 16px minmax(0, 1fr) auto;
          gap: 10px;
          height: 20px;
          min-height: 20px;
        `}

  &:last-of-type {
    border-bottom: none;
  }
`

const Icon = styled.span`
  width: 16px;
  font-size: 16px;
  line-height: 1;
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
`

const RowTitle = styled.span<{ $compact?: boolean }>`
  font-family: Inter, ${typography.fontFamily.body};
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  ${({ $compact }) =>
    $compact
      ? css`
          font-size: 12px;
          color: #b8b8b8;
        `
      : css`
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.72);
        `}
`

const RowValue = styled.span<{ $tone?: 'green' | 'default' | 'muted' }>`
  font-family: Inter, ${typography.fontFamily.body};
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;

  ${({ $tone }) => {
    if ($tone === 'green') return 'color: #16e67a; font-size: 13px;'
    if ($tone === 'muted') return 'color: #b8b8b8; font-size: 13px;'
    return 'color: #ffffff; font-size: 16px;'
  }}

  ${({ $tone }) =>
    $tone === 'green' || $tone === 'muted'
      ? css`
          max-width: 120px;
          font-size: 13px;
        `
      : css`
          max-width: 88px;
        `}
`

const CompactWrap = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: visible;
`

const List = styled.div<{ $compact?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: visible;

  ${({ $compact }) =>
    $compact
      ? css`
          gap: 0;
          margin-bottom: 0;
        `
      : css`
          gap: 10px;
          margin-bottom: 10px;
          overflow: hidden;
        `}
`

const humanAdvisorValue = (value: string) => {
  if (/NEEDS_FUNDING|POOL_ENDED|INDEXING|Hidden/i.test(value)) return RUNTIME_UNAVAILABLE_LABEL
  return value
}

const valueTone = (display: string): 'green' | 'default' | 'muted' => {
  if (display === RUNTIME_UNAVAILABLE_LABEL || display.startsWith('Unavailable')) return 'muted'
  if (/%/.test(display)) return 'green'
  return 'default'
}

export const AIRewardAdvisorPanel: React.FC<{ embedded?: boolean; compact?: boolean }> = ({ embedded, compact }) => {
  const { advisorItems, loadingLabel, rewardingCount } = usePoolsRuntime()
  const noRewarding = rewardingCount === 0
  const isEmptyState = noRewarding || (advisorItems.length === 1 && !advisorItems[0]?.value)
  const rows = isEmptyState ? [] : advisorItems.slice(0, 4)

  const content = (
    <CompactWrap>
      <Title $compact={compact}>Reward Advisor</Title>
      {!compact ? <Subtitle>Ranked picks from live reward sustainability and APR bands.</Subtitle> : null}
      <List $compact={compact}>
        {loadingLabel ? (
          <RowTitle $compact={compact}>{loadingLabel}</RowTitle>
        ) : isEmptyState ? (
          <RowTitle $compact={compact}>
            {advisorItems[0]?.label ?? 'No eligible rewarding pools.'}
          </RowTitle>
        ) : (
          rows.map((row, index) => {
            const display = humanAdvisorValue(row.value)
            return (
              <Row key={`${row.label}-${index}`} $compact={compact}>
                {!compact ? <Icon aria-hidden>{row.icon}</Icon> : null}
                <RowTitle $compact={compact}>{row.label}</RowTitle>
                <RowValue $tone={compact ? valueTone(display) : 'default'}>{display}</RowValue>
              </Row>
            )
          })
        )}
      </List>
      {!isEmptyState ? (
        <AskBtn type="button" $compact={compact}>
          Ask Advisor
        </AskBtn>
      ) : null}
    </CompactWrap>
  )

  if (embedded || compact) {
    return (
      <div data-ps-advisor data-r716-advisor>
        {content}
      </div>
    )
  }

  return <div data-ps-advisor>{content}</div>
}

export default AIRewardAdvisorPanel
