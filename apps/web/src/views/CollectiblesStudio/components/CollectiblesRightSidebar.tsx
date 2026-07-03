import React from 'react'
import styled from 'styled-components'
import type { SidebarListItem } from '../collectiblesStudioData'
import { useCollectiblesRuntime } from '../collectiblesRuntime/CollectiblesRuntimeContext'
import {
  CS_FONT_BODY,
  CS_FONT_DISPLAY,
  collectiblesStudioColors,
  collectiblesStudioLayout,
} from '../collectiblesStudioTokens'
import { CsThumbnail } from './collectiblesStudioPrimitives'

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: ${collectiblesStudioLayout.gridGap};
  min-width: 0;
  width: ${collectiblesStudioLayout.sidebarWidth};

  @media (max-width: 768px) {
    width: 100%;
  }
`

const Section = styled.div`
  width: 100%;
  background: ${collectiblesStudioColors.panel};
  border: 1px solid ${collectiblesStudioColors.border};
  border-radius: ${collectiblesStudioLayout.cardRadius};
  padding: 20px;
  box-sizing: border-box;
`

const SectionTitle = styled.h3`
  margin: 0 0 14px;
  font-family: ${CS_FONT_DISPLAY};
  font-size: 24px;
  line-height: 28px;
  font-weight: 700;
  color: ${collectiblesStudioColors.white};
`

const List = styled.div`
  display: flex;
  flex-direction: column;
`

const Row = styled.div`
  height: 54px;
  display: grid;
  grid-template-columns: 38px 1fr auto;
  gap: 12px;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &:last-child {
    border-bottom: none;
  }
`

const NameCol = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`

const Rank = styled.span`
  font-family: ${CS_FONT_DISPLAY};
  font-size: 13px;
  font-weight: 700;
  color: ${collectiblesStudioColors.gold};
  flex-shrink: 0;
  width: 14px;
`

const Name = styled.div`
  font-family: ${CS_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  color: ${collectiblesStudioColors.white};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`

const RightCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
`

const Price = styled.div`
  font-family: ${CS_FONT_BODY};
  font-size: 13px;
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
            <CsThumbnail $theme={item.artTheme} />
            <NameCol>
              {showRank && item.rank ? <Rank>{item.rank}</Rank> : null}
              <Name>{item.title}</Name>
            </NameCol>
            <RightCol>
              <Price>{priceLabel ? `${item.price} ${priceLabel}` : item.price}</Price>
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

export const CollectiblesRightSidebar: React.FC = () => {
  const { sidebar } = useCollectiblesRuntime()

  return (
  <Sidebar data-cs-right-sidebar>
    <SidebarSection title="Most Adopted" items={sidebar.mostAdopted} showRank showChange />
    <SidebarSection title="Highest Governance" items={sidebar.highestGovernance} priceLabel="score" />
    <SidebarSection title="Most Used by AI" items={sidebar.mostUsedByAi} priceLabel="score" />
    <SidebarSection title="Newest Identities" items={sidebar.newestIdentities} />
    <SidebarSection title="Most Active Builders" items={sidebar.mostActiveBuilders} />
  </Sidebar>
  )
}

export default CollectiblesRightSidebar
