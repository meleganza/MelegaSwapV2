import base from '../../../apps/web/vitest.config'
import { resolve } from 'path'
export default { ...base, root: resolve(__dirname, '../../../apps/web'), test: { ...base.test, cache: false } }
