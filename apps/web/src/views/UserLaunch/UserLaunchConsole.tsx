import React from 'react'
import styled from 'styled-components'
import Head from 'next/head'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'
import { resolveUserLaunchReadModel, LaunchCapabilityStatus } from 'lib/user-launch'
import translations from 'config/localization/translations.json'

const t = (key: string) => (translations as Record<string, string>)[key] ?? key

const Root = styled.div`
  min-height: 100vh;
  background: ${tokens.bg};
  color: ${tokens.text};
  font-family: ${tokens.fontBody};
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
  font-family: ${tokens.fontDisplay};
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${tokens.goldHighlight};
`

const Subtitle = styled.p`
  margin: 8px 0 0;
  font-size: 13px;
  color: ${tokens.textSecondary};
  line-height: 1.6;
`

const Panel = styled.section`
  background: ${tokens.surfaceGlass};
  backdrop-filter: blur(14px);
  border: 1px solid ${tokens.borderGold};
  border-radius: ${tokens.radius};
  padding: 20px;
`

const PanelTitle = styled.h2`
  margin: 0 0 16px;
  font-family: ${tokens.fontDisplay};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${tokens.gold};
`

const SummaryGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`

const SummaryCell = styled.div`
  padding: 10px 14px;
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusSm};
  font-size: 12px;
  color: ${tokens.textSecondary};

  strong {
    display: block;
    color: ${tokens.text};
    font-size: 18px;
    margin-bottom: 2px;
  }
`

const CapabilityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const CapabilityRow = styled.div<{ $status: LaunchCapabilityStatus }>`
  border: 1px solid ${tokens.border};
  border-left: 3px solid
    ${({ $status }) =>
      $status === 'LIVE' || $status === 'AVAILABLE_EXISTING_FLOW'
        ? tokens.success
        : $status === 'PLANNED'
          ? tokens.gold
          : $status === 'BLOCKED'
            ? '#f87171'
            : tokens.textSecondary};
  border-radius: ${tokens.radiusSm};
  padding: 16px;
  background: rgba(0, 0, 0, 0.25);
`

const CapabilityTitle = styled.div`
  font-family: ${tokens.fontDisplay};
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 6px;
`

const StatusBadge = styled.span<{ $status: LaunchCapabilityStatus }>`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: 3px 8px;
  border-radius: 6px;
  margin-left: 8px;
  color: ${({ $status }) =>
    $status === 'LIVE' || $status === 'AVAILABLE_EXISTING_FLOW'
      ? tokens.success
      : $status === 'PLANNED'
        ? tokens.goldHighlight
        : $status === 'BLOCKED'
          ? '#f87171'
          : tokens.textSecondary};
  border: 1px solid currentColor;
`

const Field = styled.div`
  margin-top: 10px;

  strong {
    display: block;
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${tokens.gold};
    margin-bottom: 4px;
    font-family: ${tokens.fontDisplay};
  }

  p,
  ul {
    margin: 0;
    font-size: 11px;
    color: ${tokens.textSecondary};
    line-height: 1.5;
  }

  ul {
    padding-left: 16px;
  }
`

const LinkRow = styled.div`
  margin-top: 10px;
  font-size: 11px;

  a {
    color: ${tokens.gold};
    text-decoration: none;
    margin-right: 12px;

    &:hover {
      color: ${tokens.goldHighlight};
    }
  }
`

const Meta = styled.p`
  margin: 0;
  font-size: 11px;
  color: ${tokens.textSecondary};
  line-height: 1.5;
`

const LiveDot = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${tokens.success};
  font-weight: 600;

  &::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${tokens.success};
  }
`

const FutureLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 11px;

  a {
    color: ${tokens.gold};
    text-decoration: none;
    padding: 6px 10px;
    border: 1px solid ${tokens.borderGold};
    border-radius: ${tokens.radiusSm};

    &:hover {
      color: ${tokens.goldHighlight};
    }
  }
