import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { NotFound } from '@pancakeswap/uikit'
import { CHAIN_IDS } from 'utils/wagmi'
import {
  buildProjectJsonLd,
  buildProjectMarketsDocument,
  buildProjectParticipationDocument,
  buildProjectReadinessDocument,
  canonicalProjectAbsoluteUrl,
  canonicalProjectPath,
  getAllResolvableProjectSlugs,
  loadProjectEvidencePack,
  normalizeProjectSlugInput,
  resolveProjectBySlug,
} from 'registry/projects/identity'
import type { CanonicalProjectDocument } from 'registry/projects/identity/types'
import type { ProjectEvidencePack } from 'registry/projects/identity/evidence/types'
import type { ProjectReadinessDocument } from 'registry/projects/identity/readiness/types'
import type { ProjectMarketsDocument } from 'registry/projects/identity/markets'
import type { ProjectParticipationDocument } from 'registry/projects/identity/participation'
import { buildProjectTokenomicsDocument } from 'registry/projects/identity/tokenomics/buildProjectTokenomicsDocument'
import { buildProjectRoadmapDocument } from 'registry/projects/identity/roadmap/buildProjectRoadmapDocument'
import type { ProjectTokenomicsDocument } from 'registry/projects/identity/tokenomics/schema'
import type { ProjectRoadmapDocument } from 'registry/projects/identity/roadmap/schema'
import ProjectPageV7Shell from 'views/ProjectPage/v7/ProjectPageV7Shell'
import { buildUnclaimedMarketsDocument, type UnclaimedTokenIdentity } from 'views/ProjectPage/v7/unclaimedIdentity'
import { getProjectClaimBySlug, toPublicProjectClaim, type PublicProjectClaim } from 'lib/project-claims'

interface ProjectHqPageProps {
  document: CanonicalProjectDocument | null
  evidencePack: ProjectEvidencePack | null
  readinessDocument: ProjectReadinessDocument | null
  marketsDocument: ProjectMarketsDocument | null
  participationDocument: ProjectParticipationDocument | null
  tokenomicsDocument: ProjectTokenomicsDocument | null
  roadmapDocument: ProjectRoadmapDocument | null
  jsonLd: Record<string, unknown> | null
  requestedSlug: string | null
  runtimeClaim: PublicProjectClaim | null
}

/** Rendered by `_app-full` via `Component.Meta` so tags enter the static HTML head. */
const ProjectHqMeta = ({ document, jsonLd, requestedSlug, runtimeClaim }: ProjectHqPageProps) => {
  if (runtimeClaim) {
    const canonicalAbs = `https://www.melega.finance/@${runtimeClaim.slug}/`
    const title = `${runtimeClaim.metadata.name} | Melega DEX Project`
    return (
      <Head>
        <title>{title}</title>
        <meta name="description" content={runtimeClaim.metadata.description} />
        <link rel="canonical" href={canonicalAbs} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={runtimeClaim.metadata.description} />
        <meta property="og:url" content={canonicalAbs} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Melega DEX" />
        {runtimeClaim.metadata.logo ? <meta property="og:image" content={runtimeClaim.metadata.logo} /> : null}
        <meta name="twitter:card" content="summary" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>
    )
  }
  if (!document || !jsonLd) return null

  const canonicalAbs = canonicalProjectAbsoluteUrl(document.slug)
  const title = `${document.identity.displayName} | Melega DEX Project`
  const description =
    document.identity.shortPurpose.meta.availability === 'AVAILABLE' && document.identity.shortPurpose.value
      ? document.identity.shortPurpose.value
      : `${document.identity.displayName} project identity on Melega DEX.`
  const jsonAlternate = `/api/public/projects/${document.slug}/`
  const evidenceAlternate = `/api/public/projects/${document.slug}/evidence/`
  const readinessAlternate = `/api/public/projects/${document.slug}/readiness/`
  const marketsAlternate = `/api/public/projects/${document.slug}/markets/`
  const participationAlternate = `/api/public/projects/${document.slug}/participation/`
  const liquidityBuildingAlternate = `/api/public/projects/${document.slug}/liquidity-building/`
  const updatesAlternate = `/api/public/projects/${document.slug}/updates/`
  const ecosystemAlternate = `/api/public/projects/${document.slug}/ecosystem/`
  const developerAlternate = `/api/public/projects/${document.slug}/developer/`
  const governanceAlternate = `/api/public/projects/${document.slug}/governance/`
  const controlCenterAlternate = `/api/public/projects/${document.slug}/control-center/`
  const growthAlternate = `/api/public/projects/${document.slug}/growth/`
  const machineAlternate = `/api/public/projects/${document.slug}/machine/`
  const isAliasView = Boolean(requestedSlug && requestedSlug !== document.slug)

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalAbs} />
      <link rel="alternate" type="application/json" href={jsonAlternate} />
      <link rel="alternate" type="application/json" href={evidenceAlternate} title="Project evidence" />
      <link rel="alternate" type="application/json" href={readinessAlternate} title="Project readiness" />
      <link rel="alternate" type="application/json" href={marketsAlternate} title="Project markets" />
      <link rel="alternate" type="application/json" href={participationAlternate} title="Project participation" />
      <link
        rel="alternate"
        type="application/json"
        href={liquidityBuildingAlternate}
        title="Project liquidity building"
      />
      <link rel="alternate" type="application/json" href={updatesAlternate} title="Project updates" />
      <link rel="alternate" type="application/json" href={ecosystemAlternate} title="Project ecosystem" />
      <link rel="alternate" type="application/json" href={developerAlternate} title="Project developer" />
      <link rel="alternate" type="application/json" href={governanceAlternate} title="Project governance" />
      <link
        rel="alternate"
        type="application/json"
        href={controlCenterAlternate}
        title="Project control center (public claim)"
      />
      <link rel="alternate" type="application/json" href={growthAlternate} title="Project growth" />
      <link rel="alternate" type="application/json" href={machineAlternate} title="Project machine interface" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalAbs} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Melega DEX" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:site" content="@meleganews" />
      {isAliasView ? <meta name="robots" content="noindex,follow" /> : null}
      <script
        type="application/ld+json"
        // Generated from sanitized registry fields only (JSON.stringify escapes injection).
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </Head>
  )
}

