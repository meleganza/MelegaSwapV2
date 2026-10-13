import React from 'react'
import { BetaShell } from './BetaShell'
import { NonOperational } from './NonOperational'
import type { SectionCopy } from '../lib/sections'

export function ProductPage({ section, children }: { section: SectionCopy; children?: React.ReactNode }) {
  return (
    <BetaShell section={section.id}>
      <NonOperational section={section} />
      {children}
    </BetaShell>
  )
}
