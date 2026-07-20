import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading } from '@pancakeswap/uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
import type { ProjectWalletRelationshipDocument } from 'registry/projects/identity/walletRelationship'

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

const DeepLink = styled.a`
  color: ${({ theme }) => theme.colors.secondary};
  text-decoration: underline;
  text-underline-offset: 2px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  margin-left: 8px;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.secondary};
    outline-offset: 2px;
  }
`

const Details = styled.details`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 8px;
  padding: 8px 12px;

  &[open] > summary {
    margin-bottom: 8px;
  }
`

const Summary = styled.summary`
  cursor: pointer;
  font-size: 14px;
  min-height: 44px;
  display: flex;
  align-items: center;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.secondary};
    outline-offset: 2px;
  }
`

const SrOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`

interface Props {
  document: ProjectWalletRelationshipDocument
  loading: boolean
}

const WalletRelationshipSection: React.FC<Props> = ({ document: doc, loading }) => {
  const detected = doc.relationships.filter((r) =>
    ['ASSET_HOLDING', 'LIQUIDITY_POSITION', 'FARM_POSITION', 'POOL_POSITION', 'CLAIMABLE_REWARD'].includes(
      r.relationshipType,
    ) &&
    (r.status === 'ACTIVE' || r.status === 'CLAIMABLE'),
  )

  return (
    <Stack
      as="section"
      id="wallet-relationship"
      aria-labelledby="wallet-relationship-heading"
      data-testid="wallet-relationship-section"
      data-pp004="true"
      data-wallet-state={doc.walletConnectionState}
    >
      <Heading as="h2" id="wallet-relationship-heading" scale="md">
        Your Relationship with This Project
      </Heading>

      <SrOnly aria-live="polite">
        Wallet state: {doc.walletConnectionState}
        {loading ? ', loading relationship data' : ''}
      </SrOnly>

      {doc.walletConnectionState === 'DISCONNECTED' ? (
        <>
          <Fact>Connect a wallet to see holdings and positions linked to this project.</Fact>
          <ConnectWalletButton scale="sm" />
        </>
      ) : null}

      {doc.walletConnectionState === 'CONNECTING' || doc.walletConnectionState === 'RECONNECTING' || loading ? (
        <Fact data-testid="wallet-relationship-loading" role="status">
          Reading wallet relationship…
        </Fact>
      ) : null}

      {doc.walletConnectionState === 'CONNECTED' && !loading ? (
        <>
          {doc.walletAccount ? (
            <Fact>
              Wallet account: <code>{doc.walletAccount}</code>
              {doc.observedChains.length
                ? ` · Chains observed: ${doc.observedChains.join(', ')}`
                : ''}
            </Fact>
          ) : null}

          {detected.length > 0 ? (
            <List aria-label="Detected project relationships">
              {detected.map((row) => (
                <Item key={row.relationshipId} data-testid={`wallet-rel-${row.relationshipType}`}>
                  {row.displaySummary}
                  {row.deepLink ? (
                    <DeepLink href={row.deepLink.href}>{row.deepLink.label}</DeepLink>
                  ) : null}
                </Item>
              ))}
            </List>
          ) : (
            <Fact data-testid="wallet-relationship-empty">
              No active relationship with this project was detected from the currently supported live sources.
            </Fact>
          )}

          {doc.errors.length > 0 ? (
            <Details>
              <Summary>Partial or unavailable reads</Summary>
              <List aria-label="Unavailable relationship readers">
                {doc.errors.map((err) => (
                  <Item key={`${err.reasonCode}-${err.category}`}>
                    {err.category}: {err.message}
                    {err.chainId != null ? ` (chain ${err.chainId})` : ''}
                  </Item>
                ))}
              </List>
            </Details>
          ) : null}

          {doc.relevantCapabilities.some((c) => c.relevance === 'RELEVANT') ? (
            <Details>
              <Summary>Relevant capabilities</Summary>
              <List>
                {doc.relevantCapabilities
                  .filter((c) => c.relevance === 'RELEVANT')
                  .map((c) => (
                    <Item key={c.capabilityKey}>
                      {c.label}
                      {c.destination ? (
                        <DeepLink href={c.destination.href}>{c.destination.label}</DeepLink>
                      ) : null}
                    </Item>
                  ))}
              </List>
            </Details>
          ) : null}

          <Fact>{doc.limitations[0]}</Fact>
        </>
      ) : null}
    </Stack>
  )
}

export default WalletRelationshipSection
