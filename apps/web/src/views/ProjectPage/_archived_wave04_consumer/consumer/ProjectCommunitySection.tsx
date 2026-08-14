import React from 'react'
import styled from 'styled-components'
import type { CanonicalProjectDocument } from 'registry/projects/identity/types'
import type { ProjectEcosystemDocument } from 'registry/projects/identity/ecosystem'
import { EmptyState, EmptyStateBody, EmptyStateTitle, Section, SectionTitle } from './theme'
import { getSocialResources } from './helpers'

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (min-width: 480px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`

const IconButton = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 88px;
  padding: 16px 12px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(145deg, rgba(22, 22, 22, 0.9) 0%, rgba(14, 14, 14, 0.85) 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  text-align: center;

  &:focus-visible {
    outline: 2px solid #F4C430;
    outline-offset: 2px;
  }
`

const IconGlyph = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(244, 196, 48, 0.1);
  border: 1px solid rgba(244, 196, 48, 0.25);
  font-size: 20px;
  line-height: 1;
`

function socialIcon(label: string, resourceType: string): string {
  const key = `${label} ${resourceType}`.toLowerCase()
  if (/twitter|^x$|x\.com/.test(key)) return '𝕏'
  if (/telegram/.test(key)) return '✈'
  if (/discord/.test(key)) return '◆'
  if (/github/.test(key)) return '{ }'
  if (/doc|wiki|paper/.test(key)) return '📄'
  if (/website|home|official/.test(key)) return '🌐'
  return '↗'
}

function socialDisplayLabel(label: string, resourceType: string): string {
  const key = `${label} ${resourceType}`.toLowerCase()
  if (/twitter|^x$|x\.com/.test(key)) return 'X'
  if (/telegram/.test(key)) return 'Telegram'
  if (/discord/.test(key)) return 'Discord'
  if (/github/.test(key)) return 'GitHub'
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

  return (
    <Section aria-labelledby="community-heading">
      <SectionTitle id="community-heading">Community</SectionTitle>

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
              <IconGlyph aria-hidden="true">
                {socialIcon(resource.label, resource.resourceType)}
              </IconGlyph>
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
    </Section>
  )
}

export default ProjectCommunitySection
