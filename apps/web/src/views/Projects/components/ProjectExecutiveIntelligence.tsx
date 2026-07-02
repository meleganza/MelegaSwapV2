import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { StaticProjectRecord } from 'registry/projects/types'

const Panel = styled(Flex)`
  flex-direction: column;
  padding: 24px;
  border: 1px solid rgba(49, 208, 170, 0.2);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.03);
  gap: 24px;
`

const Section = styled(Flex)`
  flex-direction: column;
  gap: 10px;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

const LinkChip = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #4da3ff;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: border-color 150ms ease;

  &:hover {
    border-color: rgba(77, 163, 255, 0.45);
  }
`

const LinkChipUnavailable = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.35);
  font-size: 13px;
  font-weight: 600;
`

const AnalysisBlock = styled.div`
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.2);
`

const Mono = styled(Text)`
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
`

interface ProjectExecutiveIntelligenceProps {
  project: StaticProjectRecord
}

const ProjectExecutiveIntelligence: React.FC<ProjectExecutiveIntelligenceProps> = ({ project }) => {
  const { t } = useTranslation()
  const primaryToken = project.resources.tokens[0]
  const contract = primaryToken?.address ?? t('Unavailable')
  const website = project.websiteUrl ?? undefined

  const externalLinks = [
    { label: t('Website'), href: website },
    { label: t('Whitepaper'), href: project.docsUrl },
    { label: t('Space'), href: project.spaceProfileUrl },
    { label: 'TokenSniffer', href: undefined },
    { label: 'CoinMarketCap', href: undefined },
    { label: 'CoinGecko', href: undefined },
    { label: 'DexTools', href: undefined },
    { label: 'DexScreener', href: undefined },
  ]

  const analysisSections = [
    { title: t('Security'), body: t('Security analysis will appear when indexed intelligence is available.') },
    { title: t('Liquidity analysis'), body: t('Liquidity depth, pool distribution, and slippage context.') },
    { title: t('Growth analysis'), body: t('Holder growth, volume trend, and ecosystem expansion signals.') },
    { title: t('Community analysis'), body: t('Social reach, contributor activity, and engagement quality.') },
    { title: t('Technical analysis'), body: t('Contract quality, upgrade patterns, and integration footprint.') },
    { title: t('Roadmap analysis'), body: t('Milestone delivery history and upcoming release confidence.') },
  ]

  return (
    <Panel>
      <Flex justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" style={{ gap: '12px' }}>
        <Heading as="h2" scale="lg" color="secondary">
          {t('Executive intelligence')}
        </Heading>
        <Text fontSize="12px" color="textSubtle">
          {t('Full AI report')}
        </Text>
      </Flex>

      <Section>
        <Text fontSize="14px" color="secondary" fontWeight={600}>
          {t('AI Explanation')}
        </Text>
        <Text fontSize="14px" color="text">
          {project.description ??
            t('AI analysis indicates project fundamentals are being indexed. Open sections below for detailed intelligence.')}
        </Text>
      </Section>

      <Section>
        <Text fontSize="14px" color="secondary" fontWeight={600}>
          {t('Melega Rating')}
        </Text>
        <Text fontSize="14px" color="text">
          {t('Risk tier')}: {project.riskTier} · {t('Verification status')}: {project.verificationStatus}
        </Text>
      </Section>

      <Section>
        <Text fontSize="14px" color="secondary" fontWeight={600}>
          {t('Explore')}
        </Text>
        <Grid>
          {externalLinks.map((link) =>
            link.href ? (
              <LinkChip key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
              </LinkChip>
            ) : (
              <LinkChipUnavailable key={link.label}>{link.label}</LinkChipUnavailable>
            ),
          )}
        </Grid>
      </Section>

      <Section>
        <Text fontSize="14px" color="secondary" fontWeight={600}>
          {t('Contract')}
        </Text>
        <Mono color="text">{contract}</Mono>
      </Section>

      <Grid>
        <AnalysisBlock>
          <Text fontSize="12px" color="textSubtle" mb="4px">
            {t('Whale concentration')}
          </Text>
          <Text fontSize="14px" color="textDisabled">
            {t('Unavailable')}
          </Text>
        </AnalysisBlock>
        <AnalysisBlock>
          <Text fontSize="12px" color="textSubtle" mb="4px">
            {t('Holder distribution')}
          </Text>
          <Text fontSize="14px" color="textDisabled">
            {t('Unavailable')}
          </Text>
        </AnalysisBlock>
        <AnalysisBlock>
          <Text fontSize="12px" color="textSubtle" mb="4px">
            {t('Audit')}
          </Text>
          <Text fontSize="14px" color="text">
            {project.trustBadges?.length ? project.trustBadges.join(', ') : t('Unavailable')}
          </Text>
        </AnalysisBlock>
      </Grid>

      <Grid>
        {analysisSections.map((section) => (
          <AnalysisBlock key={section.title}>
            <Text fontSize="13px" color="secondary" fontWeight={600} mb="6px">
              {section.title}
            </Text>
            <Text fontSize="13px" color="textSubtle">
              {section.body}
            </Text>
          </AnalysisBlock>
        ))}
      </Grid>
    </Panel>
  )
}

export default ProjectExecutiveIntelligence
