import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Head = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
`

const Title = styled.h2`
  margin: 0;
  font-family: ${tokens.fontDisplay};
  font-size: 16px;
  font-weight: 600;
  color: ${tokens.text};
`

const SeeAll = styled(Link)`
  font-size: 13px;
  color: ${tokens.gold};
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    color: ${tokens.goldHighlight};
  }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
`

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Item = styled(Link)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: ${tokens.surface};
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusSm};
  text-decoration: none;
  transition: border-color ${tokens.transition};

  &:hover {
    border-color: ${tokens.borderGold};
  }
`

const ItemLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${tokens.text};
`

const ItemMeta = styled.span`
  font-size: 12px;
  color: ${tokens.textSecondary};
  text-align: right;
`

const Empty = styled.p`
  margin: 0;
  padding: 20px 16px;
  font-size: 14px;
  color: ${tokens.textSecondary};
  background: ${tokens.surface};
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusSm};
  line-height: 1.6;
`

export interface DynamicItem {
  id: string
  label: string
  meta?: string
  href: string
}

export interface HumanDynamicSectionProps {
  title: string
  seeAllHref?: string
  seeAllLabel?: string
  items: DynamicItem[]
  emptyMessage: string
  layout?: 'grid' | 'list'
}

export const HumanDynamicSection: React.FC<HumanDynamicSectionProps> = ({
  title,
  seeAllHref,
  seeAllLabel = 'See all',
  items,
  emptyMessage,
  layout = 'grid',
}) => {
  if (items.length === 0) {
    return (
      <Section>
        <Head>
          <Title>{title}</Title>
        </Head>
        <Empty>{emptyMessage}</Empty>
      </Section>
    )
  }

  return (
    <Section>
      <Head>
        <Title>{title}</Title>
        {seeAllHref && <SeeAll href={seeAllHref}>{seeAllLabel} →</SeeAll>}
      </Head>
      {layout === 'list' ? (
        <Row>
          {items.map((item) => (
            <Item key={item.id} href={item.href}>
              <ItemLabel>{item.label}</ItemLabel>
              {item.meta && <ItemMeta>{item.meta}</ItemMeta>}
            </Item>
          ))}
        </Row>
      ) : (
        <Grid>
          {items.map((item) => (
            <Item key={item.id} href={item.href}>
              <ItemLabel>{item.label}</ItemLabel>
              {item.meta && <ItemMeta>{item.meta}</ItemMeta>}
            </Item>
          ))}
        </Grid>
      )}
    </Section>
  )
}

export default HumanDynamicSection
