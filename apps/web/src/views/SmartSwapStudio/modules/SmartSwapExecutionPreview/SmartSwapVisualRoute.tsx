import React from 'react'
import styled from 'styled-components'
import type { SmartSwapRouteHopDisplay } from 'lib/smart-swap-execution-preview'

const Root = styled.div`
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(247, 201, 72, 0.18);
  background: #171512;
  box-sizing: border-box;
`

const Label = styled.div`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #9ca3af;
  margin-bottom: 8px;
`

const Track = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`

const Node = styled.li<{ $pool?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  max-width: 100%;
`

const Icon = styled.span<{ $pool?: boolean }>`
  width: ${({ $pool }) => ($pool ? '36px' : '32px')};
  height: ${({ $pool }) => ($pool ? '36px' : '32px')};
  border-radius: ${({ $pool }) => ($pool ? '10px' : '50%')};
  border: 1px solid ${({ $pool }) => ($pool ? 'rgba(247, 201, 72, 0.45)' : 'rgba(247, 201, 72, 0.35)')};
  background: ${({ $pool }) => ($pool ? 'rgba(247, 201, 72, 0.08)' : '#121212')};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ $pool }) => ($pool ? '9px' : '11px')};
  font-weight: 800;
  color: #f7c948;
  letter-spacing: 0.02em;
`

const Caption = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #f8fafc;
  text-align: center;
  line-height: 1.25;
  max-width: 220px;
  word-break: break-word;
`

const Arrow = styled.li`
  list-style: none;
  color: #f7c948;
  font-size: 12px;
  line-height: 1;
  opacity: 0.85;
`

const Empty = styled.p`
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
`

function initials(label: string, pool?: boolean): string {
  if (pool) {
    const pair = label.replace(/\s*Pool.*$/i, '').trim()
    const parts = pair.split(/[\/\-]/).filter(Boolean)
    if (parts.length >= 2) return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase()
    return 'LP'
  }
  return label.slice(0, 3).toUpperCase()
}

export type SmartSwapVisualRouteProps = {
  hops: SmartSwapRouteHopDisplay[]
  direct?: boolean
}

/** Icon-led vertical route — replaces long text path strings. */
export function SmartSwapVisualRoute({ hops, direct }: SmartSwapVisualRouteProps) {
  if (!hops.length) {
    return (
      <Root data-smart-visual-route data-route-state="unavailable">
        <Label>Route</Label>
        <Empty>Route unavailable</Empty>
      </Root>
    )
  }

  return (
    <Root data-smart-visual-route data-route-state={direct ? 'direct' : 'multi'}>
      <Label>Route{direct ? ' · Direct' : ''}</Label>
      <Track aria-label="Swap route">
        {hops.map((hop, i) => (
          <React.Fragment key={`${hop.kind}-${hop.label}-${i}`}>
            {i > 0 ? <Arrow aria-hidden>↓</Arrow> : null}
            <Node $pool={hop.kind === 'pool'}>
              <Icon $pool={hop.kind === 'pool'} aria-hidden>
                {initials(hop.label, hop.kind === 'pool')}
              </Icon>
              <Caption>{hop.kind === 'pool' && direct ? 'Direct pool' : hop.label}</Caption>
            </Node>
          </React.Fragment>
        ))}
      </Track>
    </Root>
  )
}

export default SmartSwapVisualRoute
