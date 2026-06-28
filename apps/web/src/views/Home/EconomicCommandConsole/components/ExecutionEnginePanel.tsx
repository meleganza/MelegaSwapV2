import React from 'react'
import Link from 'next/link'
import { useUserSlippageTolerance } from 'state/user/hooks'
import { useCommandTranslation } from '../useCommandTranslation'
import { Panel, PanelTitle, Row, PanelAction, StatusBadge } from '../styles'

const ExecutionEnginePanel: React.FC = () => {
  const { t } = useCommandTranslation()
  const [slippage] = useUserSlippageTolerance()
  const slippageLabel = `${(slippage / 100).toFixed(1)}%`

  return (
    <Panel>
      <PanelTitle>{t('CMD execution title')}</PanelTitle>
      <Row>
        <span>{t('CMD router label')}</span>
        <StatusBadge>ACTIVE</StatusBadge>
      </Row>
      <Row>
        <span>{t('CMD smart exec label')}</span>
        <StatusBadge $variant="next">COMING NEXT</StatusBadge>
      </Row>
      <Row>
        <span>{t('CMD slippage label')}</span>
        <strong>{slippageLabel}</strong>
      </Row>
      <Link href="/swap" passHref legacyBehavior>
        <PanelAction>
          {t('CMD router status')}
          <span>→</span>
        </PanelAction>
      </Link>
    </Panel>
  )
}

export default ExecutionEnginePanel
