import CommandCenterScreen from 'views/CommandCenter/CommandCenterScreen'
import CommandCenterRuntimeBoundary from 'views/CommandCenter/components/CommandCenterRuntimeBoundary'

const CommandCenterPage = () => (
  <CommandCenterRuntimeBoundary>
    <CommandCenterScreen />
  </CommandCenterRuntimeBoundary>
)

/** Empty array bypasses network-block modal — page uses mock operational data only. */
CommandCenterPage.chains = []

export default CommandCenterPage
