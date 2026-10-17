import React from 'react'
import { commercialTool } from '../../lib/tools'
import { ExternalService } from './ExternalService'

export default function FeaturedProject() {
  const tool = commercialTool('featured-project')
  return <ExternalService title={tool.label} detail={tool.detail} href={tool.href} />
}
