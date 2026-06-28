import React from 'react'
import styled from 'styled-components'
import Head from 'next/head'
import Link from 'next/link'
import { cmd } from 'views/Home/EconomicCommandConsole/tokens'
import { ActivationStageStatus, resolveActivationReadModel } from 'lib/economic-activation'
import {
  resolveActivationSession,
  ActivationEvidenceKind,
  ActivationJournalKind,
} from 'lib/economic-runtime'
import translations from 'config/localization/translations.json'

const t = (key: string) => (translations as Record<string, string>)[key] ?? key

const Root = styled.div`
  min-height: 100vh;
  background: ${cmd.bg};
  color: ${cmd.text};
  font-family: ${cmd.fontBody};
  padding: 24px 24px 48px;
`

const Shell = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
`

const Title = styled.h1`
  margin: 0;
  font-family: ${cmd.fontDisplay};
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${cmd.goldHighlight};
`

const Subtitle = styled.p`
  margin: 8px 0 0;
  font-size: 13px;
  color: ${cmd.textSecondary};
  line-height: 1.6;
`

const Panel = styled.section`
  background: ${cmd.surfaceGlass};
  backdrop-filter: blur(14px);
  border: 1px solid ${cmd.borderGold};
  border-radius: ${cmd.radius};
  padding: 20px;
`

const PanelTitle = styled.h2`
  margin: 0 0 16px;
  font-family: ${cmd.fontDisplay};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${cmd.gold};
`

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid ${cmd.border};
  font-size: 13px;

  &:last-child {
    border-bottom: none;
  }

  span:first-child {
    color: ${cmd.textSecondary};
  }

  strong {
    color: ${cmd.text};
    font-weight: 500;
  }
`

const LiveDot = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${cmd.success};
  font-weight: 600;

  &::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${cmd.success};
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.45;
    }
  }
`

const RuntimeHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`

const ProgressTrack = styled.div`
  flex: 1;
  min-width: 200px;
  height: 6px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid ${cmd.border};
  overflow: hidden;
`

const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${({ $percent }) => $percent}%;
  background: linear-gradient(90deg, ${cmd.gold}, ${cmd.success});
  transition: width 0.4s ease;
`

const ProgressMeta = styled.div`
  font-size: 11px;
  color: ${cmd.textSecondary};
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`

const Timeline = styled.div`
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding-bottom: 4px;
`

const TimelineDot = styled.div<{ $active: boolean; $complete: boolean; $status: ActivationStageStatus }>`
  flex: 0 0 auto;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid
    ${({ $status, $complete, $active }) =>
      $active
        ? cmd.goldHighlight
        : $complete
          ? cmd.success
          : $status === 'BLOCKED'
            ? '#f87171'
            : cmd.border};
  background: ${({ $complete, $active }) =>
    $complete ? cmd.success : $active ? cmd.gold : 'transparent'};
  box-shadow: ${({ $active }) => ($active ? `0 0 8px ${cmd.gold}` : 'none')};
`

const Pipeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`

const StageRow = styled.div<{ $status: ActivationStageStatus; $focused: boolean }>`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: start;
  padding: 16px 0;
  border-bottom: 1px solid ${cmd.border};
  position: relative;

  &:last-child {
    border-bottom: none;
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: ${({ $status, $focused }) =>
      $focused
        ? cmd.goldHighlight
        : $status === 'READY'
          ? cmd.success
          : $status === 'WAITING'
            ? cmd.gold
            : $status === 'BLOCKED'
              ? '#ef4444'
              : cmd.textSecondary};
    opacity: ${({ $focused }) => ($focused ? 1 : 0.7)};
  }

  padding-left: 14px;
`

const StageLabel = styled.div`
  font-family: ${cmd.fontDisplay};
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${cmd.text};
  margin-bottom: 4px;
`

const StageField = styled.div`
  margin-top: 10px;

  strong {
    display: block;
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${cmd.gold};
    margin-bottom: 4px;
    font-family: ${cmd.fontDisplay};
  }

  p,
  ul {
    margin: 0;
    font-size: 11px;
    color: ${cmd.textSecondary};
    line-height: 1.5;
  }

  ul {
    padding-left: 16px;
  }

  li {
    margin-bottom: 4px;
  }
`

