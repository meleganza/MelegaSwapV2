import React from 'react'
import styled from 'styled-components'
import type { ProjectLiquidityBuildingDocument } from 'registry/projects/identity/liquidityBuilding'
import type { ProjectParticipationDocument } from 'registry/projects/identity/participation'
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateTitle,
  MutedText,
  PrimaryButton,
  Section,
  SectionTitle,
  SoftCard,
} from './theme'

const EarnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;

  @media (min-width: 480px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const EarnCard = styled(SoftCard)`
  gap: 10px;
  min-height: 160px;
`

const EarnIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.25);
  font-size: 20px;
`

const EarnTitle = styled.h3`
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #ffffff;
`

const EarnDescription = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.55;
  color: #8f8f8f;
  flex: 1;
`

interface Props {
  participationDocument: ProjectParticipationDocument
  liquidityBuildingDocument: ProjectLiquidityBuildingDocument
}

const ProjectEarnSection: React.FC<Props> = ({ participationDocument, liquidityBuildingDocument }) => {
  const farm = participationDocument.farms.find((f) => f.destination?.href) ?? participationDocument.farms[0] ?? null
  const pool = participationDocument.pools.find((p) => p.destination?.href) ?? participationDocument.pools[0] ?? null
  const liquidityHref =
    liquidityBuildingDocument.destination?.availability === 'AVAILABLE'
      ? liquidityBuildingDocument.destination.href
      : null

  const cards = [
    pool?.destination?.href
      ? {
          key: 'liquidity',
          icon: '💧',
          title: 'Liquidity',
          description: 'Provide liquidity and earn trading fees on Melega pools.',
          href: pool.destination.href,
          cta: 'Add liquidity',
        }
      : null,
    farm?.destination?.href
      ? {
          key: 'farm',
          icon: '🌾',
          title: 'Farm',
          description: 'Stake LP tokens to earn MARCO and partner rewards.',
          href: farm.destination.href,
          cta: 'Start farming',
        }
      : null,
    pool?.destination?.href
      ? {
          key: 'stake',
          icon: '🏊',
          title: 'Stake / Pools',
          description: 'Explore staking pools tied to this project.',
          href: pool.destination.href,
          cta: 'View pools',
        }
      : null,
    liquidityHref
      ? {
          key: 'building',
          icon: '📈',
          title: 'Liquidity Building',
          description: 'Grow depth through the Melega Liquidity Building program.',
          href: liquidityHref,
          cta: 'Open program',
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string
    icon: string
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
            <EarnCard key={card.key}>
              <EarnIcon aria-hidden="true">{card.icon}</EarnIcon>
              <EarnTitle>{card.title}</EarnTitle>
              <EarnDescription>{card.description}</EarnDescription>
              <PrimaryButton href={card.href} aria-label={card.cta} style={{ alignSelf: 'flex-start' }}>
                {card.cta}
              </PrimaryButton>
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
