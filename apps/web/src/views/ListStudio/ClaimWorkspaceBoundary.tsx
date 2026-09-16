import React from 'react'
import { ClaimProjectFallback } from './ClaimProjectFallback'

type Props = {
  children: React.ReactNode
}

type State = { failed: boolean }

/**
 * Keeps claim-project failures inside the List modal. Never escalate to the
 * global route error screen.
 */
export class ClaimWorkspaceBoundary extends React.Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error) {
    if (typeof console !== 'undefined') {
      console.warn('claim-project workspace recovered', error?.message)
    }
  }

  render() {
    if (this.state.failed) {
      return <ClaimProjectFallback />
    }
    return this.props.children
  }
}

export default ClaimWorkspaceBoundary
