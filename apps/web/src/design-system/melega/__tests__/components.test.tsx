import React from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MelegaDesignSystemCatalogue } from '../catalogue/MelegaDesignSystemCatalogue'
import { MelegaButton } from '../components/Button'
import { MelegaBadge } from '../components/Badge'

describe('Melega design system components (DS-001)', () => {
  it('renders catalogue root', () => {
    const { container } = render(<MelegaDesignSystemCatalogue />)
    expect(container.querySelector('[data-melega-design-system-catalogue]')).toBeTruthy()
  })

  it('renders button variants', () => {
    const { getByText } = render(
      <>
        <MelegaButton>Primary</MelegaButton>
        <MelegaButton variant="secondary">Secondary</MelegaButton>
      </>,
    )
    expect(getByText('Primary')).toBeTruthy()
    expect(getByText('Secondary')).toBeTruthy()
  })

  it('renders badge variants', () => {
    const { getByText } = render(
      <>
        <MelegaBadge variant="live" dot>
          Live
        </MelegaBadge>
        <MelegaBadge variant="error">Error</MelegaBadge>
      </>,
    )
    expect(getByText('Live')).toBeTruthy()
    expect(getByText('Error')).toBeTruthy()
  })
})
