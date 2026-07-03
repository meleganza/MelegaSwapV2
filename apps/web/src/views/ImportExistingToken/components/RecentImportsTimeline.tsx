import React from 'react'
import styled from 'styled-components'
import { RECENT_IMPORTS } from '../importTokenData'
import { IT_FONT_BODY, importTokenColors } from '../importTokenTokens'
import { ItPanel, ItSectionLabel } from './importTokenPrimitives'

const Panel = styled(ItPanel)`
  padding: 24px;
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Item = styled.div`
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  font-family: ${IT_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  color: ${importTokenColors.white};
`

const Time = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${importTokenColors.muted};
`

const Timeline = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
`

const Event = styled.span`
  font-family: ${IT_FONT_BODY};
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid ${importTokenColors.border};
  color: ${importTokenColors.body};
  background: rgba(255, 255, 255, 0.02);
`

const Arrow = styled.span`
  color: ${importTokenColors.gold};
  font-size: 11px;
  margin: 0 2px;
`

export const RecentImportsTimeline: React.FC = () => (
  <Panel data-iet-recent-imports>
    <ItSectionLabel>Recent Imports</ItSectionLabel>
    <List>
      {RECENT_IMPORTS.map((row) => (
        <Item key={row.id}>
          <Head>
            <span>{row.project}</span>
            <Time>{row.time}</Time>
          </Head>
          <Timeline>
            {row.events.map((ev, i) => (
              <React.Fragment key={ev}>
                {i > 0 ? <Arrow>→</Arrow> : null}
                <Event>{ev}</Event>
              </React.Fragment>
            ))}
          </Timeline>
        </Item>
      ))}
    </List>
  </Panel>
)

export default RecentImportsTimeline
