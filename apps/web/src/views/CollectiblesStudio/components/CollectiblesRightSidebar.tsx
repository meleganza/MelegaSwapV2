import React from 'react'
import styled from 'styled-components'
import type { SidebarListItem } from '../collectiblesStudioData'
import {
  COLLECTOR_ACTIVITY,
  HIGHEST_UTILITY,
  NEWEST_COLLECTIONS,
  RECENTLY_SOLD,
  TRENDING_NOW,
} from '../collectiblesStudioData'
import {
  CS_FONT_BODY,
  CS_FONT_DISPLAY,
  collectiblesStudioColors,
  collectiblesStudioLayout,
} from '../collectiblesStudioTokens'
import { CsPanel, CsThumbnail } from './collectiblesStudioPrimitives'

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: ${collectiblesStudioLayout.gridGap};
  min-width: 0;
`

const Section = styled(CsPanel)`
  padding: 16px;
`

const SectionTitle = styled.h3`
  margin: 0 0 12px;
  font-family: ${CS_FONT_DISPLAY};
  font-size: 16px;
  font-weight: 700;
  color: ${collectiblesStudioColors.white};
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid ${collectiblesStudioColors.border};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`

const Rank = styled.span`
  width: 18px;
  font-family: ${CS_FONT_DISPLAY};
  font-size: 13px;
  font-weight: 700;
  color: ${collectiblesStudioColors.gold};
  flex-shrink: 0;
`

const RowText = styled.div`
  flex: 1;
  min-width: 0;
`

const Name = styled.div`
  font-family: ${CS_FONT_BODY};
  font-size: 13px;
  font-weight: 600;
  color: ${collectiblesStudioColors.white};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Price = styled.div`
  font-family: ${CS_FONT_BODY};
  font-size: 12px;
  font-weight: 700;
  color: ${collectiblesStudioColors.white};
  white-space: nowrap;
`

const Change = styled.span<{ $positive?: boolean }>`
  font-family: ${CS_FONT_BODY};
  font-size: 11px;
  font-weight: 600;
  color: ${({ $positive }) => ($positive ? collectiblesStudioColors.green : collectiblesStudioColors.red)};
`

const RightCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
`

function SidebarSection({
  title,
  items,
  showRank,
  showChange,
  priceLabel,
}: {
  title: string
  items: SidebarListItem[]
  showRank?: boolean
  showChange?: boolean
  priceLabel?: string
}) {
  return (
    <Section data-cs-panel data-cs-sidebar-section>
      <SectionTitle>{title}</SectionTitle>
      <List>
        {items.map((item) => (
          <Row key={`${title}-${item.title}`} data-cs-sidebar-row>
            {showRank && item.rank ? <Rank>{item.rank}</Rank> : null}
            <CsThumbnail $theme={item.artTheme} />
            <RowText>
              <Name>{item.title}</Name>
            </RowText>
            <RightCol>
              <Price>
                {priceLabel ? `${item.price} ${priceLabel}` : item.price}
              </Price>
              {showChange && item.change ? (
                <Change $positive={item.changePositive}>{item.change}</Change>
              ) : null}
            </RightCol>
          </Row>
        ))}
      </List>
    </Section>
  )
}

export const CollectiblesRightSidebar: React.FC = () => (
  <Sidebar data-cs-right-sidebar>
    <SidebarSection title="Trending Now" items={TRENDING_NOW} showRank showChange />
    <SidebarSection title="Newest Collections" items={NEWEST_COLLECTIONS} />
    <SidebarSection title="Highest Utility" items={HIGHEST_UTILITY} priceLabel="score" />
    <SidebarSection title="Recently Sold" items={RECENTLY_SOLD} />
    <SidebarSection title="Collector Activity" items={COLLECTOR_ACTIVITY} />
  </Sidebar>
)

export default CollectiblesRightSidebar
