import React, { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  destinationWalletInputReadOnly,
  isValidMarcoDestination,
  resolveDisplayedMarcoDestination,
} from 'lib/marco-bridge/validation'
import { DestinationWalletInput } from '../DestinationWalletInput'

const EVM_SOURCE = '0x1111111111111111111111111111111111111111'
const EVM_OTHER = '0x2222222222222222222222222222222222222222'

function DestinationHarness({
  sourceWallet = EVM_SOURCE,
  sameFamily = true,
  sourceLocked = false,
  extraRenderToken,
}: {
  sourceWallet?: string
  sameFamily?: boolean
  sourceLocked?: boolean
  extraRenderToken?: number
}) {
  const [destination, setDestination] = useState('')
  const displayed = resolveDisplayedMarcoDestination(destination, sameFamily, sourceWallet)
  return (
    <div data-testid="destination-harness" data-render-token={extraRenderToken ?? 0}>
      <label>
        <span>Destination wallet</span>
        <DestinationWalletInput
          value={displayed}
          readOnly={destinationWalletInputReadOnly(sourceLocked)}
          placeholder="0x…"
          onChange={setDestination}
        />
      </label>
      <output data-testid="destination-valid">{String(isValidMarcoDestination(displayed, 'evm'))}</output>
    </div>
  )
}

function destinationInput() {
  return screen.getByTestId('marco-bridge-destination-wallet') as HTMLInputElement
}

describe('DestinationWalletInput mobile/desktop editability', () => {
  it('is an editable text input in the same-family autofill state', () => {
    render(<DestinationHarness />)
    const input = destinationInput()
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveAttribute('inputmode', 'text')
    expect(input.readOnly).toBe(false)
    expect(input.disabled).toBe(false)
    expect(input.value).toBe(EVM_SOURCE)
    expect(input.autocomplete).toBe('off')
    expect(input.spellcheck).toBe(false)
  })

  it('focuses the actual input on click/tap and keeps it after a controlled re-render', () => {
    const { rerender } = render(<DestinationHarness extraRenderToken={1} />)
    const input = destinationInput()
    fireEvent.click(input)
    input.focus()
    expect(document.activeElement).toBe(input)
    rerender(<DestinationHarness extraRenderToken={2} />)
    expect(document.activeElement).toBe(destinationInput())
    expect(destinationInput().value).toBe(EVM_SOURCE)
  })

  it('lets the user type, replace, and paste a different destination', () => {
    render(<DestinationHarness />)
    const input = destinationInput()
    fireEvent.click(input)
    input.focus()
    fireEvent.change(input, { target: { value: `${EVM_SOURCE}a` } })
    expect(destinationInput().value).toBe(`${EVM_SOURCE}a`)
    expect(screen.getByTestId('destination-valid').textContent).toBe('false')

    fireEvent.change(destinationInput(), { target: { value: '' } })
    fireEvent.paste(destinationInput(), {
      clipboardData: { getData: () => EVM_OTHER },
    } as unknown as ClipboardEvent)
    fireEvent.change(destinationInput(), { target: { value: EVM_OTHER } })
    expect(destinationInput().value).toBe(EVM_OTHER)
    expect(isValidMarcoDestination(destinationInput().value, 'evm')).toBe(true)
    expect(screen.getByTestId('destination-valid').textContent).toBe('true')
    expect(document.activeElement).toBe(destinationInput())
  })

  it('stays locked only while the source transfer is in flight', () => {
    render(<DestinationHarness sourceLocked />)
    const input = destinationInput()
    expect(input.readOnly).toBe(true)
    expect(input.disabled).toBe(false)
    fireEvent.change(input, { target: { value: EVM_OTHER } })
    expect(input.value).toBe(EVM_SOURCE)
  })
})
