import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading } from '@pancakeswap/uikit'
import type { ProjectEvidencePack, ProjectEvidenceRecord } from 'registry/projects/identity/evidence/types'
import { isSafeHttpUrl } from 'registry/projects/identity/urlSafety'

const SummaryList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const SummaryItem = styled.li`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`

const Fact = styled(Text)`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSubtle};
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
  list-style-position: outside;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.secondary};
    outline-offset: 2px;
  }
`

const MetaGrid = styled.dl`
  margin: 0;
  display: grid;
  grid-template-columns: minmax(120px, 160px) 1fr;
  gap: 6px 12px;
  font-size: 13px;

  dt {
    color: ${({ theme }) => theme.colors.textSubtle};
  }

  dd {
    margin: 0;
    word-break: break-word;
    color: ${({ theme }) => theme.colors.text};
  }
`

const Mono = styled.code`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  word-break: break-all;
`

const External = styled.a`
  color: ${({ theme }) => theme.colors.secondary};
  text-decoration: underline;
  text-underline-offset: 2px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.secondary};
    outline-offset: 2px;
  }
`

const Stack = styled(Flex)`
  flex-direction: column;
  gap: 16px;
`

function statusLabel(record: ProjectEvidenceRecord): string {
  return `${record.status.replace(/_/g, ' ')} · ${record.verificationLevel.replace(/_/g, ' ')} · ${
    record.availability
  }${record.freshnessState === 'STALE' || record.freshnessState === 'EXPIRED' ? ` · ${record.freshnessState}` : ''}`
}

function groupRecords(pack: ProjectEvidencePack): {
  identity: ProjectEvidenceRecord[]
  resources: ProjectEvidenceRecord[]
  deployments: ProjectEvidenceRecord[]
  verification: ProjectEvidenceRecord[]
} {
  return {
    identity: pack.evidence.filter((e) =>
      [
        'PROJECT_IDENTITY',
        'PROJECT_NAME',
        'PROJECT_PURPOSE',
        'PROJECT_TYPE',
        'PROJECT_LIFECYCLE_STATUS',
        'PROJECT_CATEGORY',
        'PROJECT_LOGO',
      ].includes(e.claimType),
    ),
    resources: pack.evidence.filter((e) =>
      ['OFFICIAL_WEBSITE', 'OFFICIAL_DOCUMENTATION', 'OFFICIAL_SOCIAL', 'OFFICIAL_REPOSITORY'].includes(e.claimType),
    ),
    deployments: pack.evidence.filter((e) =>
      [
        'SUPPORTED_CHAIN',
        'DEPLOYMENT_IDENTITY',
        'ASSET_IDENTITY',
        'CONTRACT_IDENTITY',
        'CONTRACT_CLASSIFICATION',
        'CONTRACT_SOURCE_VERIFICATION',
      ].includes(e.claimType),
    ),
    verification: pack.evidence.filter((e) =>
      ['MELEGA_VERIFICATION', 'PROJECT_CONTROL', 'READINESS_INPUT'].includes(e.claimType),
    ),
  }
}

interface Props {
  pack: ProjectEvidencePack
}

const TrustEvidencePanel: React.FC<Props> = ({ pack }) => {
  const groups = groupRecords(pack)
  const summary = pack.summary

  return (
    <Stack data-testid="trust-evidence-panel">
      <div>
        <Heading as="h2" id="trust-heading" scale="md">
          Trust evidence
        </Heading>
        <Text fontSize="13px" color="textSubtle" style={{ marginTop: 8, marginBottom: 12 }}>
          Factual evidence summary. This is not a safety claim and not a trust score.
        </Text>
        <SummaryList aria-label="Trust evidence summary">
          <SummaryItem>
            {summary.identityEvidenceAvailable ? 'Identity evidence available' : 'Identity evidence unavailable'}
          </SummaryItem>
          <SummaryItem>
            {summary.officialResourceEvidenceAvailable
              ? 'Official resources asserted'
              : 'Official resource evidence unavailable'}
          </SummaryItem>
          <SummaryItem>
            {summary.contractEvidenceAvailable ? 'Contract evidence available' : 'Contract evidence unavailable'}
          </SummaryItem>
          <SummaryItem>
            {summary.controlEvidenceAvailable ? 'Control evidence available' : 'No public control evidence'}
          </SummaryItem>
          <SummaryItem>
            {summary.melegaVerificationEvidenceAvailable
              ? 'Melega verification evidence available'
              : 'Melega verification evidence unavailable'}
          </SummaryItem>
          {summary.staleEvidenceCount > 0 ? (
            <SummaryItem>Stale evidence present ({summary.staleEvidenceCount})</SummaryItem>
          ) : null}
          {summary.activeConflictCount > 0 ? (
            <SummaryItem>Unresolved conflicts present ({summary.activeConflictCount}) — sources disagree</SummaryItem>
          ) : null}
        </SummaryList>
        <Fact style={{ marginTop: 8 }}>
          Public evidence records: {summary.publicEvidenceCount}. Availability: {summary.availability}.
        </Fact>
      </div>

      {pack.conflicts.length > 0 ? (
        <div data-testid="evidence-conflicts">
          <Heading as="h3" scale="md">
            Conflicts
          </Heading>
          <Fact style={{ marginTop: 8, marginBottom: 8 }}>
            Sources disagree. No conflicting value is selected automatically.
          </Fact>
          {pack.conflicts.map((conflict) => (
            <Details key={conflict.conflictGroupId}>
              <Summary>
                Conflict on {conflict.claimType.replace(/_/g, ' ')} ({conflict.normalizedValues.length} values)
              </Summary>
              <MetaGrid>
                <dt>Conflict group</dt>
                <dd>
                  <Mono>{conflict.conflictGroupId}</Mono>
                </dd>
                <dt>Reason</dt>
                <dd>{conflict.reasonCode.replace(/_/g, ' ')}</dd>
                <dt>Values</dt>
                <dd>{conflict.normalizedValues.join(' · ')}</dd>
                <dt>Evidence</dt>
                <dd>
                  <Mono>{conflict.evidenceIds.join(', ')}</Mono>
                </dd>
              </MetaGrid>
            </Details>
          ))}
        </div>
      ) : null}

      <EvidenceGroup title="Identity evidence" records={groups.identity} />
      <EvidenceGroup title="Official-resource evidence" records={groups.resources} />
      <EvidenceGroup title="Deployment and contract evidence" records={groups.deployments} />
      <EvidenceGroup title="Verification evidence" records={groups.verification} />

      <Fact>
        Machine-readable evidence:{' '}
        <External href={`/api/public/projects/${pack.slug}/evidence/`} aria-label="Open project evidence JSON">
          /api/public/projects/{pack.slug}/evidence/
        </External>
      </Fact>
    </Stack>
  )
}

