/**
 * Certified handoff gate UI — readiness only. User must confirm in SmartSwapForm.
 */

import styled from 'styled-components'
import type { SmartSwapExecutionHandoff } from 'lib/smart-swap-execution-handoff'

const Root = styled.section`
  width: 100%;
  margin-top: 10px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(2, 6, 23, 0.7);
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

const Badge = styled.span<{ $ok?: boolean }>`
  display: inline-block;
  margin-left: 6px;
  font-size: 10px;
  font-weight: 700;
  color: ${({ $ok }) => ($ok ? '#86efac' : '#fbbf24')};
`

const Body = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: #f1f5f9;
`

const List = styled.ul`
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const Item = styled.li<{ $ok?: boolean }>`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
  color: ${({ $ok }) => ($ok ? '#cbd5e1' : '#fca5a5')};
`

const Meta = styled.p`
  margin: 8px 0 0;
  font-size: 10px;
  color: #94a3b8;
  line-height: 1.4;
`

export type SmartSwapExecutionHandoffPanelProps = {
  handoff: SmartSwapExecutionHandoff
}

export function SmartSwapExecutionHandoffPanel({ handoff }: SmartSwapExecutionHandoffPanelProps) {
  return (
    <Root
      data-smart-swap-module="handoff"
      data-handoff-certified={handoff.certified ? 'true' : 'false'}
      data-handoff-lifecycle={handoff.lifecycle}
      aria-label="Certified execution handoff"
    >
      <Title>
        Certified handoff
        <Badge $ok={handoff.certified}>{handoff.lifecycle.replace(/_/g, ' ')}</Badge>
      </Title>
      <Body role="status">{handoff.message}</Body>
      <List>
        {handoff.checks.map((c) => (
          <Item key={c.id} $ok={c.satisfied}>
            <span>{c.label}</span>
            <span>{c.satisfied ? 'OK' : c.failure?.replace(/_/g, ' ') ?? 'Blocked'}</span>
          </Item>
        ))}
      </List>
      <Meta>
        Auto-sign forbidden. Auto-broadcast forbidden. Confirm explicitly in the swap form to request a
        wallet signature.
      </Meta>
    </Root>
  )
}
