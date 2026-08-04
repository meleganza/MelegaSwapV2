/**
 * Canonical project routing alias:
 *   /project/{slug}  →  /@{slug}/
 *   /project/0x…     →  resolve by contract → /@{slug}/ when claimed
 *                      → temporary address page when unclaimed
 */
import React, { useEffect, useMemo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { CHAIN_IDS } from 'utils/wagmi'
import {
  canonicalProjectPath,
  normalizeProjectSlugInput,
  resolveProjectByContractAddress,
  resolveProjectBySlug,
} from 'registry/projects/identity'
import { MelegaExploreChainBadge } from 'components/Logo/MelegaExploreChainBadge'
import { CLAIM_PROJECT_HREF } from 'views/ProjectsStudio/components/ProjectsStudioPageHeader'

const Page = styled.main`
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 20px 80px;
  color: #f5f5f5;
`

const Title = styled.h1`
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 800;
`

const Muted = styled.p`
  margin: 0 0 20px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 14px;
  line-height: 1.5;
`

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
`

const Btn = styled.a<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 16px;
  border-radius: 10px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 750;
  border: 1px solid ${({ $primary }) => ($primary ? 'rgba(244,196,48,0.55)' : 'rgba(255,255,255,0.12)')};
  background: ${({ $primary }) =>
    $primary ? 'linear-gradient(180deg, #f2c84c 0%, #d4a017 100%)' : 'rgba(255,255,255,0.04)'};
  color: ${({ $primary }) => ($primary ? '#111' : '#f5f5f5')};
`

const Code = styled.code`
  font-size: 12px;
  word-break: break-all;
  color: #f2c84c;
`

function isEvmAddress(raw: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(raw)
}

const ProjectAliasPage: React.FC = () => {
  const router = useRouter()
  const raw = typeof router.query.slug === 'string' ? router.query.slug : ''

  const resolution = useMemo(() => {
    if (!raw) return { kind: 'loading' as const }
    if (isEvmAddress(raw)) {
      const byAddr = resolveProjectByContractAddress(raw)
      if (byAddr) {
        return {
          kind: 'redirect' as const,
          href: canonicalProjectPath(byAddr.slug),
        }
      }
      return {
        kind: 'address' as const,
        address: raw.toLowerCase(),
        chainId: 56,
      }
    }
    const slug = normalizeProjectSlugInput(raw) ?? raw.trim().toLowerCase()
    const bySlug = resolveProjectBySlug(slug)
    if (bySlug.ok) {
      return { kind: 'redirect' as const, href: canonicalProjectPath(bySlug.slug) }
    }
    return { kind: 'missing' as const, slug }
  }, [raw])

  useEffect(() => {
    if (resolution.kind === 'redirect') {
      void router.replace(resolution.href)
    }
  }, [resolution, router])

  if (resolution.kind === 'redirect' || resolution.kind === 'loading') {
    return (
      <Page data-testid="project-alias-resolving">
        <Head>
          <title>Opening project · Melega DEX</title>
        </Head>
        <Muted>Opening project page…</Muted>
      </Page>
    )
  }

  if (resolution.kind === 'address') {
    const tradeHref = `/swap?outputCurrency=${resolution.address}`
    const claimHref = `${CLAIM_PROJECT_HREF}&contract=${encodeURIComponent(resolution.address)}`
    return (
      <Page data-testid="project-address-temporary" data-project-routing="address-temporary">
        <Head>
          <title>Unclaimed token · Melega DEX</title>
        </Head>
        <Row style={{ marginBottom: 12 }}>
          <MelegaExploreChainBadge chainId={resolution.chainId} compact={false} />
        </Row>
        <Title>Temporary project page</Title>
        <Muted>
          This token is not claimed yet. Trade is available by contract. Claim ownership to unlock a permanent{' '}
          <strong>/@handle</strong> project page with logo, description, and socials.
        </Muted>
        <Muted>
          Contract: <Code>{resolution.address}</Code>
        </Muted>
        <Row>
          <Btn $primary href={tradeHref} data-testid="project-address-trade">
            Trade
          </Btn>
          <Btn href={claimHref} data-testid="project-address-claim">
            Claim Project
          </Btn>
          <Btn href="/projects">Back to Projects</Btn>
        </Row>
      </Page>
    )
  }

  return (
    <Page data-testid="project-alias-missing">
      <Head>
        <title>Project not found · Melega DEX</title>
      </Head>
      <Title>Project not found</Title>
      <Muted>
        No project matches <Code>{resolution.slug}</Code>. Browse the directory or claim a token you own.
      </Muted>
      <Row>
        <Btn $primary href="/projects">
          Projects
        </Btn>
        <Btn href={CLAIM_PROJECT_HREF}>Claim Project</Btn>
      </Row>
    </Page>
  )
}

;(ProjectAliasPage as unknown as { chains: number[] }).chains = CHAIN_IDS

export default ProjectAliasPage
