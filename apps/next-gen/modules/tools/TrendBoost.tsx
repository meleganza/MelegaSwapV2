import React from 'react'
import { commercialTool } from '../../lib/tools'
import { ExternalService } from './ExternalService'

export default function TrendBoost() {
  const tool = commercialTool('trend-boost')
  return <ExternalService title={tool.label} detail={tool.detail} href={tool.href} />
}
