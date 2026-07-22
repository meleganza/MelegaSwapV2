import React from 'react'
import styled from 'styled-components'
import type { ProjectLiquidityBuildingDocument } from 'registry/projects/identity/liquidityBuilding'
import type { ProjectParticipationDocument } from 'registry/projects/identity/participation'
import { PREMIUM_FONT_DISPLAY } from 'design-system/melega/tokens/premiumStudio'
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateTitle,
  MutedText,
  Section,
  SectionTitle,
} from './theme'
import { IconCoins, IconDroplet, IconRocket, IconSprout } from './ProjectWebsiteIcons'

const EarnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;

  @media (min-width: 390px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`

const EarnCard = styled.a`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 130px;
  padding: 16px;
  border-radius: 14px;
  background: #111111;
  border: 1px solid rgba(255, 255, 255, 0.075);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.28);
  text-decoration: none;
  color: inherit;
  transition:
    border-color 140ms ease,
    transform 140ms ease;

  &:hover {
    border-color: rgba(221, 185, 47, 0.35);
    transform: translateY(-1px);
  }
`

const EarnIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(221, 185, 47, 0.1);
  border: 1px solid rgba(221, 185, 47, 0.25);
  color: #ddb92f;
`

const EarnTitle = styled.h3`
  margin: 0;
  font-family: ${PREMIUM_FONT_DISPLAY};
  font-size: 15px;
  font-weight: 650;
  color: #ffffff;
`

const EarnDescription = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.55);
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const EarnCta = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 31px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid rgba(221, 185, 47, 0.35);
  color: #ddb92f;
  font-size: 12px;
  font-weight: 650;
  align-self: flex-start;
`

interface Props {
  participationDocument: ProjectParticipationDocument
  liquidityBuildingDocument: ProjectLiquidityBuildingDocument
  symbol?: string | null
}

const ProjectEarnSection: React.FC<Props> = ({
  participationDocument,
  liquidityBuildingDocument,
  symbol = null,
}) => {
  const farm = participationDocument.farms.find((f) => f.destination?.href) ?? participationDocument.farms[0] ?? null
  const pool = participationDocument.pools.find((p) => p.destination?.href) ?? participationDocument.pools[0] ?? null
  const liquidityHref =
    liquidityBuildingDocument.destination?.availability === 'AVAILABLE'
      ? liquidityBuildingDocument.destination.href
      : null
  const addLiquidityHref = pool?.destination?.href ?? '/liquidity-studio?view=add'
  const stakeLabel = symbol ? `Stake ${symbol}` : 'Stake'

  const cards = [
    {
      key: 'liquidity',
      Icon: IconDroplet,
      title: 'Add Liquidity',
      description: 'Provide liquidity and earn trading fees.',
      href: addLiquidityHref,
      cta: 'Add liquidity',
    },
    farm?.destination?.href
      ? {
          key: 'farm',
          Icon: IconSprout,
          title: 'Farm',
          description: 'Stake LP tokens to earn rewards.',
          href: farm.destination.href,
          cta: 'Start farming',
        }
      : null,
    pool?.destination?.href
      ? {
          key: 'stake',
          Icon: IconCoins,
          title: stakeLabel,
          description: 'Stake in verified pools.',
          href: pool.destination.href,
          cta: 'View pools',
        }
      : null,
    liquidityHref
      ? {
          key: 'building',
          Icon: IconRocket,
          title: 'Build Liquidity',
          description: 'Grow liquidity with verified strategies.',
          href: liquidityHref,
          cta: 'Open program',
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string
    Icon: React.FC<{ size?: number }>
    title: string
    description: string
    href: string
    cta: string
  }>

  return (
    <Section aria-labelledby="earn-heading">
      <SectionTitle id="earn-heading">Earn</SectionTitle>
      <MutedText>
        {cards.length > 0
          ? 'Ways to participate and grow with this project on Melega.'
          : 'Earn opportunities will appear here when they are registered.'}
      </MutedText>

      {cards.length > 0 ? (
        <EarnGrid>
          {cards.map((card) => (
            <EarnCard key={card.key} href={card.href} aria-label={card.cta}>
              <EarnIcon aria-hidden>
                <card.Icon size={21} />
              </EarnIcon>
              <EarnTitle>{card.title}</EarnTitle>
              <EarnDescription>{card.description}</EarnDescription>
              <EarnCta>{card.cta}</EarnCta>
            </EarnCard>
          ))}
        </EarnGrid>
      ) : (
        <EmptyState>
          <EmptyStateTitle>Not available yet</EmptyStateTitle>
          <EmptyStateBody>No earn destinations are registered for this project right now.</EmptyStateBody>
        </EmptyState>
      )}
    </Section>
  )
}

export default ProjectEarnSection