const ProjectHqPage = ({
  document,
  evidencePack,
  readinessDocument,
  marketsDocument,
  participationDocument,
  tokenomicsDocument,
  roadmapDocument,
  jsonLd,
  runtimeClaim,
}: ProjectHqPageProps) => {
  if (runtimeClaim) {
    const identity: UnclaimedTokenIdentity = {
      chainId: runtimeClaim.chainId,
      address: runtimeClaim.contract,
      symbol: runtimeClaim.metadata.symbol,
      name: runtimeClaim.metadata.name,
      logoUrl: runtimeClaim.metadata.logo || undefined,
      decimals: 18,
      syntheticSlug: runtimeClaim.slug,
    }
    return (
      <ProjectPageV7Shell
        mode="unclaimed"
        unclaimed={identity}
        claimedProfile={runtimeClaim.metadata}
        marketsDocument={buildUnclaimedMarketsDocument(identity)}
      />
    )
  }
  // Shell-critical docs only — technical packs deferred / optional for V7 public flow.
  if (!document || !jsonLd || !marketsDocument || !participationDocument) {
    return <NotFound />
  }

  return (
    <ProjectPageV7Shell
      mode="claimed"
      document={document}
      marketsDocument={marketsDocument}
      participationDocument={participationDocument}
      evidencePack={evidencePack}
      readinessDocument={readinessDocument}
      tokenomicsDocument={tokenomicsDocument}
      roadmapDocument={roadmapDocument}
    />
  )
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: getAllResolvableProjectSlugs().map((slug) => ({ params: { slug } })),
  // Blocking fallback enables case-normalization redirects for unlisted casings.
  fallback: 'blocking',
})

export const getStaticProps: GetStaticProps<ProjectHqPageProps> = async ({ params }) => {
  const rawParam = typeof params?.slug === 'string' ? params.slug : ''
  const requestedSlug = normalizeProjectSlugInput(rawParam)
  if (!requestedSlug) {
    return { notFound: true }
  }

  // Deterministic lowercase URL — reject mixed-case path variants via permanent redirect.
  if (rawParam !== requestedSlug) {
    return {
      redirect: {
        destination: canonicalProjectPath(requestedSlug),
        permanent: true,
      },
    }
  }

  const generatedAt = new Date().toISOString()
  const resolved = resolveProjectBySlug(requestedSlug)
  if (!resolved.ok) {
    const storedClaim = await getProjectClaimBySlug(requestedSlug)
    const runtimeClaim = storedClaim ? toPublicProjectClaim(storedClaim) : null
    if (!runtimeClaim) return { notFound: true }
    return {
      props: {
        document: null,
        evidencePack: null,
        readinessDocument: null,
        marketsDocument: null,
        participationDocument: null,
        tokenomicsDocument: null,
        roadmapDocument: null,
        runtimeClaim,
        requestedSlug,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: runtimeClaim.metadata.name,
          description: runtimeClaim.metadata.description,
          url: `https://www.melega.finance/@${runtimeClaim.slug}/`,
          identifier: runtimeClaim.contract,
        },
      },
      revalidate: 30,
    }
  }
  const loaded = loadProjectEvidencePack(requestedSlug, { generatedAt })
  if (!loaded) {
    return { notFound: true }
  }

  // Slim first-paint payload: identity + markets + participation + readiness.
  // Developer / machine / governance / ecosystem docs are no longer serialized
  // into pageProps (they bloated soft-nav and caused multi-second stalls).
  const readinessDocument = buildProjectReadinessDocument({
    project: resolved.project,
    document: loaded.document,
    evidencePack: loaded.evidencePack,
    generatedAt,
  })

  const marketsDocument = buildProjectMarketsDocument({
    project: resolved.project,
    document: loaded.document,
    context: { generatedAt },
  })

  const participationDocument = buildProjectParticipationDocument({
    project: resolved.project,
    document: loaded.document,
    generatedAt,
  })

  const tokenomicsDocument = buildProjectTokenomicsDocument(requestedSlug, generatedAt)
  const roadmapDocument = buildProjectRoadmapDocument(requestedSlug, generatedAt)

  return {
    props: {
      document: loaded.document,
      evidencePack: loaded.evidencePack,
      readinessDocument,
      marketsDocument,
      participationDocument,
      tokenomicsDocument,
      roadmapDocument,
      jsonLd: buildProjectJsonLd(loaded.document),
      requestedSlug,
      runtimeClaim: null,
    },
    // ISR keeps cold blocking fallbacks from rebuilding the full graph on every miss forever.
    revalidate: 120,
  }
}

ProjectHqPage.chains = CHAIN_IDS
ProjectHqPage.Meta = ProjectHqMeta

export default ProjectHqPage
