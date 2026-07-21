import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading } from '@pancakeswap/uikit'
import type { ProjectParticipationDocument } from 'registry/projects/identity/participation'
import ProjectParticipationPositions from './ProjectParticipationPositions'
import type { CanonicalProjectDocument } from 'registry/projects/identity/types'
import type { ProjectEvidencePack } from 'registry/projects/identity/evidence/types'

const Stack = styled(Flex)`
  flex-direction: column;
  gap: 12px;
  min-width: 0;
`

const Fact = styled(Text)`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSubtle};
  line-height: 1.5;
  word-break: break-word;
`

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Item = styled.li`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  word-break: break-word;
`

const CtaLink = styled.a`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  margin-left: 8px;
  color: ${({ theme }) => theme.colors.secondary};
  text-decoration: underline;
  text-underline-offset: 2px;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.secondary};
    outline-offset: 2px;
  }
`

const SubHeading = styled(Heading)`
  && {
    font-size: 18px;
    margin-top: 4px;
  }
`

const StatusText = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSubtle};
`

interface Props {
  participation: ProjectParticipationDocument
  document: CanonicalProjectDocument
  evidencePack: ProjectEvidencePack
}

const OpportunityList: React.FC<{
  title: string
  headingId: string
  items: ProjectParticipationDocument['pools']
  emptyLabel: string
  testId: string
}> = ({ title, headingId, items, emptyLabel, testId }) => (
  <Stack data-testid={testId} style={{ gap: 8 }}>
    <SubHeading as="h3" id={headingId} scale="md">
      {title}
    </SubHeading>
    {items.length === 0 ? (
      <Fact>{emptyLabel}</Fact>
    ) : (
      <List aria-labelledby={headingId}>
        {items.map((row) => (
          <Item key={row.participationId} data-testid={`participation-${row.type}-${row.participationId}`}>
            {row.displayLabel} · chain {row.chainId}
            <StatusText>
              {' '}
              · {row.status} · {row.source}
            </StatusText>
            {row.destination?.availability === 'AVAILABLE' ? (
              <CtaLink
                href={row.destination.href}
                aria-label={`${row.destination.label} for ${row.displayLabel}`}
              >
                {row.destination.label}
              </CtaLink>
            ) : (
              <StatusText> — destination unavailable</StatusText>
            )}
          </Item>
        ))}
      </List>
    )}
  </Stack>
)

const ProjectParticipationSection: React.FC<Props> = ({ participation, document, evidencePack }) => {
  const total =
    participation.pools.length + participation.farms.length + participation.stakingPools.length

  return (
    <Stack data-testid="project-participation-section" data-pp006="true" aria-label="Liquidity farms and pools">
      <Fact data-testid="participation-availability-summary">
        {total > 0
          ? `${total} registered participation opportunit${total === 1 ? 'y' : 'ies'}`
          : 'No Melega DEX participation opportunities are currently registered for this project'}
        {participation.summary.supportedChains.length
          ? ` · Chains: ${participation.summary.supportedChains.join(', ')}`
          : ''}
      </Fact>

      <OpportunityList
        title="Liquidity"
        headingId="participation-liquidity-heading"
        items={participation.pools}
        emptyLabel="No liquidity pools are currently registered for this project."
        testId="participation-liquidity"
      />

      <OpportunityList
        title="Farms"
        headingId="participation-farms-heading"
        items={participation.farms}
        emptyLabel="No farms are currently registered for this project."
        testId="participation-farms"
      />

      <OpportunityList
        title="Pools"
        headingId="participation-pools-heading"
        items={participation.stakingPools}
        emptyLabel="No staking pools are currently registered for this project."
        testId="participation-pools"
      />

      {total === 0 ? (
        <Fact data-testid="participation-empty">
          No Melega DEX participation opportunities are currently registered for this project.
        </Fact>
      ) : null}

      <ProjectParticipationPositions document={document} evidencePack={evidencePack} />

      <Fact>{participation.limitations[0]}</Fact>
    </Stack>
  )
}

export default ProjectParticipationSection
