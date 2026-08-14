import { gzipSync } from 'node:zlib'
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const webRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const nextRoot = join(webRoot, '.next')
const manifestPath = join(nextRoot, 'build-manifest.json')
const routesManifestPath = join(nextRoot, 'server', 'pages-manifest.json')
const budgetsPath = join(webRoot, 'lightspeed-budgets.json')
const outputPath = join(nextRoot, 'lightspeed-baseline.json')
const check = process.argv.includes('--check')

if (!existsSync(manifestPath) || !existsSync(routesManifestPath)) {
  throw new Error('Missing .next build. Run `yarn build` before measuring performance.')
}

const buildManifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const pagesManifest = JSON.parse(readFileSync(routesManifestPath, 'utf8'))
const budgets = JSON.parse(readFileSync(budgetsPath, 'utf8'))
const measuredRoutes = Object.keys(budgets.routesGzipKb)

const pageFiles = (route) => buildManifest.pages[route] ?? []
const gzipKbForFiles = (files) => {
  const uniqueFiles = [...new Set(files)]
  const bytes = uniqueFiles.reduce((total, relativePath) => {
    const absolutePath = join(nextRoot, relativePath)
    return existsSync(absolutePath) ? total + gzipSync(readFileSync(absolutePath)).byteLength : total
  }, 0)
  return Math.round((bytes / 1024) * 10) / 10
}

const routeGzipKb = Object.fromEntries(measuredRoutes.map((route) => [route, gzipKbForFiles(pageFiles(route))]))

// `/list` intentionally lazy-loads its page component, so its build-manifest entry
// cannot be used to compute the shared application runtime intersection.
const canonicalRuntimeRoutes = measuredRoutes.filter((route) => route !== '/list')
const commonFiles = canonicalRuntimeRoutes.reduce((common, route, index) => {
  const files = new Set(pageFiles(route))
  return index === 0 ? files : new Set([...common].filter((file) => files.has(file)))
}, new Set())

const poolsHeroPath = join(webRoot, 'public', 'images', 'pools', 'pools-hero-marco-3d.webp')
const publicPages = Object.keys(pagesManifest).filter(
  (route) => !route.startsWith('/api/') && !['/_app', '/_document', '/_error'].includes(route),
)
const report = {
  generatedAt: new Date().toISOString(),
  publicPageEntries: publicPages.length,
  commonRuntimeGzipKb: gzipKbForFiles([...commonFiles]),
  poolsHeroAssetKb: Math.round((statSync(poolsHeroPath).size / 1024) * 10) / 10,
  routesGzipKb: routeGzipKb,
}

writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report, null, 2))

if (check) {
  const regressions = []
  if (report.publicPageEntries > budgets.publicPageEntries) {
    regressions.push(`public pages ${report.publicPageEntries} > ${budgets.publicPageEntries}`)
  }
  if (report.commonRuntimeGzipKb > budgets.commonRuntimeGzipKb) {
    regressions.push(`common runtime ${report.commonRuntimeGzipKb} KB > ${budgets.commonRuntimeGzipKb} KB`)
  }
  if (report.poolsHeroAssetKb > budgets.poolsHeroAssetKb) {
    regressions.push(`Pools hero ${report.poolsHeroAssetKb} KB > ${budgets.poolsHeroAssetKb} KB`)
  }
  for (const route of measuredRoutes) {
    if (report.routesGzipKb[route] > budgets.routesGzipKb[route]) {
      regressions.push(`${route} ${report.routesGzipKb[route]} KB > ${budgets.routesGzipKb[route]} KB`)
    }
  }
  if (regressions.length > 0) {
    console.error(`Performance budget exceeded:\n- ${regressions.join('\n- ')}`)
    process.exitCode = 1
  } else {
    console.log('Performance budgets passed.')
  }
}
