/**
 * Checkout target identity is the chain and token address the user selected.
 * Slug, symbol, and name are display fields and must not choose a different token.
 */

const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/

export type CheckoutTargetDetection = {
  contract: string
  chainId: number
  slug?: string | null
  symbol?: string | null
  name?: string | null
}

export type BoundCheckoutTarget = {
  chainId: number
  tokenAddress: string
  projectSlug: string | null
  projectId: string
  symbol: string | null
  name: string | null
}

export function normalizeCheckoutTokenAddress(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!EVM_ADDRESS_RE.test(trimmed)) return null
  return trimmed.toLowerCase()
}

export function canonicalCheckoutTokenAddress(value: string | null | undefined): string | null {
  if (value == null) return null
  const trimmed = String(value).trim()
  if (!trimmed) return null
  return normalizeCheckoutTokenAddress(trimmed) ?? trimmed
}

function displayText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

export function checkoutTokenAddressesMatch(
  left: string | null | undefined,
  right: string | null | undefined,
): boolean {
  const a = normalizeCheckoutTokenAddress(left)
  const b = normalizeCheckoutTokenAddress(right)
  if (!a && !b) return true
  return Boolean(a && b && a === b)
}

/**
 * Bind the order target to the address currently in the checkout input.
 * A previous detection, parent project, or null slug cannot substitute another token.
 */
export function bindCheckoutTarget(input: {
  inputAddress: string
  inputChainId: number
  detected: CheckoutTargetDetection | null
  projectId?: string | null
  projectSlug?: string | null
  projectContract?: string | null
}): BoundCheckoutTarget | null {
  const inputAddress = normalizeCheckoutTokenAddress(input.inputAddress)
  if (!inputAddress || !Number.isInteger(input.inputChainId)) return null
  if (!input.detected) return null
  const detectedAddress = normalizeCheckoutTokenAddress(input.detected.contract)
  if (!detectedAddress || detectedAddress !== inputAddress) return null
  if (input.detected.chainId !== input.inputChainId) return null

  const parentAddress = normalizeCheckoutTokenAddress(input.projectContract)
  const parentMatchesSelection = parentAddress === inputAddress
  const detectedSlug = displayText(input.detected.slug)
  const parentSlug = parentMatchesSelection ? displayText(input.projectSlug) : null
  const projectSlug = detectedSlug ?? parentSlug
  const parentId = parentMatchesSelection ? displayText(input.projectId) : null
  const projectId = parentId || projectSlug || inputAddress

  return {
    chainId: input.inputChainId,
    tokenAddress: inputAddress,
    projectSlug,
    projectId,
    symbol: displayText(input.detected.symbol),
    name: displayText(input.detected.name),
  }
}

export function checkoutTargetUnchanged(
  before: { chainId: number; projectContract: string | null },
  after: { chainId: number; projectContract: string | null },
): boolean {
  return before.chainId === after.chainId && before.projectContract === after.projectContract
}
