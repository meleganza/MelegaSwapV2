import React from 'react'
import { DESTINATION_WALLET_TEXT_INPUT_ATTRS } from 'lib/marco-bridge/validation'

export function DestinationWalletInput({
  value,
  readOnly,
  placeholder,
  onChange,
}: {
  value: string
  readOnly: boolean
  placeholder: string
  onChange: (next: string) => void
}) {
  return (
    <input
      aria-label="Destination wallet"
      data-testid="marco-bridge-destination-wallet"
      {...DESTINATION_WALLET_TEXT_INPUT_ATTRS}
      value={value}
      readOnly={readOnly}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}
