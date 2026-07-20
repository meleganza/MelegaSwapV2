import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import type { MyPositionCardModel } from 'lib/wallet-portfolio/myPositionCardModel'
import type { PortfolioPositionAction } from 'lib/wallet-portfolio/contracts'
import { PositionCard } from '../PositionCard'

function action(
  type: PortfolioPositionAction['type'],
  label: string,
  overrides: Partial<PortfolioPositionAction> = {},
): PortfolioPositionAction {
  return {
    type,
    label,
    priority: 1,
    route: overrides.route ?? `/${label.toLowerCase()}`,
    enabled: overrides.enabled ?? true,
    reasonDisabled: overrides.enabled === false ? 'Not available' : null,
    ...overrides,
  }
}

function baseCard(overrides: Partial<MyPositionCardModel> = {}): MyPositionCardModel {
  const manage = action('MANAGE', 'Manage')
  return {
    identity: {
      positionId: 'pos-1',
      positionType: 'LIQUIDITY',
      protocol: 'melega-v2',
      chain: { chainId: 56, name: 'BNB Chain' },
      contract: '0xabc',
      wallet: '0xwallet',
    },
    positionId: 'pos-1',
    positionType: 'LIQUIDITY',
    title: 'MM72 / MARCO',
    subtitle: 'Liquidity position',
    icon: 'https://example.com/icon.png',
    badge: ['V2'],
    tags: ['owned'],
    value: {
      currentValueUsd: '100.5',
      principalValueUsd: null,
      claimableValueUsd: null,
      pendingRewardsValueUsd: null,
    },
    claimables: {
      hasClaimable: false,
      valueUsd: null,
      tokens: [],
      actions: [],
    },
    lifecycle: {
      status: 'ACTIVE',
      startedAt: null,
      endsAt: null,
      updatedAt: null,
    },
    actions: {
      primaryAction: manage,
      secondaryActions: [],
    },
    navigation: {
      productRoute: '/liquidity-studio',
      openRoute: '/liquidity-studio/open',
      manageRoute: '/liquidity-studio/manage',
      analyticsRoute: null,
    },
    attention: {
      requiresAttention: false,
      attentionReason: null,
    },
    status: 'ACTIVE',
    requiresAttention: false,
    ...overrides,
  }
}

