import React from 'react'
import styled from 'styled-components'
import { AI_BRIEFING } from '../commandCenterData'
import { CC_FONT_BODY, commandCenterColors, commandCenterLayout } from '../commandCenterTokens'
import { CcBody, CcPanel } from './commandCenterPrimitives'

const Panel = styled(CcPanel)`
  padding: 24px;
  border-radius: ${commandCenterLayout.panelRadius};
  min-height: 200px;
  display: flex;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const Avatar = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 2px solid ${commandCenterColors.gold};
  background: linear-gradient(135deg, rgba(214, 180, 69, 0.35), rgba(19, 19, 19, 0.9));
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${CC_FONT_BODY};
  font-size: 28px;
  flex-shrink: 0;
`

const Content = styled.div`
  flex: 1;
  min-width: 0;
`

const Greeting = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 18px;
  font-weight: 700;
  color: ${commandCenterColors.white};
  margin-bottom: 12px;
`

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Item = styled.li`
  font-family: ${CC_FONT_BODY};
  font-size: 13px;
  line-height: 20px;
  color: ${commandCenterColors.body};
  padding-left: 14px;
  position: relative;

  &::before {
    content: '•';
    position: absolute;
    left: 0;
    color: ${commandCenterColors.gold};
  }
`

const Footer = styled.div`
  margin-top: 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid ${commandCenterColors.border};
  background: rgba(255, 255, 255, 0.03);
  font-family: ${CC_FONT_BODY};
  font-size: 12px;
  font-weight: 600;
  color: ${commandCenterColors.gold};
`

export const AIDailyBriefing: React.FC = () => (
  <Panel data-cc-ai-briefing $emphasis>
    <Avatar aria-hidden>✦</Avatar>
    <Content>
      <Greeting>{AI_BRIEFING.greeting}</Greeting>
      <List>
        {AI_BRIEFING.bullets.map((b) => (
          <Item key={b}>{b}</Item>
        ))}
      </List>
      <Footer>⏱ Estimated actions today: {AI_BRIEFING.estimatedActions}</Footer>
    </Content>
  </Panel>
)

export default AIDailyBriefing
