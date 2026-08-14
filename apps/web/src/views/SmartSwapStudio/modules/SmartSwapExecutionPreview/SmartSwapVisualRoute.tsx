import React, { useMemo } from 'react'
import styled from 'styled-components'
import { ChainId, Currency, Token } from '@pancakeswap/sdk'
import { TokenLogo } from '@pancakeswap/uikit'
import { CurrencyLogo } from 'components/Logo'
import { BAD_SRCS } from 'components/Logo/constants'
import { useToken } from 'hooks/Tokens'
import { getTokenLogoURLByAddress, getTokenLogoPosition } from 'utils/getTokenLogoURL'
import type { SmartSwapRouteHopDisplay } from 'lib/smart-swap-execution-preview'

const Root = styled.div`
  width: 100%;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid rgba(247, 201, 72, 0.18);
  background: #171512;
  box-sizing: border-box;
  max-height: none;
  overflow: hidden;
`

const Header = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
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
  gap: 8px;
  overflow: hidden;
  min-height: 44px;
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
  width: 28px;
  height: 28px;
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
  justify-content: center;
  align-self: center;
  height: 28px;
  margin-top: 0;
`

const Empty = styled.p`
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
  padding: 5px 0 2px;
`

const Placeholder = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #2a2a2a;
  color: #9ca3af;
  font-size: 10px;
  font-weight: 700;
`

function sameAddress(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false
  return a.toLowerCase() === b.toLowerCase()
}

function symbolMatches(currency: Currency | null | undefined, label: string): boolean {
  if (!currency?.symbol || !label) return false
  const a = currency.symbol.toUpperCase()
  const b = label.toUpperCase()
  if (a === b) return true
  // Native BNB ↔ WBNB labels in hop path
  if ((a === 'BNB' || a === 'WBNB') && (b === 'BNB' || b === 'WBNB')) return true
  return false
}

/** Address-exact logo — never falls back to another hop's currency. */
function AddressTokenLogo({
  address,
  chainId = ChainId.BSC,
  symbol,
  size = '28px',
}: {
  address?: string
  chainId?: number
  symbol?: string
  size?: string
}) {
  const token = useToken(address)
  const srcs = useMemo(() => {
    if (!address) return [] as string[]
    const urls: string[] = []
    const trust = getTokenLogoURLByAddress(address, chainId)
    if (trust) urls.push(trust)
    try {
      const asToken = token ?? new Token(chainId, address, 18, symbol || 'TOKEN')
      const local = getTokenLogoPosition(asToken)
      if (local) urls.push(local)
    } catch {
      /* ignore invalid address */
    }
    return urls
  }, [address, chainId, symbol, token])

  if (token) {
    return <CurrencyLogo currency={token} size={size} />
  }
  if (srcs.length > 0) {
    return (
      <TokenLogo
        badSrcs={BAD_SRCS}
        size={size}
        srcs={srcs}
        width={size}
        alt={`${symbol ?? 'token'} logo`}
        style={{ borderRadius: '50%' }}
      />
    )
  }
  return <Placeholder aria-hidden>{(symbol || '?').slice(0, 2).toUpperCase()}</Placeholder>
}

function resolveTokenCurrency(
  hop: SmartSwapRouteHopDisplay,
  inputCurrency?: Currency | null,
  outputCurrency?: Currency | null,
): Currency | undefined {
  const addr = hop.address
  if (addr && inputCurrency?.isToken && sameAddress(inputCurrency.address, addr)) return inputCurrency
  if (addr && outputCurrency?.isToken && sameAddress(outputCurrency.address, addr)) return outputCurrency
  if (addr && inputCurrency?.isNative && (hop.label === 'BNB' || hop.label === 'WBNB')) return inputCurrency
  if (addr && outputCurrency?.isNative && (hop.label === 'BNB' || hop.label === 'WBNB')) return outputCurrency
  // Symbol match only when addresses unavailable — still never cross-map input→output wrongly.
  if (!addr) {
    if (symbolMatches(inputCurrency, hop.label)) return inputCurrency ?? undefined
    if (symbolMatches(outputCurrency, hop.label)) return outputCurrency ?? undefined
  }
  return undefined
}

