import React from 'react'
import { MetricCell, MetricLabel, MetricSource, MetricValue } from './theme'

export type MetricProvenance = {
  availability: 'indexed' | 'live' | 'unavailable'
  source: string
  lastUpdate?: string | null
}

type Props = {
  label: string
  value: string
  tone?: 'ok' | 'bad' | 'mute' | 'gold'
  provenance: MetricProvenance
}

/** Dense metric cell — always discloses indexed/live/unavailable + source. */
export function Metric({ label, value, tone, provenance }: Props) {
  const stamp = [
    provenance.availability,
    provenance.source,
    provenance.lastUpdate ? `updated ${provenance.lastUpdate}` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <MetricCell data-metric-availability={provenance.availability}>
      <MetricLabel>{label}</MetricLabel>
      <MetricValue $tone={tone ?? (value === 'Unavailable' ? 'mute' : undefined)}>{value}</MetricValue>
      <MetricSource>{stamp}</MetricSource>
    </MetricCell>
  )
}

export const UNAVAILABLE: MetricProvenance = {
  availability: 'unavailable',
  source: 'none',
  lastUpdate: null,
}

export function indexed(source: string, lastUpdate?: string | null): MetricProvenance {
  return { availability: 'indexed', source, lastUpdate: lastUpdate ?? null }
}

export function live(source: string, lastUpdate?: string | null): MetricProvenance {
  return { availability: 'live', source, lastUpdate: lastUpdate ?? null }
}
