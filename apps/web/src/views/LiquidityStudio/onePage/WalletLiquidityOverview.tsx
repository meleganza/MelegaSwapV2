import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useAccount } from 'wagmi'
import { Wallet } from 'lucide-react'
import ConnectWalletButton from 'components/ConnectWalletButton'
import type { PortfolioPosition } from 'lib/wallet-portfolio/contracts'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'
import { selectLiquidityPortfolioPositions } from '../liquidityRuntime/buildLiquidityWalletPortfolio'
import { useProgramReadModel } from '../liquidityBuilding/useProgramReadModel'
import { liqOne } from './onePageTokens'

const COLORS = ['#DDB92F', '#16D977', '#5B8CFF', '#A8A8A8'] as const

const Wrap = styled.div`
  width: 100%;
  max-width: ${liqOne.contentMax};
  min-width: 0;
  font-family: ${liqOne.font};
`

/** Page section heading — outside the 180px module. */
const SectionHeading = styled.h2`
  margin: 0 0 12px;
  font-size: 18px;
  line-height: 24px;
  font-weight: 700;
  color: ${liqOne.text};
`

const Module = styled.section`
  width: ${liqOne.contentMax};
  max-width: 100%;
  height: ${liqOne.overviewH};
  min-height: ${liqOne.overviewH};
  max-height: ${liqOne.overviewH};
  margin: 0;
  padding: ${liqOne.overviewPad};
  box-sizing: border-box;
  background: ${liqOne.card};
  border: 1px solid ${liqOne.border};
  border-radius: ${liqOne.cardRadius};
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media (max-width: 1375px) {
    width: calc(100vw - 32px);
    max-width: 100%;
    height: auto;
    min-height: 0;
    max-height: none;
    overflow: visible;
  }
`

const Grid = styled.div`
  flex: 0 0 auto;
  width: 1344px;
  max-width: 100%;
  height: ${liqOne.overviewInnerH};
  min-height: ${liqOne.overviewInnerH};
  max-height: ${liqOne.overviewInnerH};
  display: grid;
  grid-template-columns:
    ${liqOne.overviewColA} ${liqOne.overviewColB} ${liqOne.overviewColC} ${liqOne.overviewColD}
    ${liqOne.overviewColE};
  column-gap: ${liqOne.overviewGap};
  align-items: stretch;
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 1375px) {
    width: 100%;
    height: auto;
    min-height: 0;
    max-height: none;
    grid-template-columns: 1fr 1fr;
    row-gap: 12px;
    column-gap: 12px;
    overflow: visible;

    & > [data-testid='liq-overview-col-value'],
    & > [data-testid='liq-overview-col-holdings'] {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 360px) {
    grid-template-columns: 1fr;

    & > [data-testid='liq-overview-col-value'],
    & > [data-testid='liq-overview-col-holdings'],
    & > [data-testid='liq-overview-col-fees'] {
      grid-column: auto;
    }
  }
`

const Cell = styled.div`
  width: 100%;
  height: ${liqOne.overviewInnerH};
  min-height: ${liqOne.overviewInnerH};
  max-height: ${liqOne.overviewInnerH};
  padding: 16px;
  box-sizing: border-box;
  background: ${liqOne.elevated};
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  min-width: 0;

  @media (max-width: 1375px) {
    height: auto;
    min-height: 112px;
    max-height: none;
  }
`

const HoldingsCell = styled(Cell)`
  padding: 14px;
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  column-gap: 12px;
  align-items: center;

  @media (max-width: 360px) {
    grid-template-columns: 1fr;
    justify-items: center;
  }
`

const Label = styled.div`
  font-size: 11px;
  line-height: 14px;
  font-weight: 650;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${liqOne.muted};
`

const Primary = styled.div<{ $size?: 'lg' | 'md' }>`
  margin-top: 8px;
  font-size: ${({ $size }) => ($size === 'md' ? '28px' : '30px')};
  line-height: ${({ $size }) => ($size === 'md' ? '34px' : '36px')};
  font-weight: 750;
  color: ${liqOne.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Secondary = styled.div`
  margin-top: 6px;
  font-size: 13px;
  line-height: 18px;
  font-weight: 600;
  color: ${liqOne.secondary};
`

const Support = styled.div`
  margin-top: 4px;
  font-size: 12px;
  line-height: 17px;
  font-weight: 400;
  color: ${liqOne.muted};
`

const HoldingsHead = styled(Label)`
  grid-column: 1 / -1;
`

const Donut = styled.div`
  width: 112px;
  height: 112px;
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;
`

const DonutHole = styled.div`
  position: absolute;
  inset: 28px;
  border-radius: 50%;
  background: ${liqOne.elevated};