`

const UserLaunchConsole: React.FC = () => {
  const model = resolveUserLaunchReadModel()

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
            <Title>{t('Launch page title')}</Title>
            <Subtitle>{t('Launch page subtitle')}</Subtitle>
          </header>

          <Panel>
            <PanelTitle>{t('Launch canonical title')}</PanelTitle>
            <Meta>
              {model.constitutional.canonicalChain} · {model.constitutional.canonicalAsset} ·{' '}
              <LiveDot>{model.constitutional.status}</LiveDot>
            </Meta>
            <Meta style={{ marginTop: 8 }}>{model.disclaimer}</Meta>
          </Panel>

          <Panel>
            <PanelTitle>{t('Launch summary title')}</PanelTitle>
            <SummaryGrid>
              <SummaryCell>
                <strong>{model.summary.total}</strong>
                {t('Launch total capabilities')}
              </SummaryCell>
              <SummaryCell>
                <strong>{model.summary.live + model.summary.availableExistingFlow}</strong>
                {t('Launch available now')}
              </SummaryCell>
              <SummaryCell>
                <strong>{model.summary.planned}</strong>
                {t('Launch planned')}
              </SummaryCell>
              <SummaryCell>
                <strong>{model.summary.blocked}</strong>
                {t('Launch blocked')}
              </SummaryCell>
            </SummaryGrid>
          </Panel>

          <Panel>
            <PanelTitle>{t('Launch capabilities title')}</PanelTitle>
            <CapabilityList>
              {model.capabilities.map((capability) => (
                <CapabilityRow key={capability.id} $status={capability.status}>
                  <CapabilityTitle>
                    {capability.label}
                    <StatusBadge $status={capability.status}>{capability.status}</StatusBadge>
                  </CapabilityTitle>
                  <Meta>{capability.description}</Meta>

                  <Field>
                    <strong>{t('Launch availability')}</strong>
                    <p>{capability.availability}</p>
                  </Field>

                  <Field>
                    <strong>{t('Launch required inputs')}</strong>
                    <ul>
                      {capability.requiredInputs.map((input) => (
                        <li key={input.id}>
                          {input.label}
                          {input.required ? ' *' : ''}
                          {input.notes ? ` — ${input.notes}` : ''}
                        </li>
                      ))}
                    </ul>
                  </Field>

                  <Field>
                    <strong>{t('Launch wallet requirement')}</strong>
                    <p>{capability.walletRequirement}</p>
                  </Field>

                  <Field>
                    <strong>{t('Launch chain support')}</strong>
                    <p>
                      {capability.chainSupport.chains.join(' · ')} — {capability.chainSupport.notes}
                    </p>
                  </Field>

                  <Field>
                    <strong>{t('Launch contract dependency')}</strong>
                    <p>
                      {capability.contractDependency.label}: {capability.contractDependency.reference} (
                      {capability.contractDependency.status})
                    </p>
                  </Field>

                  <Field>
                    <strong>{t('Launch execution dependency')}</strong>
                    <p>
                      {capability.executionDependency.label}: {capability.executionDependency.reference} (
                      {capability.executionDependency.status})
                    </p>
                  </Field>

                  {capability.warnings.length > 0 && (
                    <Field>
                      <strong>{t('Launch warnings')}</strong>
                      <ul>
                        {capability.warnings.map((warning) => (
                          <li key={warning}>{warning}</li>
                        ))}
                      </ul>
                    </Field>
                  )}

                  {(capability.existingFlowHref || capability.registryHref) && (
                    <LinkRow>
                      {capability.existingFlowHref && (
                        <Link href={capability.existingFlowHref}>
                          {t('Launch open existing flow')}: {capability.existingFlowHref}
                        </Link>
                      )}
                      {capability.registryHref && (
                        <Link href={capability.registryHref}>
                          {t('Launch registry link')}: {capability.registryHref}
                        </Link>
                      )}
                    </LinkRow>
                  )}

                  <Meta style={{ marginTop: 8, opacity: 0.7 }}>
                    {capability.machineManifest}
                  </Meta>
                </CapabilityRow>
              ))}
            </CapabilityList>
          </Panel>

          <Panel>
            <PanelTitle>{t('Launch future surfaces title')}</PanelTitle>
            <FutureLinks>
              <Link href="/new-project">Labs / Activation</Link>
              <Link href="/pipeline">{t('Pipeline cross link')}</Link>
              <Link href="/runtime/labs">{t('Runtime cross link')}</Link>
              <Link href="/presence">Economic Presence</Link>
              <Link href="/execution">Execution</Link>
              <Link href="/identity">Economic Identity</Link>
              <Link href="/map">Surface Map</Link>
              <Link href="/graph">Graph</Link>
              <Link href="/query">Query</Link>
            </FutureLinks>
            <Meta style={{ marginTop: 12 }}>{t('Launch future surfaces note')}</Meta>
          </Panel>

          <Panel>
            <PanelTitle>{t('Launch manifest title')}</PanelTitle>
            <Meta>
              {t('Launch manifest note')}:{' '}
              <a href="/registry/launch/index.json" style={{ color: tokens.gold }}>
                /registry/launch/index.json
              </a>
            </Meta>
            <Meta style={{ marginTop: 8 }}>
              Read-only · execution disabled · as of {model.asOf}
            </Meta>
          </Panel>
        </Shell>
      </Root>
    </>
  )
}

export default UserLaunchConsole
