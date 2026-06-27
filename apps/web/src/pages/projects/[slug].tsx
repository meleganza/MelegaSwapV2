import { GetStaticPaths, GetStaticProps } from 'next'
import { NotFound } from '@pancakeswap/uikit'
import { CHAIN_IDS } from 'utils/wagmi'
import { getAllProjectSlugs, getProjectBySlug } from 'registry/projects/getProjectBySlug'
import { StaticProjectRecord } from 'registry/projects/types'
import ProjectDetail from 'views/Projects/ProjectDetail'

interface ProjectPageProps {
  project: StaticProjectRecord | null
}

const ProjectPage = ({ project }: ProjectPageProps) => {
  if (!project) {
    return <NotFound />
  }

  return <ProjectDetail project={project} />
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
    props: { project },
  }
}

ProjectPage.chains = CHAIN_IDS

export default ProjectPage
