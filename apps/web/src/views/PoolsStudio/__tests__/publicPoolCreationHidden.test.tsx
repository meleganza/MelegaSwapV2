
import { render, waitFor, cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { COMMERCIAL_SERVICES } from 'views/shared/monetization/commercialCheckoutTypes'
import { MY_MELEGA_ROUTES } from 'lib/data-truth/myMelegaPositions'

const router = { isReady: true, pathname: '/pools', asPath: '/pools', query: {} as Record<string, unknown>, replace: vi.fn() }
vi.mock('next/router', () => ({ useRouter: () => router }))
vi.mock('components/Layout/Page', () => ({ PageMeta: () => null }))
vi.mock('components/ErrorBoundary', () => ({ DataSurfaceErrorBoundary: ({ children }) => children }))
vi.mock('design-system/melega', () => ({ typography: { fontFamily: { body: 'sans-serif' } } }))
vi.mock('../PoolsStudioGlobalStyle', () => ({ default: () => null }))
vi.mock('../poolsRuntime/PoolsRuntimeContext', () => ({ PoolsRuntimeProvider: ({ children }) => children }))
vi.mock('../poolsRuntime/PoolsActionHost', () => ({ default: () => <div data-testid="staking-actions" /> }))
vi.mock('../modules/PoolsHeroModule', () => ({ PoolsHeroModule: () => <div data-testid="pool-hero" /> }))
vi.mock('../modules/PoolsOverviewKpisModule', () => ({ PoolsOverviewKpisModule: () => <div data-testid="pool-kpis" /> }))
vi.mock('../modules/PoolsMyPositionsModule', () => ({ PoolsMyPositionsModule: () => <div data-testid="pool-positions" /> }))
vi.mock('../modules/PoolsExplorePoolsModule', () => ({ PoolsExplorePoolsModule: () => <div data-testid="pool-browsing" /> }))
vi.mock('../modules/PoolsVisualPolishModule', () => ({ PoolsVisualPolishModule: () => null }))
vi.mock('../poolsRuntime/poolsUxFixture', () => ({ isPoolsUxFixtureEnabled: () => false }))
vi.mock('../components/CreatePoolCta', () => ({ default: () => { throw new Error('Public wizard mounted') } }))
import PoolsStudioScreen from '../PoolsStudioScreen'

const read = (p: string) => readFileSync(path.resolve(__dirname, '../../../', p), 'utf8')
afterEach(() => { cleanup(); router.replace.mockClear() })

describe('Public pool creation remains hidden while staking stays available', () => {
  it.each(['1', 'true', '0', ['1', 'true']])('canonicalizes create=%s and preserves browsing filters', async (create) => {
    router.query = { create, chain: '56', view: 'explore' }
    router.asPath = '/pools?create=1&chain=56&view=explore'
    const screen = render(<PoolsStudioScreen />)
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith(
      { pathname: '/pools', query: { chain: '56', view: 'explore' }, hash: undefined }, undefined, { shallow: true, scroll: false },
    ))
    for (const id of ['pool-hero', 'pool-kpis', 'pool-positions', 'pool-browsing', 'staking-actions']) expect(screen.getByTestId(id)).toBeTruthy()
    window.dispatchEvent(new Event('melega:open-create-pool'))
    expect(screen.queryByText(/Create Pool|Final deployment requires/i)).toBeNull()
    expect(screen.queryByTestId('create-pool-modal')).toBeNull()
  })
  it('removes the legacy hash but keeps unrelated hashes and filters', async () => {
    router.query = { chain: '56' }; router.asPath = '/pools?chain=56#create-pool'
    render(<PoolsStudioScreen />)
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith({ pathname: '/pools', query: { chain: '56' }, hash: undefined }, undefined, { shallow: true, scroll: false }))
    cleanup(); router.replace.mockClear(); router.asPath = '/pools?chain=56#explore'
    render(<PoolsStudioScreen />)
    expect(router.replace).not.toHaveBeenCalled()
  })
  it('removes active hero, drawer, project and commercial creation actions', () => {
    expect(read('views/PoolsStudio/modules/PoolsHeroModule.tsx')).not.toContain('pools-hero-create-pool')
    expect(read('components/MyMelega/MyMelegaDrawer.tsx')).not.toContain('Create Pool')
    expect(MY_MELEGA_ROUTES).not.toHaveProperty('createPool')
    expect(COMMERCIAL_SERVICES.some(s => s.id === 'create-pool')).toBe(false)
    expect(read('views/ProjectPage/v7/ProjectPageV7Shell.tsx')).not.toContain('/pools?create=1')
  })
  it('keeps the internal wizard and fee policy without importing them into the public screen', () => {
    expect(read('views/PoolsStudio/components/CreatePoolCta.tsx')).toContain('Review Pool Creation')
    expect(read('views/PoolsStudio/components/createPoolWizardState.ts')).toContain('describeCreatePoolFee')
    expect(read('views/PoolsStudio/PoolsStudioScreen.tsx')).not.toContain('CreatePoolCta')
    expect(read('views/PoolsStudio/PoolsStudioScreen.tsx')).not.toContain('MelegaModal')
  })
})