`

const Legend = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  min-width: 0;
  width: 100%;
  max-width: 174px;
`

const LegendRow = styled.li`
  display: grid;
  grid-template-columns: 8px minmax(0, 1fr) 40px minmax(44px, auto);
  gap: 6px;
  align-items: center;
  height: 24px;
  font-size: 12px;
  color: ${liqOne.secondary};
  overflow: hidden;
`

const Swatch = styled.span<{ $c: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $c }) => $c};
`

const HoldingsEmpty = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 100px;
  text-align: center;
`

const NeutralRing = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 10px solid #2a2a2a;
  box-sizing: border-box;
`

const Disconnected = styled.div`
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 14px;
  box-sizing: border-box;

  @media (max-width: 1375px) {
    flex-direction: column;
    padding: 8px 0;
    gap: 12px;
  }
`

const DisconnectCopy = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  color: ${liqOne.secondary};
  max-width: 360px;
`

const ConnectWrap = styled.div`
  button {
    height: 40px !important;
    min-height: 40px !important;
    border-radius: 10px !important;
    padding: 0 18px !important;
  }
`

const ChainMark = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  margin-right: 6px;
  margin-top: 6px;
  border-radius: 6px;
  border: 1px solid ${liqOne.borderStrong};
  background: #121212;
  font-size: 11px;
  font-weight: 700;
  color: ${liqOne.text};
