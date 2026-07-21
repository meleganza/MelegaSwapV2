import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading } from '@pancakeswap/uikit'
import type { CanonicalProjectDocument } from 'registry/projects/identity/types'
import type { ProjectEvidencePack } from 'registry/projects/identity/evidence/types'
import { useProjectWalletRelationship } from './useProjectWalletRelationship'

const Stack = styled(Flex)`
  flex-direction: column;
  gap: 8px;
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

interface Props {
  document: CanonicalProjectDocument
  evidencePack: ProjectEvidencePack
}

/**
 * Compact "Your positions" under Participate — reuses PP004 hook/resolver.
 * Does not invent a second portfolio or execution controls.
 */
const ProjectParticipationPositionsClient: React.FC<Props> = ({ document, evidencePack }) => {
  const { relationshipDocument, loading } = useProjectWalletRelationship(document, evidencePack)
  const state = relationshipDocument.walletConnectionState

  const positions = relationshipDocument.relationships.filter(
    (r) =>
      (r.relationshipType === 'LIQUIDITY_POSITION' ||
        r.relationshipType === 'FARM_POSITION' ||
        r.relationshipType === 'POOL_POSITION' ||
        r.relationshipType === 'CLAIMABLE_REWARD') &&
      (r.status === 'ACTIVE' || r.status === 'CLAIMABLE'),
  )

  return (
    <Stack data-testid="participation-your-positions" aria-labelledby="participation-positions-heading">
      <SubHeading as="h3" id="participation-positions-heading" scale="md">
        Your positions
      </SubHeading>

      {state === 'DISCONNECTED' ? (
        <Fact>
          Connect a wallet to see project positions.{' '}
          <CtaLink href="#wallet-relationship">Your Relationship with This Project</CtaLink>
        </Fact>
      ) : null}

      {state === 'CONNECTING' || state === 'RECONNECTING' || loading ? (
        <Fact role="status">Reading wallet positions…</Fact>
      ) : null}

      {state === 'CONNECTED' && !loading ? (
        positions.length > 0 ? (
          <List aria-label="Your project positions">
            {positions.map((row) => (
              <Item key={row.relationshipId}>
                {row.displaySummary}
                {row.deepLink ? (
                  <CtaLink href={row.deepLink.href} aria-label={row.deepLink.label}>
                    {row.deepLink.label}
                  </CtaLink>
                ) : null}
              </Item>
            ))}
          </List>
        ) : (
          <Fact>
            No active project positions detected from currently supported live sources.{' '}
            <CtaLink href="#wallet-relationship">View wallet relationship</CtaLink>
          </Fact>
        )
      ) : null}
    </Stack>
  )
}

export default ProjectParticipationPositionsClient
