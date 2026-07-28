/**
 * Smart Swap Module 006 — AI Assistance (compact by default).
 */

import styled from 'styled-components'
import type { SmartSwapAIAssistanceResult } from 'lib/smart-swap-ai-assistance'

const Root = styled.aside<{ $compact?: boolean }>`
  width: 100%;
  margin-top: 0;
  padding: ${({ $compact }) => ($compact ? '8px 10px' : '10px 12px')};
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(15, 23, 42, 0.65);
  color: #e2e8f0;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
`

const Title = styled.h4`
  margin: 0 0 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #9ca3af;
`

const Body = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.35;
  color: #f1f5f9;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

export type SmartSwapAIAssistancePanelProps = {
  result: SmartSwapAIAssistanceResult
  compact?: boolean
}

export function SmartSwapAIAssistancePanel({ result, compact = false }: SmartSwapAIAssistancePanelProps) {
  if (result.status !== 'ok' || !result.assistance) {
    if (compact) return null
    return (
      <Root data-smart-swap-module="006" data-ai-state="failure" data-ai-optional="true">
        <Title>AI Insight</Title>
        <Body role="status">AI insight unavailable.</Body>
      </Root>
    )
  }

  const a = result.assistance
  return (
    <Root
      $compact={compact}
      data-smart-swap-module="006"
      data-ai-state="ready"
      data-ai-context={a.contextType}
      data-ai-optional="true"
      data-ai-compact={compact ? 'true' : 'false'}
    >
      <Title>AI Insight</Title>
      <Body>{a.explanation}</Body>
    </Root>
  )
}
