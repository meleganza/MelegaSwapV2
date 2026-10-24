import React from 'react'
import dynamic from 'next/dynamic'
import type { GetServerSideProps } from 'next'
import { BetaShell } from '../../components/BetaShell'
import { isCommercialTool, type CommercialToolId } from '../../lib/tools'

const CreateToken = dynamic(() => import('../../modules/tools/CreateToken'))
const TrendBoost = dynamic(() => import('../../modules/tools/TrendBoost'))
const FeaturedProject = dynamic(() => import('../../modules/tools/FeaturedProject'))
const PremiumProject = dynamic(() => import('../../modules/tools/PremiumProject'))

const LOADERS = {
  'create-token': CreateToken,
  'trend-boost': TrendBoost,
  'featured-project': FeaturedProject,
  'premium-project': PremiumProject,
} as const

export default function ToolRoute({ tool }: { tool: CommercialToolId }) {
  const Body = LOADERS[tool]
  return (
    <BetaShell section="tools">
      <Body />
    </BetaShell>
  )
}

export const getServerSideProps: GetServerSideProps<{ tool: CommercialToolId }> = async ({ params, res }) => {
  res.setHeader('Cache-Control', 'private, no-store')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet')
  res.setHeader('X-Melega-Surface', 'next-gen-beta')
  const tool = params?.tool
  if (typeof tool !== 'string' || !isCommercialTool(tool)) return { notFound: true }
  return { props: { tool } }
}
