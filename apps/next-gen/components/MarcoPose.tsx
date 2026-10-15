import React from 'react'

/** Deterministic crops of the three founder-supplied canonical assets. Decorative, never a control. */
export function MarcoPose({ pose }: { pose: 'welcome' | 'earn' | 'explore' }) {
  return <img className="marco-pose" src={`/brand/marco-${pose}.webp`} alt="" aria-hidden="true" width="300" height="320" loading="lazy" decoding="async" />
}
