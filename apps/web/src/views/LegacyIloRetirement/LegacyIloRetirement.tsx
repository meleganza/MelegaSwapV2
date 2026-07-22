import React from 'react'
import styled from 'styled-components'
import Head from 'next/head'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'
import { resolveLegacyIloRetirement } from 'lib/legacy-surfaces'
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
  max-width: 900px;
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

const RetiredBadge = styled.span`
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  padding: 4px 10px;
  border-radius: 6px;
  color: ${tokens.textSecondary};
  border: 1px solid ${tokens.border};
  margin-bottom: 12px;
`

const CtaGrid = styled.div`
  display: grid;
  gap: 12px;
`

const CtaCard = styled(Link)`
  display: block;
  padding: 16px;
  border: 1px solid ${tokens.borderGold};
  border-radius: ${tokens.radiusSm};
  background: rgba(0, 0, 0, 0.3);
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${tokens.gold};
  }

  strong {
    display: block;
    font-family: ${tokens.fontDisplay};
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${tokens.goldHighlight};
    margin-bottom: 6px;
  }

  span {
    font-size: 12px;
    color: ${tokens.textSecondary};
    line-height: 1.5;
  }

  em {
    display: block;
    margin-top: 8px;
    font-size: 11px;
    color: ${tokens.gold};
    font-style: normal;
  }
`

const WarningList = styled.ul`
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: ${tokens.textSecondary};
  line-height: 1.6;

  li {
    margin-bottom: 8px;
  }
`

const Meta = styled.p`
  margin: 0;
  font-size: 11px;
  color: ${tokens.textSecondary};
  line-height: 1.5;
`

const LegacyIloRetirement: React.FC = () => {
  const surface = resolveLegacyIloRetirement()

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Root>
        <Shell>
          <header>
            <RetiredBadge>{t('Legacy ILO retired badge')}</RetiredBadge>
            <Title>{t('Legacy ILO retirement title')}</Title>
            <Subtitle>{t('Legacy ILO retirement subtitle')}</Subtitle>
          </header>

          <Panel>
            <PanelTitle>{t('Legacy ILO supersession title')}</PanelTitle>
            <Meta>{surface.summary}</Meta>
            <Meta style={{ marginTop: 12 }}>{t('Legacy ILO activation note')}</Meta>
          </Panel>

          <Panel>
            <PanelTitle>{t('Legacy ILO cta title')}</PanelTitle>
            <CtaGrid>
              {surface.supersededBy.map((entry) => (
                <CtaCard key={entry.route} href={entry.route}>
                  <strong>{entry.label}</strong>
                  <span>{entry.purpose}</span>
                  <em>{entry.route} →</em>
                </CtaCard>
              ))}
            </CtaGrid>
          </Panel>

          <Panel>
            <PanelTitle>{t('Legacy ILO compatibility title')}</PanelTitle>
            <WarningList>
              {surface.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </WarningList>
            <Meta style={{ marginTop: 12 }}>
              {t('Legacy ILO historical module')}: <code>{surface.historicalModule}</code>
            </Meta>
            <Meta style={{ marginTop: 8 }}>
              {t('Legacy ILO manifest note')}:{' '}
              <a href="/registry/legacy/ilo-retirement.json" style={{ color: tokens.gold }}>
                /registry/legacy/ilo-retirement.json
              </a>
            </Meta>
          </Panel>
        </Shell>
      </Root>
    </>
  )
}

export default LegacyIloRetirement
