export const MARCO_PAY_APPROVAL_ORIGIN = 'https://marco.melega.ai'
export const MARCO_PAY_APPROVAL_WINDOW_NAME = 'marco-pay'

export type MarcoPayHandoffSession = {
  paymentId: string
  approvalUrl: string
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function marcoPayApprovalUrl(paymentId: string): string {
  const id = paymentId.trim()
  if (!id) return ''
  return `${MARCO_PAY_APPROVAL_ORIGIN}/pay/${id}`
}

export function readMarcoPayHandoffSession(payload: unknown): MarcoPayHandoffSession | null {
  const root = asRecord(payload)
  if (!root) return null
  const order = asRecord(root.order)
  const widget = asRecord(root.widget)
  const paymentId =
    readString(root.payment_id) ||
    readString(root.paymentId) ||
    readString(order?.payment_id) ||
    readString(order?.paymentId) ||
    readString(widget?.payment_id) ||
    readString(widget?.paymentId)
  const approvalUrl =
    readString(root.approval_url) ||
    readString(root.approvalUrl) ||
    readString(order?.approval_url) ||
    readString(order?.approvalUrl) ||
    readString(widget?.approval_url) ||
    readString(widget?.approvalUrl)
  if (!paymentId || !approvalUrl) return null
  return {
    paymentId,
    approvalUrl: marcoPayApprovalUrl(paymentId),
  }
}

export function openMarcoPayHandoffWindow(): Window | null {
  if (typeof window === 'undefined') return null
  const popup = window.open('', MARCO_PAY_APPROVAL_WINDOW_NAME, 'width=460,height=760')
  if (popup) {
    try {
      popup.opener = null
    } catch {
      /* ignore */
    }
  }
  return popup
}

export function marcoPayRewardNotice(customerBps: number | null | undefined): string | null {
  if (typeof customerBps !== 'number' || !(customerBps > 0)) return null
  const percent = customerBps / 100
  const shown = Number.isInteger(percent) ? String(percent) : percent.toFixed(1)
  return `+${shown}% M-Credits received`
}

export const MARCO_PASSPORT_URL = `${MARCO_PAY_APPROVAL_ORIGIN}/passport`

export function assignMarcoPayHandoff(popup: Window | null, session: MarcoPayHandoffSession | null): boolean {
  const url = session ? marcoPayApprovalUrl(session.paymentId) : ''
  if (!popup || !session || !url) {
    try {
      popup?.close()
    } catch {
      /* ignore */
    }
    return false
  }
  popup.location.replace(url)
  return true
}
