import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const pagesRoot = path.resolve(process.cwd(), 'apps/web/src/pages')

async function walk(directory) {
  const entries = await readdir(directory)
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolute = path.join(directory, entry)
      return (await stat(absolute)).isDirectory() ? walk(absolute) : absolute
    }),
  )
  return files.flat()
}

function toRoute(file) {
  return file
    .slice(pagesRoot.length)
    .replace(/\\/g, '/')
    .replace(/\.(jsx?|tsx?)$/, '')
    .replace(/\/index$/, '') || '/'
}

const files = (await walk(pagesRoot)).filter((file) => /\.(jsx?|tsx?)$/.test(file) && !file.endsWith('.test.ts'))
const routes = files.map(toRoute).sort()
const api = routes.filter((route) => route.startsWith('/api/'))
const system = routes.filter((route) => /^\/_/.test(route))
const ui = routes.filter((route) => !route.startsWith('/api/') && !/^\/_/.test(route))

console.log(JSON.stringify({ total: routes.length, ui: ui.length, api: api.length, system: system.length }, null, 2))
console.log('\nUI routes')
ui.forEach((route) => console.log(route))

