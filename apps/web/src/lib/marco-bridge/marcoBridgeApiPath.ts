/**
 * Production next.config sets `trailingSlash: true`. A no-slash POST to
 * `/api/marco-bridge/quote` is 308'd. Firefox/Safari surface that as
 * `NetworkError when attempting to fetch resource` and never parse JSON.
 */
export function marcoBridgeApiPath(path: string): string {
  const queryIndex = path.indexOf('?')
  const base = queryIndex === -1 ? path : path.slice(0, queryIndex)
  const query = queryIndex === -1 ? '' : path.slice(queryIndex)
  return `${base.endsWith('/') ? base : `${base}/`}${query}`
}
