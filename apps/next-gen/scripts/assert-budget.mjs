import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const manifestPath = path.join(root, '.next/build-manifest.json')
if (!existsSync(manifestPath)) {
  console.error('Missing .next/build-manifest.json. Run next build first.')
  process.exit(1)
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const homeFiles = [...(manifest.polyfillFiles || []), ...(manifest.pages['/'] || [])]
if (homeFiles.length === 0) {
  console.error('Home page is missing from the build manifest.')
  process.exit(1)
}

function gzipSize(relativePath) {
  const absolute = path.join(root, '.next', relativePath)
  return zlib.gzipSync(readFileSync(absolute)).length
}

const total = homeFiles.reduce((sum, file) => sum + gzipSize(file), 0)
const ceiling = 180 * 1024
const joined = homeFiles.join('\n')
const forbidden = /wagmi|ethers|sentry|styled-components|redux|@pancakeswap/i
if (forbidden.test(joined)) {
  console.error('Home manifest includes a live-stack chunk.')
  process.exit(1)
}

const homeSource = homeFiles
  .filter((file) => file.endsWith('.js'))
  .map((file) => readFileSync(path.join(root, '.next', file), 'utf8'))
  .join('\n')
if (homeSource.includes('Premium Project Page') || homeSource.includes('Create Token')) {
  console.error('Home first-load JS includes a commercial tool module.')
  process.exit(1)
}

console.log(`home first-load gzip bytes: ${total}`)
console.log(`ceiling bytes: ${ceiling}`)
if (total > ceiling) {
  console.error('Home first-load JS is over the NG001 ceiling.')
  process.exit(1)
}
