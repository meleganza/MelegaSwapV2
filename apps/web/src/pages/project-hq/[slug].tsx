import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { NotFound } from '@pancakeswap/uikit'
import { CHAIN_IDS } from 'utils/wagmi'
import {
  buildProjectJsonLd,
  buildProjectMarketsDocument,
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
import ProjectIdentityShell from 'views/ProjectPage/ProjectIdentityShell'

interface ProjectHqPageProps {
  document: CanonicalProjectDocument | null
  evidencePack: ProjectEvidencePack | null
  readinessDocument: ProjectReadinessDocument | null
  marketsDocument: ProjectMarketsDocument | null
  jsonLd: Record<string, unknown> | null
  requestedSlug: string | null
}

/** Rendered by `_app-full` via `Component.Meta` so tags enter the static HTML head. */
const ProjectHqMeta = ({ document, jsonLd, requestedSlug }: ProjectHqPageProps) => {
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
  jsonLd,
}: ProjectHqPageProps) => {
  if (!document || !jsonLd || !evidencePack || !readinessDocument || !marketsDocument) {
    return <NotFound />
  }

  return (
    <ProjectIdentityShell
      document={document}
      evidencePack={evidencePack}
      readinessDocument={readinessDocument}
      marketsDocument={marketsDocument}
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
    return { notFound: true }
  }
  const loaded = loadProjectEvidencePack(requestedSlug, { generatedAt })
  if (!loaded) {
    return { notFound: true }
  }

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

  return {
    props: {
      document: loaded.document,
      evidencePack: loaded.evidencePack,
      readinessDocument,
      marketsDocument,
      jsonLd: buildProjectJsonLd(loaded.document),
      requestedSlug,
    },
  }
}

ProjectHqPage.chains = CHAIN_IDS
ProjectHqPage.Meta = ProjectHqMeta

export default ProjectHqPage
