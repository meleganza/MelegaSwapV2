import React, { Component, type ReactNode } from 'react'
import styled from 'styled-components'

const Panel = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.02);
  color: rgba(255, 255, 255, 0.82);
  font-size: 13px;
  line-height: 1.45;
`

const Title = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
`

const Reason = styled.div`
  color: rgba(255, 255, 255, 0.62);
`

const Details = styled.details`
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.45);
  font-size: 11px;

  summary {
    cursor: pointer;
    user-select: none;
  }

  pre {
    margin: 8px 0 0;
    white-space: pre-wrap;
    word-break: break-word;
  }
`

export interface DataSurfaceErrorBoundaryProps {
  surface: string
  userReason?: string
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

/** Isolates non-critical data surfaces so a module failure cannot crash the global app shell. */
export class DataSurfaceErrorBoundary extends Component<DataSurfaceErrorBoundaryProps, State> {
  constructor(props: DataSurfaceErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[DataSurface:${this.props.surface}]`, error, errorInfo)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const reason =
      this.props.userReason ??
      `${this.props.surface} is temporarily unavailable due to a runtime data error.`
    const technical = this.state.error?.stack ?? this.state.error?.message ?? 'Unknown error'

    return (
      <Panel data-data-surface-unavailable={this.props.surface}>
        <Title>Unavailable</Title>
        <Reason>{reason}</Reason>
        <Details>
          <summary>Technical details</summary>
          <pre>{technical}</pre>
        </Details>
      </Panel>
    )
  }
}
