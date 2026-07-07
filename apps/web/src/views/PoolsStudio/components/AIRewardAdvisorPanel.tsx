import React from 'react'
import styled from 'styled-components'
import { typography } from 'design-system/melega'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'

const Title = styled.h3`
  margin: 0 0 6px;
  font-family: Orbitron, sans-serif;
  font-size: 30px;
  line-height: 1.1;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
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

const AskBtn = styled.button`
  width: 220px;
  height: 46px;
  margin: auto auto 0;
  border: 1px solid #f2c94c;
  border-radius: 14px;
  background: transparent;
  color: #f2c94c;
  font-family: ${typography.fontFamily.body};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 16px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  height: 20px;
  min-height: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

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

const RowTitle = styled.span`
  font-family: ${typography.fontFamily.body};
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.72);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const RowValue = styled.span`
  font-family: ${typography.fontFamily.body};
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 88px;
  text-align: right;
`

const CompactWrap = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  margin-bottom: 10px;
`

const ROW_TITLES = ['Best Sustainability', 'Highest APR', 'Lowest Risk', 'Best Long Term'] as const

const humanAdvisorValue = (value: string) => {
  if (/NEEDS_FUNDING|POOL_ENDED|INDEXING|Hidden/i.test(value)) return '—'
  return value
}

export const AIRewardAdvisorPanel: React.FC<{ embedded?: boolean; compact?: boolean }> = ({ embedded, compact }) => {
  const { advisorItems, loadingLabel } = usePoolsRuntime()
  const rows = advisorItems.slice(0, 4)

  const content = (
    <CompactWrap>
      <Title>Reward Advisor</Title>
      <Subtitle>Ranked picks from live reward sustainability and APR bands.</Subtitle>
      <List>
        {loadingLabel ? (
          <RowTitle>{loadingLabel}</RowTitle>
        ) : (
          rows.map((row, index) => (
            <Row key={ROW_TITLES[index]}>
              <Icon aria-hidden>{row.icon}</Icon>
              <RowTitle>{ROW_TITLES[index]}</RowTitle>
              <RowValue>{humanAdvisorValue(row.value)}</RowValue>
            </Row>
          ))
        )}
      </List>
      <AskBtn type="button">Ask Advisor</AskBtn>
    </CompactWrap>
  )

  if (embedded || compact) {
    return <div data-ps-advisor>{content}</div>
  }

  return <div data-ps-advisor>{content}</div>
}

export default AIRewardAdvisorPanel
