import React from 'react'
import { MetricCell, MetricLabel, MetricSource, MetricValue } from './theme'

export const UNAVAILABLE = 'Unavailable' as const

export function Metric(props: {
  label: string
  value: string
  source?: string
  tone?: 'ok' | 'bad' | 'mute' | 'gold'
  testId?: string
}) {
  return (
    <MetricCell data-testid={props.testId}>
      <MetricLabel>{props.label}</MetricLabel>
      <MetricValue $tone={props.tone}>{props.value}</MetricValue>
      {props.source ? <MetricSource>{props.source}</MetricSource> : null}
    </MetricCell>
  )
}

export function indexed(source: string): string {
  return `Indexed · ${source}`
}

export function live(source: string): string {
  return `Live · ${source}`
}
