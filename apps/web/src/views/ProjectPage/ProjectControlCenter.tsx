import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading } from '@pancakeswap/uikit'
import type { ProjectControlCenterDocument } from 'registry/projects/identity/controlCenter'

const TOKEN_KEY = 'melega.pp012.operator.token'

const Page = styled(Flex)`
  flex-direction: column;
  gap: 20px;
  max-width: 720px;
  margin: 0 auto;
  width: 100%;
  padding: 20px 16px 48px;
  min-width: 0;
`

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

const Card = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  padding-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
`

const Label = styled.label`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSubtle};
`

const Input = styled.input`
  min-height: 44px;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  width: 100%;
`

const TextArea = styled.textarea`
  min-height: 88px;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  width: 100%;
  font: inherit;
`

const Button = styled.button`
  min-height: 44px;
  padding: 8px 14px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 8px;
  background: transparent;
  color: ${({ theme }) => theme.colors.secondary};
  cursor: pointer;
  width: fit-content;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.secondary};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const NavLink = styled.a`
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.secondary};
  text-decoration: underline;
  text-underline-offset: 2px;

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
  gap: 8px;
`

interface Props {
  slug: string
}

async function authedFetch(slug: string, path: string, init?: RequestInit) {
  const token = typeof window !== 'undefined' ? window.sessionStorage.getItem(TOKEN_KEY) : null
  if (!token) throw new Error('Missing operator token')
  const res = await fetch(`/api/private/projects/${slug}/control-center${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body?.message ?? `Request failed (${res.status})`)
  return body
}

const ProjectControlCenter: React.FC<Props> = ({ slug }) => {
  const [doc, setDoc] = useState<ProjectControlCenterDocument | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [summary, setSummary] = useState('')
  const [updateTitle, setUpdateTitle] = useState('')
  const [updateSummary, setUpdateSummary] = useState('')
  const [updateContent, setUpdateContent] = useState('')

  const reload = useCallback(async () => {
    const body = (await authedFetch(slug, '')) as ProjectControlCenterDocument
    setDoc(body)
    setDisplayName(body.stagedProfile?.displayName ?? '')
    setSummary(body.stagedProfile?.summary ?? '')
  }, [slug])

  useEffect(() => {
    reload().catch((err: Error) => setError(err.message))
  }, [reload])

  const onSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault()
    setStatus(null)
    setError(null)
    try {
      await authedFetch(slug, '/profile', {
        method: 'PATCH',
        body: JSON.stringify({ displayName, summary }),
      })
      setStatus('Profile draft staged. Immutable audit record created.')
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profile staging failed')
    }
  }

  const onPublishUpdate = async (event: React.FormEvent) => {
    event.preventDefault()
    setStatus(null)
    setError(null)
    try {
      await authedFetch(slug, '/updates', {
        method: 'POST',
        body: JSON.stringify({
          stableKey: `melega-dex.staged.${Date.now()}`,
          version: '1.0.0',
          title: updateTitle,
          summary: updateSummary,
          content: updateContent,
          category: 'PROJECT_NEWS',
        }),
      })
      setStatus('Update staged (PP008-compatible). Frozen public timeline not mutated.')
      setUpdateTitle('')
      setUpdateSummary('')
      setUpdateContent('')
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update staging failed')
    }
  }

  if (error && !doc) {
    return (
      <Page as="main" id="project-control-center" data-testid="project-control-center">
        <Heading as="h1" scale="lg">
          Project Control Center
        </Heading>
        <Fact role="alert">{error}</Fact>
        <Fact>
          Authenticate from the Project Page owner access control. Wallet SIWE is not available in this repository.
        </Fact>
      </Page>
    )
  }

  if (!doc) {
    return (
      <Page as="main">
        <Fact>Loading Control Center…</Fact>
      </Page>
    )
  }

  return (
    <Page as="main" id="project-control-center" data-testid="project-control-center" aria-labelledby="cc-heading">
      <Heading as="h1" id="cc-heading" scale="lg">
        Project Control Center
      </Heading>
      <Fact>
        Claim {doc.claimState} · Owner verification {doc.overview.ownerVerification} · Revision {doc.revision}
      </Fact>
      <Fact>{doc.limitations[0]}</Fact>

      <Nav aria-label="Control Center sections">
        {doc.sections.map((section) => (
          <NavLink key={section} href={`#cc-${section.toLowerCase()}`}>
            {section.replace(/_/g, ' ')}
          </NavLink>
        ))}
      </Nav>

      <Card id="cc-overview" aria-labelledby="cc-overview-heading">
        <Heading as="h2" id="cc-overview-heading" scale="md">
          Overview
        </Heading>
        <Fact>No fake completion percentages. Gaps listed factually:</Fact>
        <List>
          {doc.overview.completionGaps.map((gap) => (
            <li key={gap.id}>
              <Fact>
                [{gap.section}] {gap.label}
                {gap.requiresVerification ? ' (verification required)' : ''}
              </Fact>
            </li>
          ))}
        </List>
        <List>
          {doc.overview.evidenceGaps.map((gap) => (
            <li key={gap}>
              <Fact>Evidence gap: {gap}</Fact>
            </li>
          ))}
        </List>
        <List>
          {doc.overview.pendingActions.map((action) => (
            <li key={action.id}>
              <Fact>
                Pending: {action.label}
                {action.permission ? ` · ${action.permission}` : ''}
              </Fact>
            </li>
          ))}
        </List>
      </Card>

      <Card id="cc-profile" aria-labelledby="cc-profile-heading">
        <Heading as="h2" id="cc-profile-heading" scale="md">
          Profile
        </Heading>
        <Stack as="form" onSubmit={onSaveProfile} aria-label="Stage profile draft">
          <Label htmlFor="cc-display-name">Title</Label>
          <Input
            id="cc-display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            aria-required="true"
          />
          <Label htmlFor="cc-summary">Summary</Label>
          <TextArea id="cc-summary" value={summary} onChange={(e) => setSummary(e.target.value)} />
          <Button type="submit">Stage profile draft</Button>
        </Stack>
      </Card>

      <Card id="cc-resources" aria-labelledby="cc-resources-heading">
        <Heading as="h2" id="cc-resources-heading" scale="md">
          Resources
        </Heading>
        <Fact>
          Staged resources: {doc.stagedResources.length}. Use private POST /resources for documentation, whitepaper,
          GitHub, website, socials, APIs, SDKs.
        </Fact>
        <List>
          {doc.stagedResources.map((r) => (
            <li key={r.resourceKey}>
              <Fact>
                {r.kind}: {r.title} · rev {r.revision}
              </Fact>
            </li>
          ))}
        </List>
      </Card>

      <Card id="cc-updates" aria-labelledby="cc-updates-heading">
        <Heading as="h2" id="cc-updates-heading" scale="md">
          Updates
        </Heading>
        <Stack as="form" onSubmit={onPublishUpdate} aria-label="Stage update publication">
          <Label htmlFor="cc-update-title">Title</Label>
          <Input id="cc-update-title" value={updateTitle} onChange={(e) => setUpdateTitle(e.target.value)} required />
          <Label htmlFor="cc-update-summary">Summary</Label>
          <Input
            id="cc-update-summary"
            value={updateSummary}
            onChange={(e) => setUpdateSummary(e.target.value)}
            required
          />
          <Label htmlFor="cc-update-content">Content</Label>
          <TextArea
            id="cc-update-content"
            value={updateContent}
            onChange={(e) => setUpdateContent(e.target.value)}
            required
          />
          <Button type="submit">Stage update for PP008 timeline</Button>
        </Stack>
        <List>
          {doc.stagedUpdates.map((u) => (
            <li key={u.stableKey}>
              <Fact>
                {u.title} · {u.status} · <time dateTime={u.publishedAt}>{u.publishedAt}</time>
              </Fact>
            </li>
          ))}
        </List>
      </Card>

      <Card id="cc-developer" aria-labelledby="cc-developer-heading">
        <Heading as="h2" id="cc-developer-heading" scale="md">
          Developer
        </Heading>
        <Fact>Staged developer resources: {doc.stagedDeveloper.length}. No code hosting.</Fact>
      </Card>

      <Card id="cc-ecosystem" aria-labelledby="cc-ecosystem-heading">
        <Heading as="h2" id="cc-ecosystem-heading" scale="md">
          Ecosystem
        </Heading>
        <Fact>Staged ecosystem services: {doc.stagedEcosystem.length}. No runtime configuration.</Fact>
      </Card>

      <Card id="cc-verification" aria-labelledby="cc-verification-heading">
        <Heading as="h2" id="cc-verification-heading" scale="md">
          Verification
        </Heading>
        <Fact>Owner verification: {doc.overview.ownerVerification}</Fact>
        <Fact>No automatic verification. Missing proofs listed under Overview evidence gaps.</Fact>
        <List>
          {doc.owners.map((owner) => (
            <li key={owner.ownerId}>
              <Fact>
                {owner.identityLabel} · {owner.identityType} · {owner.verificationState} · roles{' '}
                {owner.roles.join(', ')}
              </Fact>
            </li>
          ))}
        </List>
      </Card>

      <Card id="cc-audit_history" aria-labelledby="cc-audit-heading">
        <Heading as="h2" id="cc-audit-heading" scale="md">
          Audit History
        </Heading>
        <Fact>Immutable append-only records. Deletion is not supported.</Fact>
        <List>
          {doc.audit.map((entry) => (
            <li key={entry.auditId} data-testid="audit-entry">
              <Fact>
                <time dateTime={entry.createdAt}>{entry.createdAt}</time> · {entry.action} · {entry.summary} · rev{' '}
                {entry.afterRevision}
              </Fact>
            </li>
          ))}
        </List>
      </Card>

      {status ? <Fact role="status">{status}</Fact> : null}
      {error ? (
        <Fact role="alert" data-testid="cc-error">
          {error}
        </Fact>
      ) : null}

      <NavLink href={`/project-hq/${slug}`}>Back to Project Page</NavLink>
    </Page>
  )
}

export default ProjectControlCenter
