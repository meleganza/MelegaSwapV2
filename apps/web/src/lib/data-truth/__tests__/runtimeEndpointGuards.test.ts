import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const WEB_SRC = path.resolve(__dirname, '../../..')
const REPO_ROOT = path.resolve(WEB_SRC, '../../..')

describe('runtime data endpoint guards', () => {
  it('does not post GraphQL queries to the current page when the Melega endpoint is unset', () => {
    const source = readFileSync(path.join(WEB_SRC, 'state/info/queries/pools/topPools.ts'), 'utf8')
    const queryHelper = readFileSync(path.join(WEB_SRC, 'views/Info/utils/infoQueryHelpers.ts'), 'utf8')
    expect(source).toContain('!multiChainQueryEndPoint[chainName]')
    expect(source.indexOf('!multiChainQueryEndPoint[chainName]')).toBeLessThan(source.indexOf('const query = gql'))
    expect(queryHelper).toContain('if (!endpoint?.trim() || subqueries.length === 0) return {}')
    expect(queryHelper.indexOf('if (!endpoint?.trim()')).toBeLessThan(queryHelper.indexOf('new GraphQLClient(endpoint'))
    const endpoints = readFileSync(path.join(WEB_SRC, 'config/constants/endpoints.ts'), 'utf8')
    expect(endpoints).toContain('NEXT_PUBLIC_MELEGA_BLOCKS_SUBGRAPH_URL')
    expect(endpoints).not.toContain(
      "export const BLOCKS_CLIENT = 'https://api.thegraph.com/subgraphs/name/pancakeswap/blocks'",
    )
  })

  it('does not request a dynamic undefined farm configuration while wallet state hydrates', () => {
    const source = readFileSync(path.join(REPO_ROOT, 'packages/farms/constants/index.ts'), 'utf8')
    expect(source.match(/if \(!chainId\) return \[\]/g)).toHaveLength(2)
    expect(source.indexOf('if (!chainId) return []')).toBeLessThan(source.indexOf('import(`/${chainId}.ts`)'))
  })

  it('keeps the static boot shell identical through the first client render', () => {
    const app = readFileSync(path.join(WEB_SRC, 'pages/_app.tsx'), 'utf8')
    const document = readFileSync(path.join(WEB_SRC, 'pages/_document.tsx'), 'utf8')
    expect(app).toContain('const [clientReady, setClientReady] = useState(false)')
    expect(app).toContain('return clientReady ? <FullMyApp {...props} /> : null')
    expect(app).toContain('setClientReady(true)')
    expect(document).toContain('<StaticAppBootShell />')
    expect(document).toContain('data-melega-app-boot-shell="true"')
    // Keep attribute values unquoted inside the inline CSS: React's document
    // serializer escapes quotes in style text and would invalidate this rule.
    expect(document).toContain('html[data-melega-hydrated=true] [data-melega-app-boot-shell=true]')
    expect(document).not.toContain("html[data-melega-hydrated='true']")
  })
})