`

type Props = {
  lbProgramCount?: number
}

type HoldingRow = { symbol: string; pct: number; value: number | null; color: string }

/** Localhost certify-only override. Never active on production hosts. */
export type OverviewCertMode = 'force-connected-empty' | 'force-unavailable' | 'force-injected' | null

type InjectedFixture = {
  lbPrograms?: number
  valuationUnavailable?: boolean
  holdingsUnavailable?: boolean
  feesUnavailable?: boolean
  positions?: Array<{
    title: string
    currentValueUsd: string | null
    claimableValueUsd?: string | null
    chainId: number
    chainName: string
    underlyings: Array<{ symbol: string; valueUsd: string | null }>
  }>
}

declare global {
  // eslint-disable-next-line no-var
  var __LIQ_MODULE_005_FIXTURE__: InjectedFixture | undefined
}

function parseUsd(raw: string | null | undefined): number | null {
  if (raw == null || raw === '') return null
  const n = Number(String(raw).replace(/[$,]/g, ''))
  if (!Number.isFinite(n)) return null
  return n
}

function formatUsd(n: number | null | undefined, opts?: { allowZero?: boolean }): string {
  if (n == null || !Number.isFinite(n)) return '—'
  if (n === 0) return opts?.allowZero ? '$0.00' : '—'
  if (n > 0 && n < 0.01) return '<$0.01'
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

function isLocalCertHost(): boolean {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname
  return host === '127.0.0.1' || host === 'localhost'
}

function readCertMode(): OverviewCertMode {
  if (!isLocalCertHost()) return null
  if (window.__LIQ_MODULE_005_FIXTURE__) return 'force-injected'
  const q = new URLSearchParams(window.location.search).get('overviewCert')
  if (q === 'force-connected-empty' || q === 'force-unavailable') return q
  return null
}

function readInjected(): InjectedFixture | null {
  if (!isLocalCertHost()) return null
  return window.__LIQ_MODULE_005_FIXTURE__ ?? null
}

function positionsFromInjected(fx: InjectedFixture): PortfolioPosition[] {
  return (fx.positions ?? []).map((p, i) => ({
    title: p.title,
    currentValueUsd: p.currentValueUsd,
    claimableValueUsd: p.claimableValueUsd ?? null,
    feesEarnedUsd: null,
    chain: { chainId: p.chainId, name: p.chainName },
    underlyingAssets: p.underlyings.map((u) => ({
      token: {
        symbol: u.symbol,
        address: null,
        chainId: p.chainId,
        name: null,
        decimals: null,
        logoURI: null,
      },
      amount: null,
      valueUsd: u.valueUsd,
    })),
    positionId: `cert-${i}`,
  })) as unknown as PortfolioPosition[]
}

function buildHoldings(positions: PortfolioPosition[]): HoldingRow[] {
  const weights = new Map<string, number>()
  for (const p of positions) {
    const assets = (p.underlyingAssets ?? []).filter((a) => a?.token?.symbol || a?.token?.address)
    if (!assets.length) continue
    const posUsd = parseUsd(p.currentValueUsd)
    for (const a of assets) {
      const symbol = a.token.symbol || a.token.address?.slice(0, 6) || 'Token'
      const assetUsd = parseUsd(a.valueUsd)
      const share = assetUsd != null ? assetUsd : posUsd != null ? posUsd / assets.length : null
      if (share == null) continue
      weights.set(symbol, (weights.get(symbol) ?? 0) + share)
    }
  }
  const entries = [...weights.entries()].filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])
  const total = entries.reduce((s, [, v]) => s + v, 0)
  if (!(total > 0)) return []
  const top = entries.slice(0, 3)
  const topSum = top.reduce((s, [, v]) => s + v, 0)
  const rows: HoldingRow[] = top.map(([symbol, v], i) => ({
    symbol,
    pct: (v / total) * 100,
    value: v,
    color: COLORS[i % COLORS.length],
  }))
  if (entries.length > 3) {
    rows.push({
      symbol: 'Others',
      pct: ((total - topSum) / total) * 100,
      value: total - topSum,
      color: COLORS[3],
    })
  }
  return rows
}

export const WalletLiquidityOverview: React.FC<Props> = ({ lbProgramCount = 0 }) => {
  const { isConnected, address } = useAccount()
  const { liquidityWalletPortfolio } = useLiquidityRuntime()
  const portfolioPositions = useMemo(
    () => selectLiquidityPortfolioPositions(liquidityWalletPortfolio),
    [liquidityWalletPortfolio],
  )

  const programRead = useProgramReadModel({
    owner: address ?? null,
    projectTokenAddress: null,
  })

  const [certMode, setCertMode] = useState<OverviewCertMode>(null)
  const [injected, setInjected] = useState<InjectedFixture | null>(null)
  useEffect(() => {
    setCertMode(readCertMode())
    setInjected(readInjected())
  }, [])

  const lbFromChain =
    programRead.source === 'ON_CHAIN' &&
    programRead.snapshot.status != null &&
    !['NOT_ACTIVE', 'STOPPED'].includes(String(programRead.snapshot.status))
      ? 1
      : 0
  const lbPrograms = Math.max(
    injected?.lbPrograms ?? 0,
    Math.max(lbFromChain, Math.max(0, lbProgramCount)),
  )

  const connected = certMode ? true : isConnected
  const forceEmpty = certMode === 'force-connected-empty'
  const forceUnavail = certMode === 'force-unavailable' || Boolean(injected?.valuationUnavailable)

  const positions = useMemo(() => {
    if (forceEmpty || (!connected && !certMode)) return [] as PortfolioPosition[]
    if (injected?.positions) return positionsFromInjected(injected)
    return portfolioPositions
  }, [forceEmpty, connected, certMode, injected, portfolioPositions])

  const activeManual = positions.length
  const totalPositions = activeManual + lbPrograms

  const totalLp = useMemo(() => {
    if (forceUnavail) return null
    if (forceEmpty) return 0
    let sum = 0
    let any = false
    for (const p of positions) {
      const v = parseUsd(p.currentValueUsd)
      if (v != null) {
        sum += v
        any = true
      }
    }
    if (any) return sum
    if (connected && activeManual === 0 && lbPrograms === 0) return 0
    return null
  }, [positions, forceUnavail, forceEmpty, connected, activeManual, lbPrograms])

  const holdings = useMemo(() => {
    if (injected?.holdingsUnavailable || forceUnavail || forceEmpty) return [] as HoldingRow[]
    return buildHoldings(positions)
  }, [positions, forceEmpty, forceUnavail, injected])

  const donut = useMemo(() => {
    if (!holdings.length) return 'conic-gradient(#2A2A2A 0deg 360deg)'
    let cursor = 0
    const parts = holdings.map((h) => {
      const start = cursor
      cursor += (h.pct / 100) * 360
      return `${h.color} ${start}deg ${cursor}deg`
    })
    return `conic-gradient(${parts.join(', ')})`
  }, [holdings])

  const networks = useMemo(() => {
    if (forceEmpty) return [] as { chainId: number; name: string }[]
    const map = new Map<number, string>()
    for (const p of positions) {
      const id = p.chain?.chainId
      if (id == null) continue
      if (id !== 56 && id !== 97) continue
      map.set(id, p.chain?.name || (id === 56 ? 'BNB Smart Chain' : 'BNB Testnet'))
    }
    if (lbPrograms > 0 && !map.has(56)) map.set(56, 'BNB Smart Chain')
    return [...map.entries()].map(([chainId, name]) => ({ chainId, name }))
  }, [positions, lbPrograms, forceEmpty])

  const fees = useMemo(() => {
    if (injected?.feesUnavailable || certMode === 'force-unavailable') {
      return { value: null as number | null, label: 'Fees unavailable' as const }
    }
    if (forceEmpty || (connected && activeManual === 0 && lbPrograms === 0)) {
      return { value: 0, label: 'No unclaimed fees' as const }
    }
    let sum = 0
    let any = false
    for (const p of positions) {
      const v = parseUsd(p.claimableValueUsd) ?? parseUsd(p.feesEarnedUsd)
      if (v != null) {
        sum += v
        any = true
      }
    }
    if (!any) return { value: null, label: 'Fees unavailable' as const }
    if (sum === 0) return { value: 0, label: 'No unclaimed fees' as const }
    return { value: sum, label: 'Available to claim' as const }
  }, [positions, forceEmpty, connected, activeManual, lbPrograms, injected, certMode])

  const freshness =
    liquidityWalletPortfolio?.generatedAt != null
      ? `As of ${new Date(liquidityWalletPortfolio.generatedAt).toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}`
      : null

  const showDisconnected = !connected && !certMode
  const zeroKnown = connected && activeManual === 0 && lbPrograms === 0

  return (
    <Wrap data-testid="liq-one-overview-wrap">
      <SectionHeading>Your Liquidity Overview</SectionHeading>
      <Module
        data-testid="liq-one-overview"
        data-pixel-overview="180"
        data-overview-cert={certMode || undefined}
      >
        {showDisconnected ? (
          <Disconnected data-testid="liq-overview-disconnected">
            <Wallet size={22} color={liqOne.gold} strokeWidth={1.75} aria-hidden />
            <DisconnectCopy>Connect your wallet to view your liquidity overview.</DisconnectCopy>
            <ConnectWrap>
              <ConnectWalletButton>Connect Wallet</ConnectWalletButton>
            </ConnectWrap>
          </Disconnected>
        ) : (
          <Grid data-testid="liq-overview-grid">
            <Cell data-testid="liq-overview-col-value" data-pixel-ov-col="336">
              <Label>Total LP Value</Label>
              <Primary>
                {totalLp == null ? '—' : formatUsd(totalLp, { allowZero: zeroKnown || forceEmpty })}
              </Primary>
              <Secondary>
                {totalLp == null
                  ? 'Valuation unavailable'
                  : totalLp === 0
                    ? 'No LP value yet'
                    : freshness || 'Wallet LP estimate'}
              </Secondary>
            </Cell>

            <HoldingsCell data-testid="liq-overview-col-holdings" data-pixel-ov-col="336">
              <HoldingsHead>Holdings Breakdown</HoldingsHead>
              {holdings.length ? (
                <>
                  <Donut aria-hidden style={{ background: donut }} data-testid="liq-overview-donut">
                    <DonutHole />
                  </Donut>
                  <Legend data-testid="liq-overview-legend">
                    {holdings.map((h) => (
                      <LegendRow key={h.symbol}>
                        <Swatch $c={h.color} />
                        <span
                          style={{
                            color: liqOne.text,
                            fontWeight: 650,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {h.symbol}
                        </span>
                        <span>{h.pct.toFixed(1)}%</span>
                        <span>{formatUsd(h.value)}</span>
                      </LegendRow>
                    ))}
                  </Legend>
                </>
              ) : (
                <HoldingsEmpty data-testid="liq-overview-holdings-empty">
                  <NeutralRing aria-hidden />
                  <Support>
                    {zeroKnown || forceEmpty ? 'No holdings yet' : 'Holdings composition unavailable'}
                  </Support>
                </HoldingsEmpty>
              )}
            </HoldingsCell>

            <Cell data-testid="liq-overview-col-positions" data-pixel-ov-col="216">
              <Label>Active Positions</Label>
              <Primary $size="md">{String(activeManual)}</Primary>
              <Secondary>Total Positions {totalPositions}</Secondary>
              <Support>LB Programs {lbPrograms}</Support>
            </Cell>

            <Cell data-testid="liq-overview-col-networks" data-pixel-ov-col="216">
              <Label>Networks</Label>
              <Primary $size="md">{String(networks.length)}</Primary>
              <div>
                {networks.slice(0, 3).map((n) => (
                  <ChainMark key={n.chainId}>{n.name === 'BNB Smart Chain' ? 'BSC' : n.name}</ChainMark>
                ))}
                {networks.length > 3 ? <ChainMark>+{networks.length - 3} more</ChainMark> : null}
                {networks.length === 0 ? <Support>No networks represented</Support> : null}
              </div>
            </Cell>

            <Cell data-testid="liq-overview-col-fees" data-pixel-ov-col="192">
              <Label>Unclaimed Fees</Label>
              <Primary $size="md">
                {fees.value == null ? '—' : formatUsd(fees.value, { allowZero: true })}
              </Primary>
              <Support>{fees.label}</Support>
            </Cell>
          </Grid>
        )}
      </Module>
    </Wrap>
  )
}

export default WalletLiquidityOverview
