import { setImmediate as nodeSetImmediate } from 'timers'

// vitest.setup.js assigns `global.setImmediate = vi.useRealTimers`.
// React 18's scheduler captures setImmediate at import time, so restore
// it before any react-dom import in this suite.
global.setImmediate = nodeSetImmediate as unknown as typeof global.setImmediate
