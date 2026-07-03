import React from 'react'
import CommandCenterScreen from '../CommandCenterScreen'

interface State {
  hasError: boolean
}

/**
 * Keeps Command Center on mock/static content when a child throws in production preview.
 */
export class CommandCenterRuntimeBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      console.error('[CommandCenter] runtime boundary caught:', error)
    }
  }

  render() {
    if (this.state.hasError) {
      return <CommandCenterScreen runtimeSafeMode />
    }
    return this.props.children
  }
}

export default CommandCenterRuntimeBoundary
