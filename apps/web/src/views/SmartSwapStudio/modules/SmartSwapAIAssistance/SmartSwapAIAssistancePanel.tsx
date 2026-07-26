/**
 * Smart Swap Module 006 — AI Assistance panel (explanation only, optional).
 */

import styled from 'styled-components'
import type { SmartSwapAIAssistanceResult } from 'lib/smart-swap-ai-assistance'

const Root = styled.aside`
  width: 100%;
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(15, 23, 42, 0.65);
  color: #e2e8f0;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
`

const Title = styled.h4`
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #94a3b8;
`

const Body = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: #f1f5f9;
`

const Meta = styled.p`
  margin: 6px 0 0;
  font-size: 10px;
  line-height: 1.4;
  color: #94a3b8;
`

const Badge = styled.span`
  display: inline-block;
  margin-left: 6px;
  font-size: 10px;
  font-weight: 600;
  color: #cbd5e1;
`

export type SmartSwapAIAssistancePanelProps = {
  result: SmartSwapAIAssistanceResult
}

export function SmartSwapAIAssistancePanel({ result }: SmartSwapAIAssistancePanelProps) {
  if (result.status !== 'ok' || !result.assistance) {
    return (
      <Root
        data-smart-swap-module="006"
        data-ai-state="failure"
        data-ai-failure={result.status === 'failure' ? result.failure : 'AI_UNAVAILABLE'}
        data-ai-optional="true"
      >
        <Title>
          AI assistance
          <Badge>Optional</Badge>
        </Title>
        <Body role="status">
          {result.status === 'failure' ? result.message : 'AI assistance unavailable.'}
        </Body>
        <Meta>Swap execution is not blocked by AI assistance.</Meta>
      </Root>
    )
  }

  const a = result.assistance
  return (
    <Root
      data-smart-swap-module="006"
      data-ai-state="ready"
      data-ai-context={a.contextType}
      data-ai-optional="true"
    >
      <Title>
        AI assistance
        <Badge>{a.contextType.replace(/_/g, ' ')}</Badge>
      </Title>
      <Body>{a.explanation}</Body>
      <Meta>
        Confidence: {a.confidence} — {a.confidenceReason}
        {a.relatedRoute ? ` · Route: ${a.relatedRoute}` : ''}
      </Meta>
      {a.warnings.length > 0 ? <Meta>{a.warnings.join(' ')}</Meta> : null}
    </Root>
  )
}
