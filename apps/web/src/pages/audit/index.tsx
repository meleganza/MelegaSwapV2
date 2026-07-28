/**
 * LIVE AI-AUDIT / operational telemetry — not a formal smart-contract audit.
 */
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { CHAIN_IDS } from 'utils/wagmi'
import {
  MELEGA_CHAIN_ID,
  MELEGA_FACTORY_BSC,
  MELEGA_ROUTER_BSC,
  MELEGA_MASTERCHEF_BSC,
  MELEGA_VAULT_BSC,
} from 'lib/bsc-indexer/constants'
import {
  uxRebuildColors,
  uxRebuildFont,
  uxRebuildLayout,
  uxRebuildRadius,
} from 'design-system/melega/tokens/uxRebuild'

type ReadinessPayload = {
  timestamp?: string
  verdict?: string
  components?: Record<string, string>
  indexer?: {
    storageBackend?: string
    storageConfigured?: boolean
    lastIndexedBlock?: number
    chainHead?: number
    indexingLag?: number
    lastSuccessfulSync?: string
    lastFailureReason?: string
    registryPairCount?: number
    phase?: string
    indexerGeneration?: string
  }
  checks?: Array<{ name: string; configured: boolean; status: string; reason?: string }>
}

type HealthPayload = {
  status?: string
  lastIndexedBlock?: number
  chainHead?: number
  indexingLag?: number
  storageBackend?: string
  storageConfigured?: boolean
  lastSuccessfulSync?: string
  lastFailureReason?: string
  activeDeploymentSha?: string | null
  providerUsed?: string
  phase?: string
}

type PairsPayload = {
  status?: string
  total?: number
}

const NA = 'Not available'

const CONTRACTS = [
  { label: 'Factory', address: MELEGA_FACTORY_BSC },
  { label: 'Router', address: MELEGA_ROUTER_BSC },
  { label: 'MasterBuilder / MasterChef', address: MELEGA_MASTERCHEF_BSC },
  { label: 'Vault', address: MELEGA_VAULT_BSC },
] as const

function explorerAddress(address: string) {
  return `https://bscscan.com/address/${address}`
}

function shortSha(sha?: string | null) {
  if (!sha || sha === 'unknown') return null
  return sha.length > 12 ? `${sha.slice(0, 7)}…` : sha
}

const Root = styled.div`
  min-height: 70vh;
  color: ${uxRebuildColors.text};
  font-family: ${uxRebuildFont};
  background: ${uxRebuildColors.pageBg};
  padding: 40px 24px 64px;
`

const Inner = styled.div`
  max-width: 900px;
  margin: 0 auto;
`

const H1 = styled.h1`
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
`

const Lead = styled.p`
  margin: 0 0 10px;
  color: ${uxRebuildColors.bodySoft};
  line-height: 1.55;
`

const Disclaimer = styled.p`
  margin: 0 0 24px;
  padding: 12px 14px;
  border-radius: ${uxRebuildRadius.control};
  border: 1px solid rgba(221, 185, 47, 0.28);
  background: ${uxRebuildColors.goldDarkSurface};
  color: ${uxRebuildColors.gold};
  font-size: 13px;
  line-height: 1.5;
`

const Card = styled.section`
  margin-bottom: 12px;
  padding: 18px;
  border-radius: ${uxRebuildRadius.card};
  background: ${uxRebuildColors.card};
  border: 1px solid ${uxRebuildColors.border};
`

const CardTitle = styled.h2`
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 750;
  color: ${uxRebuildColors.text};
`

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 13px;
  padding: 8px 0;
  border-bottom: 1px solid ${uxRebuildColors.divider};

  &:last-child {
    border-bottom: none;
  }
`

const Label = styled.span`
  color: ${uxRebuildColors.muted};
`

const Value = styled.span`
  font-weight: 600;
  text-align: right;
  color: ${uxRebuildColors.secondary};
  word-break: break-all;
`

const Mono = styled.code`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  color: ${uxRebuildColors.text};
`

const Ext = styled.a`
  color: ${uxRebuildColors.gold};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const List = styled.ul`
  margin: 0;
  padding-left: 18px;
  color: ${uxRebuildColors.secondary};
  font-size: 13px;
  line-height: 1.55;
`

