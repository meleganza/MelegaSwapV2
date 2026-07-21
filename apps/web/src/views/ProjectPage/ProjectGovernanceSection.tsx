import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading } from '@pancakeswap/uikit'
import type {
  GovernanceEntity,
  GovernanceResource,
  OwnershipEntity,
  ProjectGovernanceDocument,
  TreasuryEntity,
  UpgradeabilityEntity,
} from 'registry/projects/identity/governance'

const Stack = styled(Flex)`
  flex-direction: column;
  gap: 14px;
  min-width: 0;
`

const Fact = styled(Text)`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSubtle};
  line-height: 1.5;
  word-break: break-word;
`

const Group = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`

const Cards = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Card = styled.li`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`

const Meta = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSubtle};
  word-break: break-word;
`

const Title = styled(Text)`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`

const OpenLink = styled.a`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: ${({ theme }) => theme.colors.secondary};
  text-decoration: underline;
  text-underline-offset: 2px;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.secondary};
    outline-offset: 2px;
  }
`

const SectionLink = styled.a`
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
  }
`

const GovernanceCard: React.FC<{ entity: GovernanceEntity }> = ({ entity }) => (
  <Card data-testid={`governance-entity-${entity.governanceId}`}>
    <Meta>
      <span data-testid="governance-model" aria-label={`Governance model: ${entity.governanceModel}`}>
        {entity.governanceModel}
      </span>
      {' · '}
      <span data-testid="governance-lifecycle">{entity.lifecycle}</span>
      {' · '}
      <span data-testid="governance-verification">{entity.verification.state}</span>
    </Meta>
    <Title as="h4">Governance model</Title>
    <Fact data-testid="governance-summary">{entity.summary}</Fact>
    {entity.governanceCapabilities.length > 0 ? (
      <Fact>Capabilities: {entity.governanceCapabilities.join(', ')}</Fact>
    ) : null}
    {entity.supportedChains.length > 0 ? <Fact>Supported chains: {entity.supportedChains.join(', ')}</Fact> : null}
    <Fact>
      Provenance: {entity.provenance.sourceClass} · Availability: {entity.availability}
    </Fact>
    <Fact>
      Revision {entity.revision} · updated <time dateTime={entity.updatedAt}>{entity.updatedAt}</time>
    </Fact>
  </Card>
)

const TreasuryCard: React.FC<{ entity: TreasuryEntity }> = ({ entity }) => (
  <Card data-testid={`treasury-entity-${entity.treasuryId}`}>
    <Meta>
      <span data-testid="treasury-type">{entity.treasuryType.replace(/_/g, ' ')}</span>
      {' · '}
      <span data-testid="treasury-disclosure" aria-label={`Disclosure: ${entity.disclosureLevel}`}>
        {entity.disclosureLevel}
      </span>
      {' · '}
      <span data-testid="treasury-lifecycle">{entity.lifecycle}</span>
    </Meta>
    <Title as="h4">Treasury disclosure</Title>
    <Fact data-testid="treasury-summary">{entity.summary}</Fact>
    {entity.walletReference.caip10 ? (
      <Fact data-testid="treasury-wallet">Wallet: {entity.walletReference.caip10}</Fact>
    ) : entity.walletReference.address ? (
      <Fact data-testid="treasury-wallet">Wallet: {entity.walletReference.address}</Fact>
    ) : (
      <Fact data-testid="treasury-wallet-unavailable">Wallet reference: not registered</Fact>
    )}
    <Fact>
      Provenance: {entity.provenance.sourceClass} · Verification: {entity.verification.state}
    </Fact>
    {entity.supportedChains.length > 0 ? <Fact>Supported chains: {entity.supportedChains.join(', ')}</Fact> : null}
    <Fact>
      Revision {entity.revision} · updated <time dateTime={entity.updatedAt}>{entity.updatedAt}</time>
    </Fact>
  </Card>
)

const OwnershipCard: React.FC<{ entity: OwnershipEntity }> = ({ entity }) => (
  <Card data-testid={`ownership-entity-${entity.ownershipId}`}>
    <Meta>
      <span data-testid="owner-model">{entity.ownerModel}</span>
      {' · '}
      <span data-testid="proxy-model">Proxy: {entity.proxyModel}</span>
      {' · '}
      <span data-testid="timelock-model">Timelock: {entity.timelockModel}</span>
    </Meta>
    <Title as="h4">{entity.subjectLabel}</Title>
    <Fact>{entity.summary}</Fact>
    {entity.relatedSectionIds.length > 0 ? (
      <Fact>
        Related:{' '}
        {entity.relatedSectionIds.map((id, idx) => (
          <React.Fragment key={id}>
            {idx > 0 ? ', ' : null}
            <SectionLink href={`#${id}`}>{id}</SectionLink>
          </React.Fragment>
        ))}
      </Fact>
    ) : null}
  </Card>
)

