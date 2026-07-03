import React from 'react'
import { MelegaTicker } from 'design-system/melega'
import TrendingRibbon from 'views/HomeTrade/TrendingRibbon'

interface State {
  hasError: boolean
}

class TrendingRibbonBoundary extends React.Component<Record<string, never>, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <MelegaTicker
          label="TRENDING ON MELEGA DEX"
          items={[]}
          emptyPrimary="Command Center ready"
          emptySecondary="Live ticker resumes when network data is available"
        />
      )
    }
    return <TrendingRibbon />
  }
}

export const SafeTrendingRibbon: React.FC = () => <TrendingRibbonBoundary />

export default SafeTrendingRibbon
