import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading } from '@pancakeswap/uikit'
import type { GrowthProgram, ProjectGrowthDocument } from 'registry/projects/identity/growth'
import { GROWTH_GROUP_KEYS, GROWTH_GROUP_LABELS, type GrowthGroupKey } from 'registry/projects/identity/growth'

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

function openHref(program: GrowthProgram): string | null {
  return program.destination.route ?? program.destination.externalUrl
}

function isExternal(program: GrowthProgram): boolean {
  return Boolean(program.destination.externalUrl) && !program.destination.route
}

const ProgramCard: React.FC<{ program: GrowthProgram }> = ({ program }) => {
  const href = openHref(program)

  return (
    <Card data-testid={`growth-program-${program.programId}`} data-status={program.status}>
      <Meta>
        <span data-testid="growth-category">{program.category.replace(/_/g, ' ')}</span>
        {' · '}
        <span data-testid="growth-status" aria-label={`Status: ${program.status}`}>
          {program.status}
        </span>
        {' · '}
        <span data-testid="growth-availability">{program.availability}</span>
      </Meta>
      <Title as="h4">{program.title}</Title>
      <Fact data-testid="growth-summary">{program.summary}</Fact>
      {program.destination.openable && href ? (
        <OpenLink
          href={href}
          data-testid="growth-open"
          aria-label={`Open ${program.title}`}
          {...(isExternal(program) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          Open
        </OpenLink>
      ) : (
        <Meta data-testid="growth-open-unavailable">Open unavailable</Meta>
      )}
      {program.relatedSectionIds.length > 0 ? (
        <Fact>
          Related:{' '}
          {program.relatedSectionIds.map((id, idx) => (
            <React.Fragment key={id}>
              {idx > 0 ? ', ' : null}
              <SectionLink href={`#${id}`}>{id}</SectionLink>
            </React.Fragment>
          ))}
        </Fact>
      ) : null}
      <Fact>
        Revision {program.revision} · updated <time dateTime={program.updatedAt}>{program.updatedAt}</time>
      </Fact>
    </Card>
  )
}

interface Props {
  growthDocument: ProjectGrowthDocument
}

const ProjectGrowthSection: React.FC<Props> = ({ growthDocument }) => {
  const byGroup = GROWTH_GROUP_KEYS.reduce<Record<GrowthGroupKey, GrowthProgram[]>>((acc, key) => {
    acc[key] = growthDocument.programs.filter((p) => p.group === key)
    return acc
  }, {} as Record<GrowthGroupKey, GrowthProgram[]>)

  return (
    <Stack as="section" id="growth" aria-labelledby="growth-heading" data-testid="project-growth-section">
      <Heading as="h2" id="growth-heading" scale="md">
        Growth
      </Heading>
      <Fact>
        {growthDocument.summary.programCount} programs · {growthDocument.summary.activeProgramCount} active
      </Fact>
      <Fact>Campaign metrics and participation counts are intentionally not shown.</Fact>

      {GROWTH_GROUP_KEYS.map((key) => {
        const programs = byGroup[key]
        if (!programs.length) return null
        return (
          <Group key={key} aria-labelledby={`growth-group-${key}`}>
            <SubHeading as="h3" id={`growth-group-${key}`} scale="md">
              {GROWTH_GROUP_LABELS[key]}
            </SubHeading>
            <Cards>
              {programs.map((program) => (
                <ProgramCard key={program.programId} program={program} />
              ))}
            </Cards>
          </Group>
        )
      })}

      <Fact>
        Related sections: <SectionLink href="#participate">Participate</SectionLink>
        {', '}
        <SectionLink href="#updates">Updates</SectionLink>
        {', '}
        <SectionLink href="#ecosystem">Ecosystem</SectionLink>
        {', '}
        <SectionLink href="#developer">Developer</SectionLink>
      </Fact>

      {growthDocument.relationships.length > 0 ? (
        <Fact>
          {growthDocument.relationships.length} machine-readable relationship
          {growthDocument.relationships.length === 1 ? '' : 's'}
        </Fact>
      ) : null}

      <Fact>{growthDocument.limitations[0]}</Fact>
    </Stack>
  )
}

export default ProjectGrowthSection
