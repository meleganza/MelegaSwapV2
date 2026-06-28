import React from 'react'
import Link from 'next/link'
import { useCommandTranslation } from '../useCommandTranslation'
import { Panel, PanelTitle, Row, LiveDot, PanelAction, StatusBadge } from '../styles'

const CanonicalEconomyPanel: React.FC = () => {
  const { t } = useCommandTranslation()

  return (
    <Panel>
      <PanelTitle>{t('CMD canonical title')}</PanelTitle>
      <Row>
        <span>{t('CMD chain label')}</span>
        <strong>BNB Chain</strong>
      </Row>
      <Row>
        <span>{t('CMD asset label')}</span>
        <strong>MARCO</strong>
      </Row>
      <Row>
        <span>{t('CMD status label')}</span>
        <LiveDot>LIVE</LiveDot>
      </Row>
      <Link href="/projects/melega-dex" passHref legacyBehavior>
        <PanelAction>
          {t('CMD view economy')}
          <span>→</span>
        </PanelAction>
      </Link>
    </Panel>
  )
}

export default CanonicalEconomyPanel
