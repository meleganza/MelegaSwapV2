import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading } from '@pancakeswap/uikit'
import type { ProjectMachineDocument } from 'registry/projects/identity/machine'

const Stack = styled(Flex)`
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`

const Fact = styled(Text)`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSubtle};
  line-height: 1.5;
  word-break: break-word;
`

const Meta = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSubtle};
  word-break: break-word;
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

const Facts = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`

interface Props {
  machineDocument: ProjectMachineDocument
}

const ProjectMachineSection: React.FC<Props> = ({ machineDocument }) => {
  const { machineInterface, summary, schemas } = machineDocument
  const schemaList = schemas.map((s) => s.schemaVersion).join(', ')

  return (
    <Stack as="section" id="machine" aria-labelledby="machine-heading" data-testid="project-machine-section">
      <Heading as="h2" id="machine-heading" scale="md">
        Machine Interface
      </Heading>
      <Fact>
        Developers and AI agents can discover Project Operating System capabilities through the public Machine API.
        Execution remains in human product surfaces — see <SectionLink href="#developer">Developer</SectionLink>,{' '}
        <SectionLink href="#trust">Trust</SectionLink>, and <SectionLink href="#participate">Participate</SectionLink>.
      </Fact>
      <Facts>
        <li>
          <Meta>
            Machine API:{' '}
            <OpenLink href={machineInterface.machineEndpoint} data-testid="machine-api-link">
              {machineInterface.machineEndpoint}
            </OpenLink>
          </Meta>
        </li>
        <li>
          <Meta data-testid="machine-capability-count">Capabilities: {summary.capabilityCount}</Meta>
        </li>
        <li>
          <Meta data-testid="machine-schemas">Schemas: {schemaList}</Meta>
        </li>
        <li>
          <Meta>
            Discovery:{' '}
            <OpenLink href={machineInterface.wellKnownPath} data-testid="machine-discovery-link">
              {machineInterface.wellKnownPath}
            </OpenLink>
          </Meta>
        </li>
        <li>
          <Meta data-testid="machine-version">
            Version: {machineInterface.version} ({machineDocument.schemaVersion})
          </Meta>
        </li>
      </Facts>
    </Stack>
  )
}

export default ProjectMachineSection
