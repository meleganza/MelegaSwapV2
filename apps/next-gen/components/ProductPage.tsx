import React from 'react'
import { BetaShell } from './BetaShell'
import { NonOperational } from './NonOperational'
import type { SectionCopy } from '../lib/sections'

export function ProductPage({ section }: { section: SectionCopy }) {
  return (
    <BetaShell section={section.id}>
      <NonOperational section={section} />
    </BetaShell>
  )
}
