import React from 'react'
import styled from 'styled-components'
import type { CanonicalProjectDocument } from 'registry/projects/identity/types'
import type { ProjectEcosystemDocument } from 'registry/projects/identity/ecosystem'
import { EmptyState, EmptyStateBody, EmptyStateTitle, Section, SectionTitle } from './theme'
import { getPrimaryAsset, getSocialResources } from './helpers'
import { IconCopy, IconCheck, socialIconFor } from './ProjectWebsiteIcons'
import { shortenAddress } from '../presentation/humanLabels'

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (min-width: 480px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`

const IconButton = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 72px;
  padding: 12px 8px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #151515;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  text-align: center;

  &:focus-visible {
    outline: 2px solid #ddb92f;
    outline-offset: 2px;
  }
`

const ContractBox = styled.div`
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #0b0b0b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.65);
  word-break: break-all;
`

const CopyBtn = styled.button`
  border: none;
  background: transparent;
  color: #ddb92f;
  cursor: pointer;
  display: inline-flex;
  padding: 4px;
`

function socialDisplayLabel(label: string, resourceType: string): string {
  const key = `${label} ${resourceType}`.toLowerCase()
  if (/twitter|^x$|x\.com/.test(key)) return 'X'
  if (/telegram/.test(key)) return 'Telegram'
  if (/discord/.test(key)) return 'Discord'
  if (/github/.test(key)) return 'GitHub'
  if (/instagram/.test(key)) return 'Instagram'
  if (/youtube/.test(key)) return 'YouTube'
  if (/doc|wiki|paper/.test(key)) return 'Docs'
  if (/website|home|official/.test(key)) return 'Website'
  return label
}

interface Props {
  document: CanonicalProjectDocument
  ecosystemDocument: ProjectEcosystemDocument
}

const ProjectCommunitySection: React.FC<Props> = ({ document }) => {
  const socials = getSocialResources(document)
  const contract = getPrimaryAsset(document)?.contractAddress ?? null
  const [copied, setCopied] = React.useState(false)

  return (
    <Section aria-labelledby="community-heading">
      <SectionTitle id="community-heading">Community & Links</SectionTitle>

      {socials.length > 0 ? (
        <IconGrid aria-label="Official community links">
          {socials.map((resource) => (
            <IconButton
              key={resource.url}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${socialDisplayLabel(resource.label, resource.resourceType)} (opens in a new tab)`}
            >
              {socialIconFor(resource.label, resource.resourceType, 18)}
              {socialDisplayLabel(resource.label, resource.resourceType)}
            </IconButton>
          ))}
        </IconGrid>
      ) : (
        <EmptyState>
          <EmptyStateTitle>Not available yet</EmptyStateTitle>
          <EmptyStateBody>Official community links will appear here when they are registered.</EmptyStateBody>
        </EmptyState>
      )}

      {contract ? (
        <ContractBox>
          <span title={contract}>{shortenAddress(contract, 10, 8)}</span>
          <CopyBtn
            type="button"
            aria-label="Copy contract address"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(contract)
                setCopied(true)
                window.setTimeout(() => setCopied(false), 1500)
              } catch {
                /* ignore */
              }
            }}
          >
            {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
          </CopyBtn>
        </ContractBox>
      ) : null}
    </Section>
  )
}

export default ProjectCommunitySection