const EvidenceGroup: React.FC<{ title: string; records: ProjectEvidenceRecord[] }> = ({ title, records }) => {
  if (!records.length) return null
  return (
    <div>
      <Heading as="h3" scale="md">
        {title}
      </Heading>
      <Stack style={{ gap: 8, marginTop: 8 }}>
        {records.map((record) => (
          <EvidenceDisclosure key={record.evidenceId} record={record} />
        ))}
      </Stack>
    </div>
  )
}

const EvidenceDisclosure: React.FC<{ record: ProjectEvidenceRecord }> = ({ record }) => {
  const refIsUrl = isSafeHttpUrl(record.sourceReference)
  const valueUnavailable = record.claimValue == null || record.availability === 'UNAVAILABLE'
  const stale = record.freshnessState === 'STALE' || record.freshnessState === 'EXPIRED'

  return (
    <Details data-testid={`evidence-${record.evidenceId}`}>
      <Summary>
        <span>
          {record.claimType.replace(/_/g, ' ')}
          {valueUnavailable
            ? ' — Evidence unavailable'
            : record.status === 'CONFLICTED'
            ? ' — Conflicted'
            : stale
            ? ' — Stale'
            : record.claimValue
            ? ` — ${record.claimValue.length > 48 ? `${record.claimValue.slice(0, 48)}…` : record.claimValue}`
            : ''}
        </span>
      </Summary>
      <MetaGrid>
        <dt>Status</dt>
        <dd>
          <span aria-label={`Evidence status ${statusLabel(record)}`}>{statusLabel(record)}</span>
        </dd>
        <dt>Source</dt>
        <dd>
          {record.sourceType}
          {record.sourceSubtype ? ` / ${record.sourceSubtype}` : ''}
        </dd>
        <dt>Claim value</dt>
        <dd>
          {valueUnavailable ? (
            record.reasonCode === 'NO_PUBLIC_CONTROL_EVIDENCE' ? (
              'No public control evidence'
            ) : record.reasonCode === 'SOURCE_VERIFICATION_UNAVAILABLE' ? (
              'Source verification unavailable'
            ) : (
              record.notes || 'Evidence unavailable'
            )
          ) : (
            <Mono>{record.claimValue}</Mono>
          )}
        </dd>
        <dt>Observed</dt>
        <dd>{record.observedAt ?? 'not recorded'}</dd>
        <dt>Updated</dt>
        <dd>{record.updatedAt ?? 'not recorded'}</dd>
        {stale ? (
          <>
            <dt>Freshness</dt>
            <dd>
              {record.freshnessState}
              {record.freshnessReason ? ` (${record.freshnessReason.replace(/_/g, ' ')})` : ''}
              {record.observedAt ? ` · last observation ${record.observedAt}` : ''}
            </dd>
          </>
        ) : null}
        {record.conflictGroupId ? (
          <>
            <dt>Conflict</dt>
            <dd>
              Sources disagree · <Mono>{record.conflictGroupId}</Mono>
            </dd>
          </>
        ) : null}
        <dt>Reference</dt>
        <dd>
          {refIsUrl ? (
            <External
              href={record.sourceReference}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Evidence reference (opens in a new tab)`}
            >
              {record.sourceReference}
            </External>
          ) : (
            <Mono>{record.sourceReference}</Mono>
          )}
        </dd>
        <dt>Evidence ID</dt>
        <dd>
          <Mono>{record.evidenceId}</Mono>
        </dd>
        {record.notes ? (
          <>
            <dt>Notes</dt>
            <dd>{record.notes}</dd>
          </>
        ) : null}
      </MetaGrid>
    </Details>
  )
}

export default TrustEvidencePanel
