import React from 'react'
import styled from 'styled-components'
import type { SmartSwapRouteHopDisplay } from 'lib/smart-swap-execution-preview'

const Root = styled.div`
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(247, 201, 72, 0.18);
  background: #171512;
  box-sizing: border-box;
`

const Header = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
`

const Label = styled.div`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #9ca3af;
`

const Source = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #f7c948;
  text-align: right;
  line-height: 1.25;
`

const SourceDetail = styled.div`
  font-size: 10px;
  font-weight: 500;
  color: #9ca3af;
  margin-top: 1px;
`

const Track = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 6px;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scrollbar-width: thin;
`

const Node = styled.li<{ $pool?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: ${({ $pool }) => ($pool ? '72px' : '56px')};
  flex: 0 0 auto;
`

const Icon = styled.span<{ $pool?: boolean }>`
  width: ${({ $pool }) => ($pool ? '40px' : '34px')};
  height: ${({ $pool }) => ($pool ? '40px' : '34px')};
  border-radius: ${({ $pool }) => ($pool ? '12px' : '50%')};
  border: 1px solid ${({ $pool }) => ($pool ? 'rgba(247, 201, 72, 0.45)' : 'rgba(247, 201, 72, 0.35)')};
  background: ${({ $pool }) => ($pool ? 'rgba(247, 201, 72, 0.08)' : '#121212')};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ $pool }) => ($pool ? '10px' : '11px')};
  font-weight: 800;
  color: #f7c948;
  letter-spacing: 0.02em;
`

const Caption = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #f8fafc;
  text-align: center;
  line-height: 1.2;
  max-width: 88px;
  word-break: break-word;
`

const Type = styled.span`
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #9ca3af;
`

const Arrow = styled.li`
  list-style: none;
  color: #f7c948;
  font-size: 14px;
  line-height: 34px;
  opacity: 0.9;
  flex: 0 0 auto;
  padding: 0 2px;
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

function hopType(kind: 'token' | 'pool', detail?: string): string {
  if (kind === 'token') return 'Token'
  if (detail === 'stable') return 'Stable pool'
  if (detail === 'v2') return 'V2 pool'
  return 'Pool'
}

export type SmartSwapVisualRouteProps = {
  hops: SmartSwapRouteHopDisplay[]
  executionSourceLabel?: string
  executionSourceDetail?: string
}

/** Horizontal icon-led route with explicit execution source context. */
export function SmartSwapVisualRoute({
  hops,
  executionSourceLabel,
  executionSourceDetail,
}: SmartSwapVisualRouteProps) {
  if (!hops.length) {
    return (
      <Root data-smart-visual-route data-route-orientation="horizontal" data-route-state="unavailable">
        <Header>
          <Label>Route</Label>
          <Source>
            Route unavailable
            <SourceDetail>No execution source</SourceDetail>
          </Source>
        </Header>
        <Empty>Enter an amount to preview the route</Empty>
      </Root>
    )
  }

  return (
    <Root data-smart-visual-route data-route-orientation="horizontal" data-route-state="ready">
      <Header>
        <Label>Route</Label>
        <Source data-execution-source>
          {executionSourceLabel ?? 'Melega Router'}
          {executionSourceDetail ? <SourceDetail>{executionSourceDetail}</SourceDetail> : null}
        </Source>
      </Header>
      <Track aria-label="Swap route">
        {hops.map((hop, i) => (
          <React.Fragment key={`${hop.kind}-${hop.label}-${i}`}>
            {i > 0 ? <Arrow aria-hidden>→</Arrow> : null}
            <Node $pool={hop.kind === 'pool'}>
              <Icon $pool={hop.kind === 'pool'} aria-hidden>
                {initials(hop.label, hop.kind === 'pool')}
              </Icon>
              <Caption>{hop.label}</Caption>
              <Type>{hopType(hop.kind, hop.detail)}</Type>
            </Node>
          </React.Fragment>
        ))}
      </Track>
    </Root>
  )
}

export default SmartSwapVisualRoute
