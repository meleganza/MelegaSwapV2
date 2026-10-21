import React from 'react'
import { BetaShell } from './BetaShell'
import { NonOperational } from './NonOperational'
import { PremiumExperience } from './PremiumExperience'
import type { UxSectionCopy } from '../lib/uxSections'

export function ProductPage({ section, children }: { section: UxSectionCopy; children?: React.ReactNode }) {
  return (
    <BetaShell section={section.id}>
      <NonOperational section={section} />
      <PremiumExperience section={section}>{children}</PremiumExperience>
    </BetaShell>
  )
}