const StatusBadge = styled.span<{ $status: ActivationStageStatus }>`
  font-family: ${cmd.fontDisplay};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  padding: 4px 10px;
  border-radius: 6px;
  white-space: nowrap;
  color: ${({ $status }) =>
    $status === 'READY'
      ? cmd.success
      : $status === 'WAITING'
        ? cmd.goldHighlight
        : $status === 'BLOCKED'
          ? '#f87171'
          : cmd.textSecondary};
  border: 1px solid
    ${({ $status }) =>
      $status === 'READY'
        ? cmd.success
        : $status === 'WAITING'
          ? cmd.gold
          : $status === 'BLOCKED'
            ? '#f87171'
            : cmd.border};
`

const EvidenceKind = styled.span<{ $kind: ActivationEvidenceKind }>`
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ $kind }) =>
    $kind === 'constitutional'
      ? cmd.goldHighlight
      : $kind === 'labs'
        ? cmd.gold
        : $kind === 'execution'
          ? '#f87171'
          : cmd.textSecondary};
`

const JournalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 220px;
  overflow-y: auto;
`

const JournalEntry = styled.div<{ $kind: ActivationJournalKind }>`
  padding: 8px 10px;
  border-radius: ${cmd.radiusSm};
  border: 1px solid ${cmd.border};
  background: rgba(0, 0, 0, 0.25);
  font-size: 11px;
  line-height: 1.45;
  color: ${cmd.textSecondary};

  span {
    display: block;
    font-size: 9px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${({ $kind }) =>
      $kind === 'gate'
        ? '#f87171'
        : $kind === 'requirement'
          ? cmd.gold
          : $kind === 'constitutional'
            ? cmd.goldHighlight
            : cmd.textSecondary};
    margin-bottom: 4px;
    font-family: ${cmd.fontDisplay};
  }
`

const PresenceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px;
`

const PresenceCell = styled.div`
  padding: 12px;
  border: 1px solid ${cmd.border};
  border-radius: ${cmd.radiusSm};
  background: rgba(0, 0, 0, 0.35);

  strong {
    display: block;
    font-size: 12px;
    margin-bottom: 4px;
  }

  span {
    font-size: 10px;
    color: ${cmd.textSecondary};
  }
`

const StageNotes = styled.div`
  font-size: 11px;
  color: ${cmd.textSecondary};
  opacity: 0.85;
  margin-top: 4px;
`

const Meta = styled.p`
  margin: 0;
  font-size: 11px;
  color: ${cmd.textSecondary};
  line-height: 1.5;
`

const LinkRow = styled.div`
  margin-top: 8px;
  font-size: 11px;

  a {
    color: ${cmd.gold};
    text-decoration: none;

    &:hover {
      color: ${cmd.goldHighlight};
    }
  }
`

interface Props {
  projectSlug?: string
}

