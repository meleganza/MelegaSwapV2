import { GetStaticPaths, GetStaticProps } from 'next'
import { NotFound } from '@pancakeswap/uikit'
import { CHAIN_IDS } from 'utils/wagmi'
import { getAllProjectSlugs, getProjectBySlug } from 'registry/projects/getProjectBySlug'
import { serializeProjectManifest } from 'registry/projects/intelligence'
import { StaticProjectRecord } from 'registry/projects/types'
import ProjectDetail from 'views/Projects/ProjectDetail'

interface ProjectPageProps {
  project: StaticProjectRecord | null
  manifest: Record<string, unknown> | null
}

const ProjectPage = ({ project, manifest }: ProjectPageProps) => {
  if (!project || !manifest) {
    return <NotFound />
  }

  return <ProjectDetail project={project} manifest={manifest} />
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: getAllProjectSlugs().map((slug) => ({ params: { slug } })),
  fallback: false,
})

export const getStaticProps: GetStaticProps<ProjectPageProps> = async ({ params }) => {
  const slug = params?.slug as string
  const project = getProjectBySlug(slug) ?? null

  if (!project) {
    return { notFound: true }
  }

  return {
    props: {
      project,
      manifest: serializeProjectManifest(project),
    },
  }
}

ProjectPage.chains = CHAIN_IDS

export default ProjectPage