const UpgradeabilityCard: React.FC<{ entity: UpgradeabilityEntity }> = ({ entity }) => (
  <Card data-testid={`upgradeability-entity-${entity.upgradeabilityId}`}>
    <Meta>
      <span data-testid="upgradeability-model" aria-label={`Upgradeability: ${entity.upgradeability}`}>
        {entity.upgradeability}
      </span>
    </Meta>
    <Title as="h4">{entity.subjectLabel}</Title>
    <Fact>{entity.summary}</Fact>
  </Card>
)

const ResourceCard: React.FC<{ resource: GovernanceResource }> = ({ resource }) => {
  const href = resource.route ?? resource.url
  const openable = Boolean(href) && (resource.lifecycle === 'ACTIVE' || resource.lifecycle === 'DECLARED')
  const external = Boolean(resource.url) && !resource.route

  return (
    <Card data-testid={`governance-resource-${resource.resourceId}`}>
      <Meta>
        {resource.kind.replace(/_/g, ' ')} · {resource.lifecycle}
      </Meta>
      <Title as="h4">{resource.title}</Title>
      <Fact>{resource.summary}</Fact>
      {openable && href ? (
        <OpenLink
          href={href}
          data-testid="governance-resource-open"
          aria-label={`Open ${resource.title}`}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          Open
        </OpenLink>
      ) : (
        <Meta>Open unavailable</Meta>
      )}
    </Card>
  )
}

interface Props {
  governanceDocument: ProjectGovernanceDocument
}

const ProjectGovernanceSection: React.FC<Props> = ({ governanceDocument }) => {
  return (
    <Stack as="section" id="governance" aria-labelledby="governance-heading" data-testid="project-governance-section">
      <Heading as="h2" id="governance-heading" scale="md">
        Governance
      </Heading>
      <Fact>
        Model {governanceDocument.summary.governanceModel} · Disclosure {governanceDocument.summary.disclosureState} ·{' '}
        {governanceDocument.summary.treasuryCount} treasury disclosures
      </Fact>

      <Group aria-labelledby="governance-model-heading">
        <SubHeading as="h3" id="governance-model-heading" scale="md">
          Governance
        </SubHeading>
        <Cards>
          {governanceDocument.governance.map((entity) => (
            <GovernanceCard key={entity.governanceId} entity={entity} />
          ))}
        </Cards>
      </Group>

      <Group aria-labelledby="treasury-heading">
        <SubHeading as="h3" id="treasury-heading" scale="md">
          Treasury Transparency
        </SubHeading>
        <Cards>
          {governanceDocument.treasury.map((entity) => (
            <TreasuryCard key={entity.treasuryId} entity={entity} />
          ))}
        </Cards>
        <Fact>Balances, USD values, charts, and portfolio analytics are intentionally not shown.</Fact>
      </Group>

      <Group aria-labelledby="ownership-heading">
        <SubHeading as="h3" id="ownership-heading" scale="md">
          Ownership
        </SubHeading>
        <Cards>
          {governanceDocument.ownership.map((entity) => (
            <OwnershipCard key={entity.ownershipId} entity={entity} />
          ))}
        </Cards>
      </Group>

      <Group aria-labelledby="upgradeability-heading">
        <SubHeading as="h3" id="upgradeability-heading" scale="md">
          Upgradeability
        </SubHeading>
        <Cards>
          {governanceDocument.upgradeability.map((entity) => (
            <UpgradeabilityCard key={entity.upgradeabilityId} entity={entity} />
          ))}
        </Cards>
      </Group>

      <Group aria-labelledby="governance-resources-heading">
        <SubHeading as="h3" id="governance-resources-heading" scale="md">
          Resources
        </SubHeading>
        <Cards>
          {governanceDocument.resources.map((resource) => (
            <ResourceCard key={resource.resourceId} resource={resource} />
          ))}
        </Cards>
      </Group>

      <Fact>
        Related sections: <SectionLink href="#trust">Trust</SectionLink>
        {', '}
        <SectionLink href="#ecosystem">Ecosystem</SectionLink>
        {', '}
        <SectionLink href="#developer">Developer</SectionLink>
        {', '}
        <SectionLink href="#updates">Updates</SectionLink>
      </Fact>

      {governanceDocument.relationships.length > 0 ? (
        <Fact>
          {governanceDocument.relationships.length} machine-readable relationship
          {governanceDocument.relationships.length === 1 ? '' : 's'}
        </Fact>
      ) : null}

      <Fact>{governanceDocument.limitations[0]}</Fact>
    </Stack>
  )
}

export default ProjectGovernanceSection
