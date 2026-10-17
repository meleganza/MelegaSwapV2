import React from 'react'
import { commercialTool } from '../../lib/tools'
import { ExternalService } from './ExternalService'

export default function PremiumProject() {
  const tool = commercialTool('premium-project')
  return <ExternalService title={tool.label} detail={tool.detail} href={tool.href} />
}