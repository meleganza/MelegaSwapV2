import React from 'react'
import styled from 'styled-components'
import type {
  SpaceBadgeSnapshot,
  SpaceCertificationSnapshot,
  SpaceProfessionalProfileSnapshot,
} from 'lib/space-professional-profile'
import { activeCredentials } from 'lib/space-professional-profile'
import { useProjectSpaceProfessionalProfile } from './useProjectSpaceProfessionalProfile'
import {
  BodyText,
  EmptyState,
  EmptyStateBody,
  EmptyStateTitle,
  GOLD,
  MUTED,
  MutedText,
  Section,
  SectionTitle,
  TEXT,
} from './theme'

interface Props {
  slug: string
}

const HeaderRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px 16px;
`

const StatusPill = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${GOLD};
`

const ProfileRow = styled.div`
  display: flex;
  gap: 14px;
  align-items: flex-start;
  min-width: 0;
`

const Avatar = styled.div<{ $src?: string }>`
  flex: 0 0 48px;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 1px solid #2a2a2a;
  background: ${({ $src }) => ($src ? `center/cover url(${$src})` : '#161616')};
`

const ProfileMeta = styled.div`
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const Name = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${TEXT};
  word-break: break-word;
`

const TypeLine = styled.div`
  font-size: 13px;
  color: ${MUTED};
`

const ChipRow = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Chip = styled.li`
  border: 1px solid #2a2a2a;
  background: #121212;
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 13px;
  color: ${TEXT};
  max-width: 100%;
`

const Kind = styled.span`
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${GOLD};
  margin-bottom: 2px;
`

const Cta = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 16px;
  border-radius: 12px;
  background: ${GOLD};
  color: #111;
  font-weight: 800;
  font-size: 14px;
  text-decoration: none;
  width: fit-content;
  max-width: 100%;

  &:focus-visible {
    outline: 2px solid ${GOLD};
    outline-offset: 2px;
  }
`

function titleForStatus(status: SpaceProfessionalProfileSnapshot['status']): string {
  switch (status) {
    case 'NO_CANONICAL_LINK':
      return 'Professional Profile not linked'
    case 'SPACE_UNAVAILABLE':
      return 'SPACE profile temporarily unavailable'
    case 'SUSPENDED_PROFILE':
      return 'SPACE profile suspended'
    case 'PARTIAL_DATA':
      return 'SPACE Professional Profile'
    case 'STALE_DATA':
      return 'SPACE Professional Profile'
    default:
      return 'SPACE Professional Profile'
  }
}

const ProjectSpaceProfessionalProfile: React.FC<Props> = ({ slug }) => {
  const state = useProjectSpaceProfessionalProfile(slug)

  if (state.status === 'loading') {
    return (
      <Section aria-labelledby="space-profile-heading" data-testid="project-space-widget">
        <HeaderRow>
          <SectionTitle id="space-profile-heading">SPACE Professional Profile</SectionTitle>
        </HeaderRow>
        <MutedText>Loading SPACE relationship…</MutedText>
      </Section>
    )
  }

  const snapshot = state.snapshot
  const services = snapshot.services.slice(0, 3)
  const activeBadges = activeCredentials<SpaceBadgeSnapshot>(snapshot.badges)
  const activeCerts = activeCredentials<SpaceCertificationSnapshot>(snapshot.certifications)
  const credentials = [
    ...activeBadges.map((b) => ({
      kind: 'Badge' as const,
      id: b.badgeId,
      label: b.publicName,
    })),
    ...activeCerts.map((c) => ({
      kind: 'Certification' as const,
      id: c.certificationId,
      label: c.publicTitle,
    })),
  ].slice(0, 4)

  const showEmpty =
    snapshot.status === 'NO_CANONICAL_LINK' ||
    snapshot.status === 'SPACE_UNAVAILABLE' ||
    snapshot.status === 'SUSPENDED_PROFILE'

  return (
    <Section aria-labelledby="space-profile-heading" data-testid="project-space-widget">
      <HeaderRow>
        <SectionTitle id="space-profile-heading">{titleForStatus(snapshot.status)}</SectionTitle>
        <StatusPill aria-label={`SPACE status ${snapshot.status}`}>{snapshot.status.replace(/_/g, ' ')}</StatusPill>
      </HeaderRow>

      {showEmpty ? (
        <EmptyState data-testid={`project-space-${snapshot.status.toLowerCase()}`}>
          <EmptyStateTitle>{titleForStatus(snapshot.status)}</EmptyStateTitle>
          <EmptyStateBody>{snapshot.message}</EmptyStateBody>
          {snapshot.status === 'NO_CANONICAL_LINK' ? (
            <MutedText>This does not assert that no SPACE profile exists elsewhere.</MutedText>
          ) : null}
          {snapshot.freshness === 'stale' || snapshot.status === 'STALE_DATA' ? (
            <MutedText>Last verified from SPACE {snapshot.updatedAt || snapshot.fetchedAt}</MutedText>
          ) : null}
        </EmptyState>
      ) : (
        <>
          <ProfileRow>
            <Avatar $src={snapshot.avatarOrLogo} aria-hidden />
            <ProfileMeta>
              <Name>{snapshot.displayName || 'SPACE profile'}</Name>
              {snapshot.profileType ? <TypeLine>{snapshot.profileType}</TypeLine> : null}
              {snapshot.verificationState ? (
                <TypeLine>Verification: {snapshot.verificationState}</TypeLine>
              ) : (
                <TypeLine>Verification: not reported by SPACE</TypeLine>
              )}
              {snapshot.shortProfessionalDescription ? (
                <BodyText>{snapshot.shortProfessionalDescription}</BodyText>
              ) : null}
              {(snapshot.status === 'STALE_DATA' || snapshot.freshness === 'stale') && (
                <MutedText>Last verified from SPACE {snapshot.updatedAt || snapshot.fetchedAt}</MutedText>
              )}
              {snapshot.status === 'PARTIAL_DATA' ? <MutedText>{snapshot.message}</MutedText> : null}
            </ProfileMeta>
          </ProfileRow>

          {services.length > 0 ? (
            <div>
              <MutedText as="h3" style={{ margin: '0 0 8px', color: MUTED, fontWeight: 700 }}>
                Services
              </MutedText>
              <ChipRow aria-label="SPACE services">
                {services.map((s) => (
                  <Chip key={`${s.title}-${s.category || ''}`}>
                    <Kind>Service</Kind>
                    {s.title}
                    {s.priceStatus ? <MutedText>{s.priceStatus}</MutedText> : null}
                  </Chip>
                ))}
              </ChipRow>
            </div>
          ) : null}

          {credentials.length > 0 ? (
            <div>
              <MutedText as="h3" style={{ margin: '0 0 8px', color: MUTED, fontWeight: 700 }}>
                Credentials
              </MutedText>
              <ChipRow aria-label="SPACE credentials">
                {credentials.map((c) => (
                  <Chip key={c.id}>
                    <Kind>{c.kind}</Kind>
                    {c.label}
                  </Chip>
                ))}
              </ChipRow>
            </div>
          ) : (
            <MutedText>No active SPACE badges or certifications reported.</MutedText>
          )}

          {snapshot.canonicalUrl ? (
            <Cta href={snapshot.canonicalUrl} target="_blank" rel="noopener noreferrer">
              View Professional Profile on SPACE
            </Cta>
          ) : null}
        </>
      )}

      <MutedText>Authority: SPACE · Melega DEX does not issue SPACE credentials.</MutedText>
    </Section>
  )
}

export default ProjectSpaceProfessionalProfile
