const PREFIX = 'melega.mcredits.receipt.v1:'

export type MCreditsReceipt = {
  orderId: string
  state: 'FULFILLED'
  serviceId: string
  packageId: string
  projectId: string
}

export function mCreditsReceiptKey(input: { projectId: string; serviceId: string; packageId: string }) {
  return `${PREFIX}${input.projectId}|${input.serviceId}|${input.packageId}`
}

export function saveMCreditsReceipt(receipt: MCreditsReceipt) {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(mCreditsReceiptKey(receipt), JSON.stringify(receipt))
}

export function loadMCreditsReceipt(input: { projectId: string; serviceId: string; packageId: string }): MCreditsReceipt | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(mCreditsReceiptKey(input))
    if (!raw) return null
    const parsed = JSON.parse(raw) as MCreditsReceipt
    return parsed.state === 'FULFILLED' && parsed.orderId ? parsed : null
  } catch {
    return null
  }
}

export function clearMCreditsReceiptsForTests() {
  if (typeof window === 'undefined') return
  const keys: string[] = []
  for (let i = 0; i < window.sessionStorage.length; i += 1) {
    const key = window.sessionStorage.key(i)
    if (key?.startsWith(PREFIX)) keys.push(key)
  }
  keys.forEach((key) => window.sessionStorage.removeItem(key))
}
