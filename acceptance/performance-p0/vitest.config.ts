import base from '../../apps/web/vitest.config'
import path from 'path'
export default { ...base, test: { ...base.test, cache: false, setupFiles: [path.resolve(__dirname, 'setup.ts')] } }
