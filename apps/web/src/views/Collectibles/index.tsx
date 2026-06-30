import React from 'react'
import styled from 'styled-components'
import { useTranslation } from '@pancakeswap/localization'
import { melegaOperational as tokens } from 'ui/tokens'
import { getAllCollectibles } from 'registry/collectibles/getAllCollectibles'
import {
  EconomicPageShell,
  EconomicHero,
  EconomicSection,
  EconomicAiLayer,
  TECHNICAL_DETAILS_TITLE,
  MANIFEST_TITLE,
  EconomicManifestLink,
} from 'views/EconomicOS/components'
import CollectibleCard from './components/CollectibleCard'

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

const Collectibles: React.FC = () => {
  const { t } = useTranslation()
  const records = getAllCollectibles()

  return (
    <EconomicPageShell>
      <EconomicHero
        title={t('Collectibles page title')}
        subtitle={t('Collectibles page subtitle')}
      >
        <Disclaimer>{t('Collectibles registry disclaimer')}</Disclaimer>
      </EconomicHero>

      <EconomicSection title={t('Collectibles')} lead={t('Collectibles framing note')} columns={2}>
        {records.map((record) => (
          <CardWrap key={record.slug}>
            <CollectibleCard record={record} />
          </CardWrap>
        ))}
      </EconomicSection>

      <EconomicAiLayer title={t('Machine discovery index')}>
        <EconomicManifestLink
          manifests={[
            { label: t('Identity cross link'), uri: '/identity' },
            { label: t('Surface map cross link'), uri: '/map' },
            { label: t('Machine discovery index'), uri: '/registry/collectibles/index.json' },
            { label: 'Well-known manifest', uri: '/.well-known/melega-dex-collectibles.json' },
          ]}
        />
      </EconomicAiLayer>
    </EconomicPageShell>
  )
}

export default Collectibles
