import React from 'react'
import styled from 'styled-components'
import { useImportRuntime } from '../importExistingTokenRuntime/ImportRuntimeContext'
import { IT_FONT_BODY, importTokenColors } from '../importTokenTokens'
import { ItPanel, ItSectionLabel } from './importTokenPrimitives'

const Panel = styled(ItPanel)`
  padding: 24px;
`

const Title = styled.h3`
  margin: 0 0 8px;
  font-family: ${IT_FONT_BODY};
  font-size: 20px;
  font-weight: 700;
  color: ${importTokenColors.white};
`

const Body = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${importTokenColors.body};
`

const Meta = styled.div`
  margin-top: 12px;
  font-size: 12px;
  color: ${importTokenColors.muted};
`

export const PendingReviewCard: React.FC = () => {
  const { analysis } = useImportRuntime()
  if (!analysis?.pending || !analysis.pendingProject) return null

  const pending = analysis.pendingProject

  return (
    <Panel data-iet-pending-review>
      <ItSectionLabel>Pending Registry Review</ItSectionLabel>
      <Title>{pending.name.available ? pending.name.value : 'Unknown Project'}</Title>
      <Body>{analysis.summary}</Body>
      <Meta>
        Pending ID: {pending.pending_id} · Review status: {pending.review_status} · Provenance: Registry intake
      </Meta>
    </Panel>
  )
}

export default PendingReviewCard
