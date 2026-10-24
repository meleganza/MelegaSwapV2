export type DexTransferDirection = 'PASSPORT_TO_APP' | 'APP_TO_PASSPORT'

export function buildDexMcreditsTransferMessage(input: {
  wallet: string
  direction: DexTransferDirection
  amountMinor: string
  externalReference: string
  passportSubject: string
  issuedAt: string
}) {
  return [
    'Melega DEX Mcredits profile transfer',
    `Wallet: ${input.wallet.toLowerCase()}`,
    `Direction: ${input.direction}`,
    `Amount minor: ${input.amountMinor}`,
    `Reference: ${input.externalReference}`,
    `Passport: ${input.passportSubject}`,
    `Issued at: ${input.issuedAt}`,
  ].join('\n')
}

export function buildDexMcreditsBalanceMessage(wallet: string, issuedAt: string) {
  return [
    'Melega DEX Mcredits profile balance',
    `Wallet: ${wallet.toLowerCase()}`,
    `Issued at: ${issuedAt}`,
  ].join('\n')
}
