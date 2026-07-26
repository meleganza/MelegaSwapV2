import React from 'react'
import styled from 'styled-components'
import { Currency } from '@pancakeswap/sdk'
import { CurrencyLogo, DoubleCurrencyLogo } from 'components/Logo'
import type { SmartSwapRouteHopDisplay } from 'lib/smart-swap-execution-preview'

const Root = styled.div`
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(247, 201, 72, 0.18);
  background: #171512;
  box-sizing: border-box;
  max-height: 112px;
  overflow: hidden;
`

const Header = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
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
  line-height: 1.2;
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
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
  overflow: hidden;
  min-height: 52px;
`

const Node = styled.li`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-width: 0;
  flex: 0 1 auto;
`

const LogoWrap = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
`

const Caption = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #f8fafc;
  text-align: center;
  line-height: 1.15;
  white-space: nowrap;
`

const Type = styled.span`
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: #9ca3af;
`

const Arrow = styled.li`
  list-style: none;
  color: #f7c948;
  font-size: 14px;
  line-height: 1;
  opacity: 0.9;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  align-self: center;
  height: 32px;
  margin-top: -18px;
`

const Empty = styled.p`
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
  padding: 10px 0 4px;
`

export type SmartSwapVisualRouteProps = {
  hops: SmartSwapRouteHopDisplay[]
  executionSourceLabel?: string
  executionSourceDetail?: string
  inputCurrency?: Currency | null
  outputCurrency?: Currency | null
  /** When true, no amount entered — silent soft prompt only. */
  idle?: boolean
}

/** Compact horizontal route with token/pool logos — no scroll, no abbreviated letter marks. */
export function SmartSwapVisualRoute({
  hops,
  executionSourceLabel,
  executionSourceDetail,
  inputCurrency,
  outputCurrency,
  idle = false,
}: SmartSwapVisualRouteProps) {
  if (!hops.length) {
    return (
      <Root data-smart-visual-route data-route-orientation="horizontal" data-route-state={idle ? 'idle' : 'empty'}>
        <Header>
          <Label>Route</Label>
        </Header>
        <Empty>{idle || !executionSourceLabel ? 'Enter amount to preview route' : null}</Empty>
      </Root>
    )
  }

  const tokenHops = hops.filter((h) => h.kind === 'token')
  const firstToken = tokenHops[0]?.label
  const lastToken = tokenHops[tokenHops.length - 1]?.label

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
        {hops.map((hop, i) => {
          const isInput = hop.kind === 'token' && hop.label === firstToken
          const isOutput = hop.kind === 'token' && hop.label === lastToken && hop.label !== firstToken
          const logo =
            hop.kind === 'pool' ? (
              <DoubleCurrencyLogo currency0={inputCurrency ?? undefined} currency1={outputCurrency ?? undefined} size={16} />
            ) : isInput && inputCurrency ? (
              <CurrencyLogo currency={inputCurrency} size="28px" />
            ) : isOutput && outputCurrency ? (
              <CurrencyLogo currency={outputCurrency} size="28px" />
            ) : (
              <CurrencyLogo currency={inputCurrency ?? outputCurrency ?? undefined} size="28px" />
            )

          return (
            <React.Fragment key={`${hop.kind}-${hop.label}-${i}`}>
              {i > 0 ? <Arrow aria-hidden>→</Arrow> : null}
              <Node>
                <LogoWrap aria-hidden>{logo}</LogoWrap>
                <Caption title={hop.label}>{hop.label}</Caption>
                <Type>{hop.kind === 'pool' ? 'Pool' : 'Token'}</Type>
              </Node>
            </React.Fragment>
          )
        })}
      </Track>
    </Root>
  )
}

export default SmartSwapVisualRoute