describe('R791D.3G PositionCard renderer', () => {
  it('TEST 1 — Liquidity model renders', () => {
    render(<PositionCard position={baseCard({ positionType: 'LIQUIDITY', title: 'LP Pair' })} />)
    expect(screen.getByTestId('position-card')).toHaveAttribute('data-position-type', 'LIQUIDITY')
    expect(screen.getByRole('heading', { name: 'LP Pair' })).toBeTruthy()
  })

  it('TEST 2 — Farm model renders', () => {
    const harvest = action('HARVEST', 'Harvest')
    render(
      <PositionCard
        position={baseCard({
          positionId: 'farm-1',
          positionType: 'FARM',
          title: 'MM72 Farm',
          claimables: { hasClaimable: true, valueUsd: '3.2', tokens: [], actions: [harvest] },
          actions: { primaryAction: harvest, secondaryActions: [] },
        })}
      />,
    )
    expect(screen.getByTestId('position-card')).toHaveAttribute('data-position-type', 'FARM')
    expect(screen.getByRole('heading', { name: 'MM72 Farm' })).toBeTruthy()
    expect(screen.getByTestId('claimable-value').textContent).toBe('3.2')
  })

  it('TEST 3 — Pool model renders', () => {
    render(
      <PositionCard
        position={baseCard({
          positionId: 'pool-1',
          positionType: 'POOL',
          title: 'MARCO Staking',
        })}
      />,
    )
    expect(screen.getByTestId('position-card')).toHaveAttribute('data-position-type', 'POOL')
    expect(screen.getByRole('heading', { name: 'MARCO Staking' })).toBeTruthy()
  })

  it('TEST 4 — Future position type renders', () => {
    render(
      <PositionCard
        position={baseCard({
          positionId: 'vault-1',
          positionType: 'VAULT',
          title: 'Future Vault',
          identity: {
            positionId: 'vault-1',
            positionType: 'VAULT',
            protocol: 'melega-v2',
            chain: { chainId: 56, name: 'BNB Chain' },
            contract: null,
            wallet: '0xwallet',
          },
        })}
      />,
    )
    expect(screen.getByTestId('position-card')).toHaveAttribute('data-position-type', 'VAULT')
    expect(screen.getByRole('heading', { name: 'Future Vault' })).toBeTruthy()
  })

  it('TEST 5 — Primary action renders', () => {
    const claim = action('CLAIM', 'Claim rewards')
    render(
      <PositionCard
        position={baseCard({
          actions: { primaryAction: claim, secondaryActions: [] },
        })}
      />,
    )
    const primary = screen.getByRole('link', { name: 'Claim rewards' })
    expect(primary).toHaveAttribute('data-action-kind', 'primary')
    expect(primary).toHaveAttribute('data-action-type', 'CLAIM')
  })

  it('TEST 6 — Secondary actions preserve order', () => {
    const primary = action('HARVEST', 'Harvest')
    const secondary = [
      action('MANAGE', 'Manage'),
      action('WITHDRAW', 'Withdraw'),
      action('ANALYTICS', 'Analytics'),
    ]
    render(
      <PositionCard
        position={baseCard({
          actions: { primaryAction: primary, secondaryActions: secondary },
        })}
      />,
    )
    const actions = screen.getByLabelText('Position actions')
    const controls = within(actions).getAllByRole('link')
    expect(controls.map((el) => el.getAttribute('aria-label'))).toEqual([
      'Harvest',
      'Manage',
      'Withdraw',
      'Analytics',
    ])
  })

  it('TEST 7 — Null economics do not create fake values', () => {
    render(
      <PositionCard
        position={baseCard({
          value: {
            currentValueUsd: null,
            principalValueUsd: null,
            claimableValueUsd: null,
            pendingRewardsValueUsd: null,
          },
          claimables: { hasClaimable: false, valueUsd: null, tokens: [], actions: [] },
        })}
      />,
    )
    const body = screen.getByTestId('position-card').querySelector('[data-section="body"]')
    expect(body?.textContent).not.toMatch(/\$0/)
    expect(body?.textContent).not.toMatch(/\b0%\b/)
    expect(body?.textContent).not.toMatch(/Unavailable/)
    expect(screen.queryByTestId('claimable-value')).toBeNull()
  })

  it('TEST 8 — Ended lifecycle renders', () => {
    render(
      <PositionCard
        position={baseCard({
          status: 'ENDED',
          lifecycle: { status: 'ENDED', startedAt: null, endsAt: null, updatedAt: null },
        })}
      />,
    )
    expect(screen.getByTestId('position-status').textContent).toContain('ENDED')
    expect(screen.getByLabelText('Lifecycle ENDED').textContent).toBe('ENDED')
  })

  it('TEST 9 — Attention indicator renders', () => {
    render(
      <PositionCard
        position={baseCard({
          requiresAttention: true,
          attention: { requiresAttention: true, attentionReason: 'Approval expired' },
        })}
      />,
    )
    expect(screen.getByTestId('attention-indicator')).toBeTruthy()
    expect(screen.getByTestId('attention-reason').textContent).toContain('Approval expired')
  })

  it('TEST 10 — Missing optional metadata does not crash', () => {
    const minimal = baseCard({
      subtitle: null,
      icon: null,
      badge: [],
      tags: [],
      navigation: {
        productRoute: null,
        openRoute: null,
        manageRoute: null,
        analyticsRoute: null,
      },
    })
    expect(() => render(<PositionCard position={minimal} />)).not.toThrow()
    expect(screen.getByTestId('position-card')).toBeTruthy()
    expect(screen.queryByTestId('position-icon')).toBeNull()
  })

  it('TEST 11 — No product-specific branches', () => {
    const source = readFileSync(
      path.resolve(__dirname, '../PositionCard.tsx'),
      'utf8',
    )
    expect(source).not.toMatch(/positionType\s*===\s*['"]FARM['"]/)
    expect(source).not.toMatch(/positionType\s*===\s*['"]POOL['"]/)
    expect(source).not.toMatch(/positionType\s*===\s*['"]LIQUIDITY['"]/)
    expect(source).not.toMatch(/if\s*\(\s*positionType/)
    expect(source).not.toMatch(/switch\s*\(\s*.*positionType/)
  })

  it('TEST 12 — Accessibility labels exist', () => {
    render(
      <PositionCard
        position={baseCard({
          title: 'Accessible Position',
          actions: {
            primaryAction: action('MANAGE', 'Manage position'),
            secondaryActions: [action('OPEN', 'Open details')],
          },
        })}
      />,
    )
    const card = screen.getByRole('article', { name: 'Accessible Position' })
    expect(card).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Manage position' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Open details' })).toBeTruthy()
    expect(screen.getByLabelText('Position actions')).toBeTruthy()
    expect(screen.getByLabelText('Position navigation')).toBeTruthy()
  })

  it('returns null when position missing', () => {
    const { container } = render(<PositionCard position={null} />)
    expect(container.firstChild).toBeNull()
  })
})
