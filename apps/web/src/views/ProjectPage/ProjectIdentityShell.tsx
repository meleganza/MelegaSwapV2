import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading } from '@pancakeswap/uikit'
import type { CanonicalProjectDocument } from 'registry/projects/identity/types'
import type { ProjectEvidencePack } from 'registry/projects/identity/evidence/types'
import TrustEvidencePanel from './TrustEvidencePanel'

/** Avoid Layout/Page — its PageMeta would overwrite Project Page SEO. */
const PageFrame = styled.div`
  width: 100%;
  min-height: calc(100vh - 64px);
  padding-top: 20px;
  padding-bottom: 48px;
`

const Shell = styled(Flex)`
  flex-direction: column;
  gap: 28px;
  max-width: 720px;
  margin: 0 auto;
  width: 100%;
  padding: 0 16px 48px;

  @media (max-width: 767px) {
    display: flex;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
`

const Section = styled.section<{ $mobileOrder?: number }>`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 767px) {
    order: ${({ $mobileOrder }) => $mobileOrder ?? 0};
  }
`

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  padding-bottom: 4px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};

  @media (max-width: 767px) {
    order: 0;
  }
`

const NavLink = styled.a`
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 14px;
  text-decoration: none;
  padding: 8px 0;
  min-height: 44px;
  display: inline-flex;
  align-items: center;

  &:hover,
  &:focus-visible {
    color: ${({ theme }) => theme.colors.secondary};
    outline: 2px solid ${({ theme }) => theme.colors.secondary};
    outline-offset: 2px;
  }
`

const LogoFallback = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSubtle};
  flex-shrink: 0;
`

const LogoImg = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
`

const MetaRow = styled(Flex)`
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
`

const Fact = styled(Text)`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSubtle};
`

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text};
`

const ResourceLink = styled.a`
  color: ${({ theme }) => theme.colors.secondary};
  text-decoration: underline;
  text-underline-offset: 2px;
  font-size: 14px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  word-break: break-word;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.secondary};
    outline-offset: 2px;
  }
`

const Mono = styled.code`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  word-break: break-all;
  color: ${({ theme }) => theme.colors.text};
`

