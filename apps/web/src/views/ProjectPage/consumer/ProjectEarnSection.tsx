import React from 'react'
import type { ProjectLiquidityBuildingDocument } from 'registry/projects/identity/liquidityBuilding'
import type { ProjectParticipationDocument } from 'registry/projects/identity/participation'
import { humanEnumLabel } from '../presentation/humanLabels'
import { BodyText, Card, MutedText, Section, SectionTitle, SubTitle, TextLink } from './theme'

interface Props {
  participationDocument: ProjectParticipationDocument
  liquidityBuildingDocument: ProjectLiquidityBuildingDocument
}

const ProjectEarnSection: React.FC<Props> = ({ participationDocument, liquidityBuildingDocument }) => {
  const farms = participationDocument.farms.slice(0, 3)
  const pools = participationDocument.pools.slice(0, 3)
  const liquidityHref =
    liquidityBuildingDocument.destination?.availability === 'AVAILABLE'
      ? liquidityBuildingDocument.destination.href
      : null

  return (
    <Section id="earn" aria-labelledby="earn-heading">
      <SectionTitle id="earn-heading">Earn</SectionTitle>
      <MutedText>
        {participationDocument.summary.farmCount + participationDocument.summary.liquidityPoolCount > 0
          ? 'Participate through registered Melega earn surfaces.'
          : 'No earn opportunities are currently registered for this project.'}
      </MutedText>

      {farms.length > 0 ? (
        <Card>
          <SubTitle as="h3">Farms</SubTitle>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {farms.map((farm) => (
              <li key={farm.participationId}>
                <BodyText style={{ fontWeight: 600 }}>{farm.displayLabel}</BodyText>
                <MutedText style={{ fontSize: 14 }}>
                  {humanEnumLabel(farm.status)} · {humanEnumLabel(farm.availability)}
                </MutedText>
                {farm.destination?.href ? (
                  <TextLink href={farm.destination.href} aria-label={`Open ${farm.displayLabel}`}>
                    Open farm
                  </TextLink>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {pools.length > 0 ? (
        <Card>
          <SubTitle as="h3">Liquidity pools</SubTitle>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pools.map((pool) => (
              <li key={pool.participationId}>
                <BodyText style={{ fontWeight: 600 }}>{pool.displayLabel}</BodyText>
                <MutedText style={{ fontSize: 14 }}>
                  {humanEnumLabel(pool.status)} · {humanEnumLabel(pool.availability)}
                </MutedText>
                {pool.destination?.href ? (
                  <TextLink href={pool.destination.href} aria-label={`Open ${pool.displayLabel}`}>
                    Open pool
                  </TextLink>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {liquidityBuildingDocument.availability === 'AVAILABLE' ? (
        <Card>
          <SubTitle as="h3">Liquidity Building</SubTitle>
          <BodyText style={{ fontSize: 15 }}>
            Grow liquidity through the Melega Liquidity Building program.
          </BodyText>
          {liquidityHref ? (
            <TextLink href={liquidityHref} aria-label="Open Liquidity Building">
              Open Liquidity Building
            </TextLink>
          ) : (
            <MutedText>Liquidity Building destination unavailable.</MutedText>
          )}
        </Card>
      ) : null}
    </Section>
  )
}

export default ProjectEarnSection