const AuditPage: React.FC = () => {
  const [readiness, setReadiness] = useState<ReadinessPayload | null>(null)
  const [health, setHealth] = useState<HealthPayload | null>(null)
  const [pairsTotal, setPairsTotal] = useState<number | null>(null)
  const [fetchErrors, setFetchErrors] = useState<string[]>([])
  const [integrity, setIntegrity] = useState<Record<string, string>>({})

  useEffect(() => {
    let cancelled = false
    const errors: string[] = []

    const load = async () => {
      try {
        const res = await fetch('/api/runtime/readiness')
        if (!res.ok) throw new Error(`readiness HTTP ${res.status}`)
        const json = (await res.json()) as ReadinessPayload
        if (!cancelled) setReadiness(json)
      } catch (e) {
        errors.push(e instanceof Error ? e.message : 'readiness fetch failed')
      }

      try {
        const res = await fetch('/api/indexer/health')
        if (!res.ok) throw new Error(`indexer health HTTP ${res.status}`)
        const json = (await res.json()) as HealthPayload
        if (!cancelled) setHealth(json)
      } catch (e) {
        errors.push(e instanceof Error ? e.message : 'indexer health fetch failed')
      }

      try {
        const res = await fetch('/api/indexer/pairs?page=1&pageSize=1')
        if (!res.ok) throw new Error(`indexer pairs HTTP ${res.status}`)
        const json = (await res.json()) as PairsPayload
        if (!cancelled) setPairsTotal(typeof json.total === 'number' ? json.total : null)
      } catch (e) {
        errors.push(e instanceof Error ? e.message : 'indexer pairs fetch failed')
      }

      if (!cancelled) setFetchErrors(errors)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const checks: Record<string, string> = {}
    checks['Document ready state'] = typeof document !== 'undefined' ? document.readyState : NA
    checks['Page protocol'] = typeof window !== 'undefined' ? window.location.protocol : NA
    checks['Factory constant present'] = /^0x[a-fA-F0-9]{40}$/.test(MELEGA_FACTORY_BSC) ? 'Pass' : 'Fail'
    checks['Router constant present'] = /^0x[a-fA-F0-9]{40}$/.test(MELEGA_ROUTER_BSC) ? 'Pass' : 'Fail'
    checks['Client HTTPS preference'] =
      typeof window !== 'undefined' && window.location.protocol === 'https:'
        ? 'HTTPS'
        : typeof window !== 'undefined'
          ? window.location.protocol
          : NA
    setIntegrity(checks)
  }, [])

  const frontendBuild = useMemo(() => {
    const fromEnv =
      (typeof process !== 'undefined' &&
        (process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF)) ||
      null
    const fromHealth = shortSha(health?.activeDeploymentSha)
    if (fromEnv) return shortSha(String(fromEnv)) ?? String(fromEnv)
    if (fromHealth) return fromHealth
    return NA
  }, [health?.activeDeploymentSha])

  const lastIndexed =
    health?.lastIndexedBlock ?? readiness?.indexer?.lastIndexedBlock
  const chainHead = health?.chainHead ?? readiness?.indexer?.chainHead
  const lag = health?.indexingLag ?? readiness?.indexer?.indexingLag
  const runtimeStatus = health?.status ?? readiness?.verdict ?? NA
  const dataSourceHealth =
    health?.storageConfigured === false || readiness?.indexer?.storageConfigured === false
      ? 'Storage not configured'
      : health?.status || readiness?.verdict || NA

  const unavailableMetrics = [
    'Formal audit score — not published',
    'External auditor attestation — not published',
    'Security Score — not fabricated',
    ...(fetchErrors.length ? fetchErrors.map((e) => `Live fetch: ${e}`) : []),
    pairsTotal == null && fetchErrors.some((e) => e.includes('pairs'))
      ? 'Indexed markets count — unavailable'
      : null,
  ].filter(Boolean) as string[]

  return (
    <Root data-melega-audit-page data-testid="melega-live-ai-audit">
      <PageMeta title="Audit / Telemetry" />
      <Inner>
        <H1>LIVE AI-AUDIT</H1>
        <Lead>
          Operational telemetry for Melega DEX frontend, indexer, and published contract addresses on BSC (chain id{' '}
          {MELEGA_CHAIN_ID}).
        </Lead>
        <Disclaimer>
          This page is operational telemetry for transparency. It is <strong>not</strong> a substitute for an external
          smart-contract audit. Formal audit: <strong>Not published</strong>. No audit scores are fabricated here.
        </Disclaimer>

        <Card>
          <CardTitle>Runtime snapshot</CardTitle>
          <Row>
            <Label>Frontend build / version</Label>
            <Value>{frontendBuild}</Value>
          </Row>
          <Row>
            <Label>Network</Label>
            <Value>BSC {MELEGA_CHAIN_ID}</Value>
          </Row>
          <Row>
            <Label>Runtime status</Label>
            <Value>{String(runtimeStatus)}</Value>
          </Row>
          <Row>
            <Label>Data-source health</Label>
            <Value>{String(dataSourceHealth)}</Value>
          </Row>
          <Row>
            <Label>Indexed markets (Factory registry)</Label>
            <Value>{pairsTotal != null ? String(pairsTotal) : NA}</Value>
          </Row>
          <Row>
            <Label>Last indexed block</Label>
            <Value>{lastIndexed != null ? String(lastIndexed) : NA}</Value>
          </Row>
          <Row>
            <Label>Chain head</Label>
            <Value>{chainHead != null ? String(chainHead) : NA}</Value>
          </Row>
          <Row>
            <Label>Indexing lag (blocks)</Label>
            <Value>{lag != null ? String(lag) : NA}</Value>
          </Row>
          <Row>
            <Label>Indexer generation / phase</Label>
            <Value>
              {[health?.phase || readiness?.indexer?.phase, readiness?.indexer?.indexerGeneration]
                .filter(Boolean)
                .join(' · ') || NA}
            </Value>
          </Row>
          <Row>
            <Label>Last successful sync</Label>
            <Value>
              {health?.lastSuccessfulSync || readiness?.indexer?.lastSuccessfulSync || NA}
            </Value>
          </Row>
          <Row>
            <Label>Readiness verdict</Label>
            <Value>{readiness?.verdict ?? NA}</Value>
          </Row>
          <Row>
            <Label>Readiness timestamp</Label>
            <Value>{readiness?.timestamp ?? NA}</Value>
          </Row>
        </Card>

        <Card>
          <CardTitle>Core contracts (from indexer constants)</CardTitle>
          {CONTRACTS.map((c) => (
            <Row key={c.label}>
              <Label>{c.label}</Label>
              <Value>
                <Mono>{c.address}</Mono>
                {' · '}
                <Ext href={explorerAddress(c.address)} target="_blank" rel="noopener noreferrer">
                  BscScan
                </Ext>
              </Value>
            </Row>
          ))}
        </Card>

        <Card>
          <CardTitle>Readiness components</CardTitle>
          {readiness?.components ? (
            Object.entries(readiness.components).map(([key, status]) => (
              <Row key={key}>
                <Label>{key}</Label>
                <Value>{status}</Value>
              </Row>
            ))
          ) : (
            <Row>
              <Label>Components</Label>
              <Value>{NA}</Value>
            </Row>
          )}
        </Card>

        <Card>
          <CardTitle>Formal audit</CardTitle>
          <Row>
            <Label>Published external audit</Label>
            <Value>Not published</Value>
          </Row>
          <Row>
            <Label>Audit score</Label>
            <Value>Not available (not fabricated)</Value>
          </Row>
        </Card>

        <Card>
          <CardTitle>Known unavailable metrics</CardTitle>
          <List>
            {unavailableMetrics.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </List>
        </Card>

        <Card>
          <CardTitle>Client integrity checks</CardTitle>
          {Object.entries(integrity).map(([key, value]) => (
            <Row key={key}>
              <Label>{key}</Label>
              <Value>{value}</Value>
            </Row>
          ))}
        </Card>
      </Inner>
    </Root>
  )
}

AuditPage.chains = CHAIN_IDS

export default AuditPage
