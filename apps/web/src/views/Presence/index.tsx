import React from 'react'
import styled from 'styled-components'
import { useTranslation } from '@pancakeswap/localization'
import { melegaOperational as tokens } from 'ui/tokens'
import { getAllPresence } from 'registry/presence/getAllPresence'
import {
  CONSTITUTIONAL_CANONICAL_ASSET,
  CONSTITUTIONAL_CANONICAL_CHAIN,
  CONSTITUTIONAL_CANONICAL_STATUS,
} from 'registry/presence/presence-constants'
import {
  EconomicPageShell,
  EconomicHero,
  EconomicSection,
  EconomicStatusSummary,
  EconomicAiLayer,
  TECHNICAL_DETAILS_TITLE,
  MANIFEST_TITLE,
  EconomicManifestLink,
} from 'views/EconomicOS/components'
import PresenceCard from './components/PresenceCard'

const Disclaimer = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${tokens.textSecondary};
  line-height: 1.5;
  max-width: 640px;
`

const CardWrap = styled.div`
  min-width: 0;
`

const Presence: React.FC = () => {
  const { t } = useTranslation()
  const records = getAllPresence()

  return (
    <EconomicPageShell>
      <EconomicHero title={t('Presence page title')} subtitle={t('Presence page subtitle')}>
        <Disclaimer>{t('Presence registry disclaimer')}</Disclaimer>
      </EconomicHero>

      <EconomicSection title={t('Presence canonical banner title')} lead={t('Presence canonical banner note')}>
        <EconomicStatusSummary
          items={[
            { label: t('CMD chain label'), value: CONSTITUTIONAL_CANONICAL_CHAIN },
            { label: t('CMD asset label'), value: CONSTITUTIONAL_CANONICAL_ASSET },
            { label: t('CMD status label'), value: '', status: CONSTITUTIONAL_CANONICAL_STATUS },
          ]}
        />
      </EconomicSection>

      <EconomicSection title={t('Activation presence title')} columns={2}>
        {records.map((record) => (
          <CardWrap key={record.slug}>
            <PresenceCard record={record} />
          </CardWrap>
        ))}
      </EconomicSection>

      <EconomicAiLayer title={t('Machine discovery index')}>
        <EconomicManifestLink
          manifests={[
            { label: t('Machine discovery index'), uri: '/registry/presence/index.json' },
            { label: 'Well-known manifest', uri: '/.well-known/melega-dex-presence.json' },
          ]}
        />
      </EconomicAiLayer>
    </EconomicPageShell>
  )
}

export default Presence
