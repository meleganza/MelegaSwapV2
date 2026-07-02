import React from 'react'
import styled from 'styled-components'
import { AI_ADVISOR_ROWS } from '../collectiblesStudioData'
import {
  CS_FONT_BODY,
  CS_FONT_DISPLAY,
  collectiblesStudioColors,
  collectiblesStudioLayout,
} from '../collectiblesStudioTokens'
import { CsOutlineBtn, CsPanel, CsThumbnail, ScoreRingDisplay } from './collectiblesStudioPrimitives'

const Inner = styled.div`
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0;
`

const Title = styled.h3`
  margin: 0 0 16px;
  font-family: ${CS_FONT_DISPLAY};
  font-size: 18px;
  font-weight: 700;
  color: ${collectiblesStudioColors.white};
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 1;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid ${collectiblesStudioColors.border};

  &:last-child {
    border-bottom: none;
  }
`

const RowText = styled.div`
  flex: 1;
  min-width: 0;
`

const Category = styled.div`
  font-family: ${CS_FONT_BODY};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${collectiblesStudioColors.label};
`

const Name = styled.div`
  font-family: ${CS_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  color: ${collectiblesStudioColors.white};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const CtaWrap = styled.div`
  margin-top: auto;
  padding-top: 14px;
`

export const AICollectionAdvisorPanel: React.FC = () => (
  <CsPanel data-cs-panel data-cs-advisor $height={collectiblesStudioLayout.featuredHeight}>
    <Inner>
      <Title>AI Collection Advisor</Title>
      <List>
        {AI_ADVISOR_ROWS.map((row) => (
          <Row key={row.category} data-cs-advisor-row>
            <CsThumbnail $theme={row.artTheme} />
            <RowText>
              <Category>{row.category}</Category>
              <Name>{row.title}</Name>
            </RowText>
            <ScoreRingDisplay score={row.score} />
          </Row>
        ))}
      </List>
      <CtaWrap>
        <CsOutlineBtn $width="100%" $height="42px" type="button">
          View All Insights
        </CsOutlineBtn>
      </CtaWrap>
    </Inner>
  </CsPanel>
)

export default AICollectionAdvisorPanel
