import React from 'react'
import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { NotFound } from '@pancakeswap/uikit'
import { CHAIN_IDS } from 'utils/wagmi'
import {
  canonicalProjectAbsoluteUrl,
  canonicalProjectPath,
  getAllResolvableProjectSlugs,
  normalizeProjectSlugInput,
  resolveProjectBySlug,
} from 'registry/projects/identity'

const ProjectControlCenter = dynamic(() => import('views/ProjectPage/ProjectControlCenter'), {
  ssr: false,
}) as React.ComponentType<{ slug: string }>

interface Props {
  slug: string | null
  displayName: string | null
}

const ManageMeta = ({ slug, displayName }: Props) => {
  if (!slug || !displayName) return null
  return (
    <Head>
      <title>{`Manage ${displayName} | Melega DEX`}</title>
      <meta name="robots" content="noindex,nofollow" />
      <link rel="canonical" href={`${canonicalProjectAbsoluteUrl(slug)}/manage`} />
    </Head>
  )
}

const ManagePage = ({ slug, displayName }: Props) => {
  if (!slug || !displayName) return <NotFound />
  return <ProjectControlCenter slug={slug} />
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: getAllResolvableProjectSlugs().map((slug) => ({ params: { slug } })),
  fallback: 'blocking',
})

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const rawParam = typeof params?.slug === 'string' ? params.slug : ''
  const requestedSlug = normalizeProjectSlugInput(rawParam)
  if (!requestedSlug) return { notFound: true }
  if (rawParam !== requestedSlug) {
    return {
      redirect: {
        destination: `${canonicalProjectPath(requestedSlug)}/manage`,
        permanent: true,
      },
    }
  }
  const resolved = resolveProjectBySlug(requestedSlug)
  if (!resolved.ok) return { notFound: true }
  return {
    props: {
      slug: resolved.slug,
      displayName: resolved.project.displayName,
    },
  }
}

ManagePage.chains = CHAIN_IDS
ManagePage.Meta = ManageMeta

export default ManagePage
