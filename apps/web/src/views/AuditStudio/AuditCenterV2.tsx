/**
 * Audit Center V2 — Mission Control surface (UI / visualization only).
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { getBlockExploreLink } from 'utils'
import { MelegaExploreChainBadge } from 'components/Logo/MelegaExploreChainBadge'
import {
  Band,
  BandHead,
  BandMeta,
  BandTitle,
  Inner,
  Muted,
  Page,
  ac,
  toneColor,
} from './auditTokens'
import { DonutRing, Heatmap, MiniSpark, ScoreGauge, ThermometerBar } from './visuals'
import {
  buildChainBoard,
  buildDimensions,
  buildOfficialContracts,
  computeMelegaScore,
  type OfficialContractRow,
} from './buildOfficialContracts'

type ReadinessPayload = {
  timestamp?: string
  verdict?: string
  components?: Record<string, string>
  indexer?: {
    storageConfigured?: boolean
    lastIndexedBlock?: number
    chainHead?: number
    indexingLag?: number
    lastSuccessfulSync?: string
    phase?: string
  }
}

type HealthPayload = {
  status?: string
  lastIndexedBlock?: number
  chainHead?: number
  indexingLag?: number
  storageConfigured?: boolean
  lastSuccessfulSync?: string
  activeDeploymentSha?: string | null
  phase?: string
}

type LiveTone = 'ok' | 'warn' | 'bad' | 'mute'

const Hero = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
  align-items: center;

  @media (min-width: 960px) {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  }
`

const HeroTitle = styled.h1`
  margin: 0;
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.05;
  color: #fff;
`

const HeroLead = styled.p`
  margin: 10px 0 0;
  font-size: 15px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.72);
  max-width: 36rem;
`

const ScoreWrap = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const ScoreValue = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -58%);
  font-size: clamp(36px, 5vw, 52px);
  font-weight: 900;
  letter-spacing: -0.04em;
  color: ${ac.gold};
  font-variant-numeric: tabular-nums;
`

const ScoreLabel = styled.div`
  position: absolute;
  top: 58%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${ac.mute2};
`

const LivePill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid ${ac.goldLine};
  background: ${ac.goldDim};
  color: ${ac.gold};
  font-size: 11px;
  font-weight: 750;
`

const Pulse = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${ac.ok};
  box-shadow: 0 0 0 0 rgba(109, 220, 140, 0.55);
  animation: pulse 1.6s ease infinite;

  @keyframes pulse {
    70% {
      box-shadow: 0 0 0 8px rgba(109, 220, 140, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(109, 220, 140, 0);
    }
  }
`

const DimGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 1100px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`

const DimCard = styled.div`
  padding: 12px;
  border-radius: 12px;
  border: 1px solid ${ac.line};
  background: rgba(255, 255, 255, 0.02);
  min-width: 0;
`

const DimName = styled.div`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${ac.mute2};
`

const DimValue = styled.div<{ $tone: LiveTone }>`
  margin: 6px 0;
  font-size: 22px;
  font-weight: 850;
  font-variant-numeric: tabular-nums;
  color: ${({ $tone }) => toneColor($tone)};
`

const ContractGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;

  @media (min-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 1100px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`

const ContractCard = styled.article`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid ${ac.line};
  background:
    radial-gradient(ellipse 80% 50% at 0% 0%, rgba(221, 185, 47, 0.06), transparent 55%),
    rgba(255, 255, 255, 0.02);
  min-width: 0;
`

const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`

const CardName = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 800;
  color: #fff;
`

const Badge = styled.span<{ $tone?: LiveTone }>`
  display: inline-flex;
  align-items: center;
  min-height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'ok' ? 'rgba(109,220,140,0.35)' : $tone === 'warn' ? 'rgba(240,180,60,0.35)' : ac.line};
  color: ${({ $tone }) => toneColor($tone ?? 'mute')};
  background: rgba(0, 0, 0, 0.25);
`

const Mono = styled.code`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.78);
  word-break: break-all;
`

const MetaRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 10px;
  font-size: 11px;
  color: ${ac.mute};
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
`

const ActionBtn = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid ${ac.line};
  background: rgba(255, 255, 255, 0.03);
  color: ${ac.text};
  font-size: 11px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    border-color: ${ac.goldLine};
    color: ${ac.gold};
  }
`

const CopyBtn = styled.button`
  appearance: none;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid ${ac.line};
  background: rgba(255, 255, 255, 0.03);
  color: ${ac.text};
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
`

const LiveGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  @media (min-width: 720px) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
`

const LiveCell = styled.div<{ $tone: LiveTone }>`
  padding: 10px;
  border-radius: 12px;
  border: 1px solid ${ac.line};
  background: rgba(255, 255, 255, 0.02);
  text-align: center;

  &::before {
    content: '';
    display: block;
    width: 10px;
    height: 10px;
    margin: 0 auto 6px;
    border-radius: 50%;
    background: ${({ $tone }) => toneColor($tone)};
    box-shadow: 0 0 10px ${({ $tone }) => toneColor($tone)};
  }
`

const ChainGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  @media (min-width: 900px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
`

const ChainCard = styled.div`
  padding: 12px;
  border-radius: 12px;
  border: 1px solid ${ac.line};
  background: rgba(255, 255, 255, 0.02);
  text-align: center;
`

const Timeline = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const TimelineItem = styled.li`
  display: grid;
  grid-template-columns: 10px 1fr auto;
  gap: 10px;
  align-items: start;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid ${ac.line};
  background: rgba(255, 255, 255, 0.015);
  font-size: 12px;
`

const Dot = styled.span<{ $tone: LiveTone }>`
  width: 8px;
  height: 8px;
  margin-top: 4px;
  border-radius: 50%;
  background: ${({ $tone }) => toneColor($tone)};
`

const Formula = styled.pre`
  margin: 0;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid ${ac.goldLine};
  background: rgba(221, 185, 47, 0.05);
  color: rgba(255, 255, 255, 0.82);
  font-size: 11px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
`

const VizRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;

  @media (min-width: 900px) {
    grid-template-columns: 160px 1fr 1fr;
    align-items: center;
  }
`

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}

function ago(ms: number, now: number) {
  const s = Math.max(0, Math.floor((now - ms) / 1000))
  if (s < 5) return 'just now'
  if (s < 60) return `${s} seconds ago`
  const m = Math.floor(s / 60)
  return `${m} min ago`
}

function liveTone(status?: string | null, okWhen?: string[]): LiveTone {
  if (!status) return 'mute'
  const s = status.toLowerCase()
  if (okWhen?.some((x) => s.includes(x)) || s === 'ok' || s === 'ready' || s === 'live') return 'ok'
  if (s === 'partial' || s === 'warn' || s === 'degraded') return 'warn'
  if (s === 'blocked' || s === 'error' || s === 'fail') return 'bad'
  return 'warn'
}

const AuditCenterV2: React.FC = () => {
  const contracts = useMemo(() => buildOfficialContracts(), [])
  const [now, setNow] = useState(() => Date.now())
  const [readiness, setReadiness] = useState<ReadinessPayload | null>(null)
  const [health, setHealth] = useState<HealthPayload | null>(null)
  const [pairsTotal, setPairsTotal] = useState<number | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [measuredAt, setMeasuredAt] = useState(() => Date.now())

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [rRes, hRes, pRes] = await Promise.all([
          fetch('/api/runtime/readiness'),
          fetch('/api/indexer/health'),
          fetch('/api/indexer/pairs?page=1&pageSize=1'),
        ])
        if (!cancelled && rRes.ok) setReadiness((await rRes.json()) as ReadinessPayload)
        if (!cancelled && hRes.ok) setHealth((await hRes.json()) as HealthPayload)
        if (!cancelled && pRes.ok) {
          const json = (await pRes.json()) as { total?: number }
          setPairsTotal(typeof json.total === 'number' ? json.total : null)
        }
        if (!cancelled) setMeasuredAt(Date.now())
      } catch {
        /* display remains SSOT-based */
      }
    }
    void load()
    const poll = window.setInterval(load, 15000)
    return () => {
      cancelled = true
      window.clearInterval(poll)
    }
  }, [])

  const scoreResult = useMemo(() => computeMelegaScore(contracts, measuredAt), [contracts, measuredAt])
  const dimensions = useMemo(
    () =>
      buildDimensions({
        contracts,
        melegaScore: scoreResult.score,
        readinessVerdict: readiness?.verdict,
        healthStatus: health?.status,
        indexingLag: health?.indexingLag ?? readiness?.indexer?.indexingLag,
        storageConfigured: health?.storageConfigured ?? readiness?.indexer?.storageConfigured,
        pairsTotal,
      }),
    [contracts, scoreResult.score, readiness, health, pairsTotal],
  )
  const chainBoard = useMemo(
    () =>
      buildChainBoard(contracts, {
        chainHead: health?.chainHead ?? readiness?.indexer?.chainHead,
        indexingLag: health?.indexingLag ?? readiness?.indexer?.indexingLag,
        lastIndexedBlock: health?.lastIndexedBlock ?? readiness?.indexer?.lastIndexedBlock,
      }),
    [contracts, health, readiness],
  )

  const donutSegments = useMemo(() => {
    const live = contracts.filter((c) => c.live).length
    const prep = contracts.filter((c) => !c.live && c.chainStatus === 'PREPARING').length
    const other = Math.max(0, contracts.length - live - prep)
    return [
      { value: live || 0.001, color: ac.ok },
      { value: prep || 0.001, color: ac.warn },
      { value: other || 0.001, color: ac.mute2 },
    ]
  }, [contracts])

  const sparkFromScores = useMemo(() => {
    // Deterministic spark from contract score distribution — not a fabricated time series.
    const sorted = [...contracts].map((c) => c.score).sort((a, b) => a - b)
    if (sorted.length < 2) return []
    const step = Math.max(1, Math.floor(sorted.length / 8))
    return sorted.filter((_, i) => i % step === 0).slice(0, 8)
  }, [contracts])

  const heatCells = useMemo(() => {
    return contracts.slice(0, 28).map((c) => c.score / 100)
  }, [contracts])

  const timeline = useMemo(() => {
    const events: Array<{ label: string; detail: string; tone: LiveTone; when: string }> = []
    if (health?.lastSuccessfulSync) {
      events.push({
        label: 'Indexer synced',
        detail: health.phase ? `Phase · ${health.phase}` : 'Indexer health OK',
        tone: 'ok',
        when: health.lastSuccessfulSync,
      })
    }
    if (readiness?.verdict) {
      events.push({
        label: 'Readiness evaluated',
        detail: `Verdict · ${readiness.verdict}`,
        tone: liveTone(readiness.verdict, ['ready']),
        when: readiness.timestamp || '—',
      })
    }
    const certified = contracts.filter((c) => c.source.includes('Deployment') || c.source.includes('certified') || c.verified)
    certified.slice(0, 4).forEach((c) => {
      events.push({
        label: 'Contract verified (SSOT)',
        detail: `${c.name} · ${c.chainLabel}`,
        tone: 'ok',
        when: c.lastVerifiedLabel,
      })
    })
    chainBoard
      .filter((c) => c.status === 'LIVE')
      .forEach((c) => {
        events.push({
          label: 'Chain activated',
          detail: `${c.label} · ${c.contracts} contracts`,
          tone: 'ok',
          when: 'LIVE registry',
        })
      })
    return events.slice(0, 10)
  }, [health, readiness, contracts, chainBoard])

  const liveStatus: Array<{ id: string; tone: LiveTone; label: string }> = [
    { id: 'Frontend', tone: typeof document !== 'undefined' ? 'ok' : 'mute', label: 'Frontend' },
    {
      id: 'Indexer',
      tone: liveTone(health?.status, ['ok', 'ready']),
      label: 'Indexer',
    },
    {
      id: 'RPC',
      tone: health?.chainHead != null ? 'ok' : 'warn',
      label: 'RPC',
    },
    {
      id: 'Liquidity',
      tone: pairsTotal != null && pairsTotal > 0 ? 'ok' : 'warn',
      label: 'Liquidity',
    },
    {
      id: 'Price',
      tone: pairsTotal != null && pairsTotal > 0 ? 'ok' : 'mute',
      label: 'Price',
    },
    {
      id: 'Treasury',
      tone: contracts.some((c) => /treasury/i.test(c.name)) ? 'ok' : 'mute',
      label: 'Treasury',
    },
    {
      id: 'Swap',
      tone: contracts.some((c) => /router/i.test(c.name) && c.live) ? 'ok' : 'warn',
      label: 'Swap',
    },
    {
      id: 'Factory',
      tone: contracts.some((c) => /factory/i.test(c.name) && c.live) ? 'ok' : 'warn',
      label: 'Factory',
    },
    {
      id: 'Farm',
      tone: contracts.some((c) => /farm|master/i.test(c.name) && c.live) ? 'ok' : 'warn',
      label: 'Farm',
    },
    {
      id: 'Pool',
      tone: contracts.some((c) => /pool|smartchef/i.test(c.name)) ? 'ok' : 'mute',
      label: 'Pool',
    },
  ]

  const onCopy = useCallback(async (row: OfficialContractRow) => {
    try {
      await navigator.clipboard.writeText(row.address)
      setCopied(row.id)
      window.setTimeout(() => setCopied(null), 1400)
    } catch {
      /* ignore */
    }
  }, [])

  return (
    <Page data-testid="audit-center-v2" data-audit-page="v2">
      <Inner>
        <Band data-testid="audit-hero" style={{ borderColor: ac.goldLine }}>
          <Hero>
            <div>
              <LivePill>
                <Pulse /> LIVE SECURITY CENTER
              </LivePill>
              <HeroTitle>LIVE SECURITY CENTER</HeroTitle>
              <HeroLead>
                Real-time operational health of the Melega DEX infrastructure.
              </HeroLead>
              <Muted style={{ marginTop: 12 }}>
                Melega Score is calculated from official contract SSOTs — not entered manually.
              </Muted>
            </div>
            <ScoreWrap data-testid="audit-melega-score">
              <ScoreGauge value={scoreResult.score} />
              <ScoreValue>{scoreResult.score.toFixed(1)}</ScoreValue>
              <ScoreLabel>Melega Score</ScoreLabel>
              <Muted style={{ marginTop: 8, textAlign: 'center', maxWidth: 240 }}>
                Contract SSOT weighted mean. Runtime Readiness is a separate live API metric and does not
                change this score.
              </Muted>
              <Muted style={{ marginTop: 8, textAlign: 'center' }}>
                Last measured: {ago(scoreResult.measuredAt, now)}
              </Muted>
              <Muted style={{ textAlign: 'center', fontSize: 11 }}>
                {scoreResult.contractCount} contracts · Σw {scoreResult.totalWeight.toFixed(1)}
              </Muted>
            </ScoreWrap>
          </Hero>
        </Band>

        <Band data-testid="audit-formula">
          <BandHead>
            <BandTitle>Score formula</BandTitle>
            <BandMeta>transparent</BandMeta>
          </BandHead>
          <Formula>{scoreResult.formula}</Formula>
        </Band>

        <Band data-testid="audit-dimensions">
          <BandHead>
            <BandTitle>Indicators</BandTitle>
            <BandMeta>thermometer · trend</BandMeta>
          </BandHead>
          <DimGrid>
            {dimensions.map((d) => (
              <DimCard key={d.id} data-testid={`audit-dim-${d.id.toLowerCase()}`}>
                <DimName>{d.id === 'Runtime' ? 'Runtime Readiness' : d.id}</DimName>
                <DimValue $tone={d.tone}>{d.value == null ? '—' : d.value.toFixed(0)}</DimValue>
                <ThermometerBar value={d.value} tone={d.tone} />
                <Muted style={{ marginTop: 6, fontSize: 11 }}>
                  {d.detail}
                  {d.id === 'Runtime' ? ` · measured ${ago(measuredAt, now)}` : ` · Δ ${d.delta} · ${d.trend}`}
                </Muted>
              </DimCard>
            ))}
          </DimGrid>
        </Band>

        <Band data-testid="audit-visuals">
          <BandHead>
            <BandTitle>Visualizations</BandTitle>
            <BandMeta>gauge · donut · spark · heatmap</BandMeta>
          </BandHead>
          <VizRow>
            <div style={{ textAlign: 'center' }}>
              <DonutRing segments={donutSegments} />
              <Muted style={{ marginTop: 6, fontSize: 11 }}>Live / Preparing / Other</Muted>
            </div>
            <div>
              <BandMeta>Contract score distribution</BandMeta>
              <MiniSpark values={sparkFromScores} tone="ok" />
            </div>
            <div>
              <BandMeta>Coverage heatmap</BandMeta>
              <Heatmap cells={heatCells.length ? heatCells : Array(28).fill(0.08)} />
            </div>
          </VizRow>
        </Band>

        <Band data-testid="audit-live-status">
          <BandHead>
            <BandTitle>Live Status</BandTitle>
            <BandMeta>green · yellow · red</BandMeta>
          </BandHead>
          <LiveGrid>
            {liveStatus.map((s) => (
              <LiveCell key={s.id} $tone={s.tone} data-testid={`audit-live-${s.id.toLowerCase()}`}>
                <div style={{ fontSize: 12, fontWeight: 750 }}>{s.label}</div>
              </LiveCell>
            ))}
          </LiveGrid>
        </Band>

        <Band data-testid="audit-multichain">
          <BandHead>
            <BandTitle>Multichain</BandTitle>
            <BandMeta>score · block · lag · contracts</BandMeta>
          </BandHead>
          <ChainGrid>
            {chainBoard.map((c) => (
              <ChainCard key={c.chainId} data-testid={`audit-chain-${c.chainId}`}>
                <MelegaExploreChainBadge chainId={c.chainId} />
                <div style={{ marginTop: 6, fontWeight: 800 }}>{c.label}</div>
                <div style={{ fontSize: 20, fontWeight: 850, color: ac.gold, margin: '4px 0' }}>
                  {c.score == null ? '—' : c.score.toFixed(0)}
                </div>
                <Muted style={{ fontSize: 11 }}>
                  {c.status} · {c.contracts} ctr
                  {c.block != null ? ` · blk ${c.block}` : ''}
                  {c.lag != null ? ` · lag ${c.lag}` : ''}
                </Muted>
              </ChainCard>
            ))}
          </ChainGrid>
        </Band>

        <Band data-testid="audit-contracts">
          <BandHead>
            <BandTitle>Official Contracts</BandTitle>
            <BandMeta>{contracts.length} listed from SSOT</BandMeta>
          </BandHead>
          <ContractGrid>
            {contracts.map((c) => (
              <ContractCard key={c.id} data-testid={`audit-contract-${c.id}`}>
                <CardTop>
                  <div>
                    <CardName>{c.name}</CardName>
                    <Muted style={{ fontSize: 11 }}>{c.role}</Muted>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                    <Badge $tone={c.live ? 'ok' : 'warn'}>{c.live ? 'LIVE' : c.runtime}</Badge>
                    <span style={{ fontSize: 16, fontWeight: 850, color: ac.gold }}>
                      {c.score}
                      <span style={{ fontSize: 11, color: ac.mute2 }}>/100</span>
                    </span>
                  </div>
                </CardTop>
                <Mono title={c.address}>{shortAddr(c.address)}</Mono>
                <MetaRow>
                  <span>Chain · {c.chainLabel}</span>
                  <span>Verified · {c.verified ? 'YES' : '—'}</span>
                  <span>Runtime · {c.runtime}</span>
                  <span>Owner · {c.owner}</span>
                  <span>Upgrade · {c.upgradeability}</span>
                  <span>Proxy · {c.proxy == null ? '—' : c.proxy ? 'YES' : 'NO'}</span>
                  <span>Status · {c.chainStatus}</span>
                  <span>Read · {c.lastVerifiedLabel}</span>
                </MetaRow>
                <Actions>
                  <ActionBtn
                    href={getBlockExploreLink(c.address, 'address', c.chainId)}
                    target="_blank"
                    rel="noreferrer"
                    data-testid={`audit-explorer-${c.id}`}
                  >
                    Explorer
                  </ActionBtn>
                  <CopyBtn type="button" onClick={() => onCopy(c)} data-testid={`audit-copy-${c.id}`}>
                    {copied === c.id ? 'Copied' : 'Copy'}
                  </CopyBtn>
                </Actions>
              </ContractCard>
            ))}
          </ContractGrid>
        </Band>

        <Band data-testid="audit-timeline">
          <BandHead>
            <BandTitle>Timeline</BandTitle>
            <BandMeta>latest operational events</BandMeta>
          </BandHead>
          <Timeline>
            {timeline.map((e, i) => (
              <TimelineItem key={`${e.label}-${i}`}>
                <Dot $tone={e.tone} />
                <div>
                  <div style={{ fontWeight: 750, color: '#fff' }}>{e.label}</div>
                  <Muted style={{ fontSize: 11 }}>{e.detail}</Muted>
                </div>
                <Muted style={{ fontSize: 10 }}>{e.when}</Muted>
              </TimelineItem>
            ))}
          </Timeline>
        </Band>

        <Band>
          <Muted style={{ fontSize: 12 }}>
            Operational Mission Control — not a formal third-party smart-contract audit. Formal audit
            publication remains Not available (not fabricated).
          </Muted>
        </Band>
      </Inner>
    </Page>
  )
}

export default AuditCenterV2