const NewProjectActivation: React.FC<Props> = ({ projectSlug }) => {
  const session = resolveActivationSession({ projectSlug })
  const readModel = resolveActivationReadModel({ projectSlug })

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Orbitron:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Root>
        <Shell>
          <header>
            <Title>{t('Activation page title')}</Title>
            <Subtitle>{t('Activation runtime subtitle')}</Subtitle>
          </header>

          <Panel>
            <PanelTitle>{t('Activation runtime session title')}</PanelTitle>
            <RuntimeHeader>
              <LiveDot>{t('Activation runtime live')}</LiveDot>
              <ProgressTrack>
                <ProgressFill $percent={session.progress.percentReady} />
              </ProgressTrack>
              <ProgressMeta>
                <span>
                  {session.progress.readyCount}/{session.progress.totalStages} READY
                </span>
                <span>{session.progress.phaseLabel}</span>
                <span>{session.sessionId}</span>
              </ProgressMeta>
            </RuntimeHeader>
            <Timeline aria-label="Activation timeline">
              {session.timeline.map((entry) => (
                <TimelineDot
                  key={entry.id}
                  $active={entry.isCurrentFocus}
                  $complete={entry.isComplete}
                  $status={entry.state}
                  title={`${entry.label} — ${entry.state}`}
                />
              ))}
            </Timeline>
            <Meta style={{ marginTop: 12 }}>{session.disclaimer}</Meta>
          </Panel>

          <Panel>
            <PanelTitle>{t('CMD canonical title')}</PanelTitle>
            <Row>
              <span>{t('CMD chain label')}</span>
              <strong>{session.constitutional.canonicalChain}</strong>
            </Row>
            <Row>
              <span>{t('CMD asset label')}</span>
              <strong>{session.constitutional.canonicalAsset}</strong>
            </Row>
            <Row>
              <span>{t('CMD status label')}</span>
              <LiveDot>{session.constitutional.status}</LiveDot>
            </Row>
            <Meta>{t('Activation canonical note')}</Meta>
          </Panel>

          <Panel>
            <PanelTitle>{t('Activation presence title')}</PanelTitle>
            <PresenceGrid>
              {readModel.presenceTargets.map((target) => (
                <PresenceCell key={target.chainId}>
                  <strong>{target.displayName}</strong>
                  <StatusBadge $status={target.status}>{target.status}</StatusBadge>
                  <span>{target.role === 'canonical' ? 'Canonical' : 'Economic Presence'}</span>
                  <StageNotes>{target.notes}</StageNotes>
                </PresenceCell>
              ))}
            </PresenceGrid>
          </Panel>

          <Panel>
            <PanelTitle>{t('Activation runtime pipeline title')}</PanelTitle>
            <Pipeline>
              {session.stages.map((stage) => (
                <StageRow key={stage.id} $status={stage.state} $focused={stage.id === session.progress.currentFocusStageId}>
                  <div>
                    <StageLabel>
                      {stage.ordinal}. {stage.label}
                    </StageLabel>

                    <StageField>
                      <strong>{t('Activation runtime state')}</strong>
                      <p>{stage.state}</p>
                    </StageField>

                    <StageField>
                      <strong>{t('Activation runtime reason')}</strong>
                      <p>{stage.reason}</p>
                    </StageField>

                    <StageField>
                      <strong>{t('Activation runtime evidence')}</strong>
                      <ul>
                        {stage.evidence.map((item) => (
                          <li key={item.id}>
                            <EvidenceKind $kind={item.kind}>{item.kind}</EvidenceKind>{' '}
                            {item.href ? (
                              <Link href={item.href}>{item.summary}</Link>
                            ) : (
                              item.summary
                            )}
                            <div style={{ opacity: 0.7, fontSize: 10 }}>{item.source}</div>
                          </li>
                        ))}
                      </ul>
                    </StageField>

                    <StageField>
                      <strong>{t('Activation runtime next requirement')}</strong>
                      <p>{stage.nextRequirement ?? t('Activation runtime no requirement')}</p>
                    </StageField>

                    {stage.href && (
                      <LinkRow>
                        <Link href={stage.href}>{stage.href}</Link>
                      </LinkRow>
                    )}
                  </div>
                  <StatusBadge $status={stage.state}>{stage.state}</StatusBadge>
                </StageRow>
              ))}
            </Pipeline>
          </Panel>

          <Panel>
            <PanelTitle>{t('Activation runtime journal title')}</PanelTitle>
            <JournalList>
              {session.journal.map((entry) => (
                <JournalEntry key={entry.id} $kind={entry.kind}>
                  <span>{entry.kind}</span>
                  {entry.message}
                </JournalEntry>
              ))}
            </JournalList>
          </Panel>

          <Panel>
            <PanelTitle>{t('Activation manifest title')}</PanelTitle>
            <Meta>
              {t('Activation manifest note')}:{' '}
              <a href="/registry/activation/preview.json" style={{ color: cmd.gold }}>
                /registry/activation/preview.json
              </a>
            </Meta>
            <Meta style={{ marginTop: 8 }}>
              {t('Activation runtime manifest note')}:{' '}
              <a href="/registry/activation/runtime.json" style={{ color: cmd.gold }}>
                /registry/activation/runtime.json
              </a>
            </Meta>
            <Meta style={{ marginTop: 8 }}>
              Mode: {session.mode}
              {session.projectSlug ? ` · project: ${session.projectSlug}` : ''} · read-only · execution: off
            </Meta>
          </Panel>

          <Meta>
            {t('Activation reference note')}{' '}
            <Link href="/new-project?reference=melega-dex" style={{ color: cmd.gold }}>
              melega-dex
            </Link>{' '}
            · <Link href="/projects/melega-dex" style={{ color: cmd.gold }}>/projects/melega-dex</Link>
          </Meta>
        </Shell>
      </Root>
    </>
  )
}

export default NewProjectActivation