const CopyButton = styled.button`
  appearance: none;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 8px;
  padding: 8px 12px;
  min-height: 44px;
  min-width: 44px;
  font-size: 13px;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.secondary};
    outline-offset: 2px;
  }
`

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const ListItem = styled.li`
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  document: CanonicalProjectDocument
  evidencePack: ProjectEvidencePack
}

const ProjectIdentityShell: React.FC<Props> = ({ document: doc, evidencePack }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const onCopy = useCallback(async (id: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedId(id)
      window.setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 2000)
    } catch {
      setCopiedId(null)
    }
  }, [])

  const initials = doc.identity.displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  const primaryAssets = doc.assets.filter((asset) => asset.projectRole === 'primary')
  const assetsToShow = primaryAssets.length ? primaryAssets : doc.assets

  return (
    <PageFrame>
      <Shell as="main" id="project-identity-shell" data-testid="project-identity-shell">
        <Nav aria-label="Project page sections">
          {doc.navSections.map((section) => (
            <NavLink key={section.id} href={`#${section.id}`}>
              {section.label}
            </NavLink>
          ))}
        </Nav>

        <Section $mobileOrder={1} aria-labelledby="project-identity-heading" data-testid="project-identity-hero">
          <Flex style={{ gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {doc.identity.logoUrl.meta.availability === 'AVAILABLE' && doc.identity.logoUrl.value ? (
              <LogoImg
                src={doc.identity.logoUrl.value}
                alt={`${doc.identity.displayName} logo`}
                width={64}
                height={64}
              />
            ) : (
              <LogoFallback aria-hidden="true" title="Logo unavailable">
                {initials || '?'}
              </LogoFallback>
            )}
            <Flex flexDirection="column" style={{ gap: 8, minWidth: 0, flex: 1 }}>
              <Heading as="h1" id="project-identity-heading" scale="lg">
                {doc.identity.displayName}
              </Heading>
              {doc.identity.shortPurpose.meta.availability === 'AVAILABLE' && doc.identity.shortPurpose.value ? (
                <Text color="textSubtle">{doc.identity.shortPurpose.value}</Text>
              ) : null}
              <MetaRow>
                {doc.identity.projectType.meta.availability === 'AVAILABLE' && doc.identity.projectType.value ? (
                  <Chip>{doc.identity.projectType.value}</Chip>
                ) : null}
                {doc.identity.categories.map((category) => (
                  <Chip key={category}>{category}</Chip>
                ))}
              </MetaRow>
            </Flex>
          </Flex>
        </Section>

        <Section $mobileOrder={2} aria-label="Primary verified facts" data-testid="project-primary-facts">
          {doc.identity.verificationState.meta.availability === 'AVAILABLE' && doc.identity.verificationState.value ? (
            <Fact>
              <SrOnly>Verification: </SrOnly>
              {doc.identity.verificationState.value}
            </Fact>
          ) : null}
          <Fact>Registry updated: {doc.updatedAt ?? 'unavailable'}</Fact>
          {doc.chains.length > 0 ? (
            <MetaRow>
              {doc.chains.map((chain) => (
                <Chip key={chain.caip2} title={chain.caip2}>
                  {chain.label}
                </Chip>
              ))}
            </MetaRow>
          ) : null}
        </Section>

        <Section $mobileOrder={3} id="trust" aria-labelledby="trust-heading" data-testid="project-trust-state">
          <TrustEvidencePanel pack={evidencePack} />
          {doc.identity.readiness.meta.availability === 'AVAILABLE' && doc.identity.readiness.value ? (
            <div>
              <Text fontSize="14px">
                {doc.identity.readiness.value.label}: {doc.identity.readiness.value.score}
              </Text>
              <Fact>{doc.identity.readiness.value.disclaimer} Readiness is not a safety rating.</Fact>
            </div>
          ) : null}
        </Section>

        <Section $mobileOrder={4} id="overview" aria-labelledby="overview-heading" data-testid="project-overview">
          <Heading as="h2" id="overview-heading" scale="md">
            Overview
          </Heading>
          {doc.identity.description.meta.availability === 'AVAILABLE' && doc.identity.description.value ? (
            <Text style={{ lineHeight: 1.6 }}>{doc.identity.description.value}</Text>
          ) : (
            <Fact>Overview description unavailable in registry.</Fact>
          )}
        </Section>

        <Section
          $mobileOrder={5}
          id="ecosystem"
          aria-labelledby="deployments-heading"
          data-testid="project-deployments"
        >
          <Heading as="h2" id="deployments-heading" scale="md">
            Supported chains and deployments
          </Heading>
          {doc.deployments.length > 0 ? (
            <List>
              {doc.deployments.map((deployment) => (
                <ListItem key={deployment.deploymentId}>
                  <Text fontSize="14px">
                    {doc.chains.find((c) => c.chainId === deployment.chainId)?.label ?? deployment.caip2}
                  </Text>
                  <Fact>
                    {deployment.caip2}
                    {deployment.status.meta.availability === 'AVAILABLE' && deployment.status.value
                      ? ` · ${deployment.status.value}`
                      : ''}
                    {` · ${deployment.associatedContractIds.length} associated contract(s)`}
                  </Fact>
                </ListItem>
              ))}
            </List>
          ) : (
            <Fact>No deployments listed in registry.</Fact>
          )}
        </Section>

        <Section $mobileOrder={6} aria-labelledby="resources-heading" data-testid="project-resources">
          <Heading as="h2" id="resources-heading" scale="md">
            Official resources
          </Heading>
          {doc.resources.length > 0 ? (
            <List>
              {doc.resources.map((resource) => (
                <ListItem key={resource.url}>
                  <ResourceLink
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${resource.label} (opens in a new tab)`}
                  >
                    {resource.label}
                  </ResourceLink>
                  <Fact>{resource.resourceType}</Fact>
                </ListItem>
              ))}
            </List>
          ) : (
            <Fact>No validated official resources in registry.</Fact>
          )}
        </Section>

        <Section $mobileOrder={7} aria-labelledby="assets-heading" data-testid="project-assets-contracts">
          <Heading as="h2" id="assets-heading" scale="md">
            Assets and contracts
          </Heading>
          {assetsToShow.length > 0 ? (
            <div>
              <Heading as="h3" scale="md" style={{ marginBottom: 8 }}>
                Principal assets
              </Heading>
              <List>
                {assetsToShow.map((asset) => (
                  <ListItem key={asset.assetId}>
                    <Text fontSize="14px">
                      {asset.symbol.meta.availability === 'AVAILABLE' ? asset.symbol.value : 'Asset'}{' '}
                      <Fact as="span">({asset.caip2})</Fact>
                    </Text>
                    {asset.contractAddress ? (
                      <Flex style={{ gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Mono>{asset.contractAddress}</Mono>
                        <CopyButton
                          type="button"
                          onClick={() => onCopy(asset.assetId, asset.contractAddress!)}
                          aria-label={`Copy contract address ${asset.contractAddress}`}
                        >
                          {copiedId === asset.assetId ? 'Copied' : 'Copy'}
                        </CopyButton>
                      </Flex>
                    ) : null}
                  </ListItem>
                ))}
              </List>
            </div>
          ) : (
            <Fact>No token assets registered for this project.</Fact>
          )}

          {doc.contracts.length > 0 ? (
            <div>
              <Heading as="h3" scale="md" style={{ marginBottom: 8 }}>
                Classified contracts
              </Heading>
              <List>
                {doc.contracts.map((contract) => (
                  <ListItem key={contract.contractId}>
                    <Text fontSize="13px">
                      {contract.classification.replace(/_/g, ' ')} · {contract.caip2}
                    </Text>
                    <Flex style={{ gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Mono>{contract.address}</Mono>
                      <CopyButton
                        type="button"
                        onClick={() => onCopy(contract.contractId, contract.address)}
                        aria-label={`Copy contract address ${contract.address}`}
                      >
                        {copiedId === contract.contractId ? 'Copied' : 'Copy'}
                      </CopyButton>
                      {contract.explorerUrl.meta.availability === 'AVAILABLE' && contract.explorerUrl.value ? (
                        <ResourceLink
                          href={contract.explorerUrl.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View contract ${contract.address} on block explorer (opens in a new tab)`}
                        >
                          Explorer
                        </ResourceLink>
                      ) : null}
                    </Flex>
                  </ListItem>
                ))}
              </List>
            </div>
          ) : null}
        </Section>
      </Shell>
    </PageFrame>
  )
}

export default ProjectIdentityShell