function HopLogo({
  hop,
  inputCurrency,
  outputCurrency,
}: {
  hop: SmartSwapRouteHopDisplay
  inputCurrency?: Currency | null
  outputCurrency?: Currency | null
}) {
  if (hop.kind === 'pool') {
    const c0 =
      hop.token0Address && inputCurrency?.isToken && sameAddress(inputCurrency.address, hop.token0Address)
        ? inputCurrency
        : hop.token0Address && outputCurrency?.isToken && sameAddress(outputCurrency.address, hop.token0Address)
          ? outputCurrency
          : undefined
    const c1 =
      hop.token1Address && inputCurrency?.isToken && sameAddress(inputCurrency.address, hop.token1Address)
        ? inputCurrency
        : hop.token1Address && outputCurrency?.isToken && sameAddress(outputCurrency.address, hop.token1Address)
          ? outputCurrency
          : undefined

    // Prefer exact pool pair currencies; fall back to address logos — never default both to input.
    if (c0 || c1 || hop.token0Address || hop.token1Address) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          {c0 ? (
            <CurrencyLogo currency={c0} size="20px" />
          ) : (
            <AddressTokenLogo address={hop.token0Address} chainId={hop.chainId} size="20px" />
          )}
          <span style={{ width: 4 }} />
          {c1 ? (
            <CurrencyLogo currency={c1} size="20px" />
          ) : (
            <AddressTokenLogo address={hop.token1Address} chainId={hop.chainId} size="20px" />
          )}
        </span>
      )
    }
    // Last resort: only when pool has no addresses — show generic placeholder, never wrong token.
    return <Placeholder aria-hidden>LP</Placeholder>
  }

  const matched = resolveTokenCurrency(hop, inputCurrency, outputCurrency)
  if (matched) {
    return <CurrencyLogo currency={matched} size="28px" />
  }
  // Exact address logo path — never inherit previous hop / inputCurrency fallback.
  return (
    <AddressTokenLogo
      address={hop.address}
      chainId={hop.chainId}
      symbol={hop.label}
      size="28px"
    />
  )
}

export type SmartSwapVisualRouteProps = {
  hops: SmartSwapRouteHopDisplay[]
  executionSourceLabel?: string
  executionSourceDetail?: string
  inputCurrency?: Currency | null
  outputCurrency?: Currency | null
  /** When true, no amount entered — silent soft prompt only. */
  idle?: boolean
}

/** Compact horizontal route with address-exact token/pool logos. */
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
      <Root data-smart-visual-route data-smart-route-card data-route-orientation="horizontal" data-route-state={idle ? 'idle' : 'empty'}>
        <Header>
          <Label>Route</Label>
        </Header>
        <Empty>{idle || !executionSourceLabel ? 'Enter amount to preview route' : null}</Empty>
      </Root>
    )
  }

  return (
    <Root data-smart-visual-route data-smart-route-card data-route-orientation="horizontal" data-route-state="ready">
      <Header>
        <Label>Route</Label>
        <Source data-execution-source>
          {executionSourceLabel ?? 'Melega Router'}
          {executionSourceDetail ? <SourceDetail>{executionSourceDetail}</SourceDetail> : null}
        </Source>
      </Header>
      <Track aria-label="Swap route">
        {hops.map((hop, i) => (
          <React.Fragment key={`${hop.kind}-${hop.label}-${hop.address ?? hop.token0Address ?? i}-${i}`}>
            {i > 0 ? <Arrow aria-hidden>→</Arrow> : null}
            <Node data-route-hop={hop.kind} data-route-address={hop.address ?? undefined}>
              <LogoWrap aria-hidden>
                <HopLogo hop={hop} inputCurrency={inputCurrency} outputCurrency={outputCurrency} />
              </LogoWrap>
              <Caption title={hop.label}>{hop.label}</Caption>
              <Type>{hop.kind === 'pool' ? 'Pool' : 'Token'}</Type>
            </Node>
          </React.Fragment>
        ))}
      </Track>
    </Root>
  )
}

export default SmartSwapVisualRoute
