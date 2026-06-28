import React from 'react'
import Link from 'next/link'
import { getVenuesByAssetSlug } from 'registry/venues/getVenueBySlug'
import { useCommandTranslation } from '../useCommandTranslation'
import { Panel, PanelTitle, Row, PanelAction } from '../styles'

const MarcoVenuesPanel: React.FC = () => {
  const { t } = useCommandTranslation()
  const marcoVenues = getVenuesByAssetSlug('marco')

  return (
    <Panel>
      <PanelTitle>{t('CMD marco venues title')}</PanelTitle>
      <Row>
        <span>{t('CMD total venues')}</span>
        <strong>{marcoVenues.length}</strong>
      </Row>
      <Row>
        <span>{t('CMD total liquidity')}</span>
        <strong>{t('Not indexed')}</strong>
      </Row>
      <Row>
        <span>{t('CMD volume 24h')}</span>
        <strong>{t('Not indexed')}</strong>
      </Row>
      <Link href="/venues" passHref legacyBehavior>
        <PanelAction>
          {t('CMD view venues')}
          <span>→</span>
        </PanelAction>
      </Link>
    </Panel>
  )
}

export default MarcoVenuesPanel
