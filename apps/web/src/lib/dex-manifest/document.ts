import {
  MARCO_PAY_AUTHORITATIVE_ACTIVATION_EVENT,
  MARCO_PAY_BASE_URL,
} from 'lib/marco-pay/contract'
import { MARCO_CONNECT_WIDGET_URL, publicMarcoConnectStatus } from 'lib/marco-connect/identity'

export const DEX_MANIFEST_SCHEMA = 'melega.dex-manifest.v1' as const
export const DEX_MANIFEST_CALLBACK_URL = 'https://www.melega.finance/api/marco-pay/webhook/' as const

export type DexManifest = {
  schema: typeof DEX_MANIFEST_SCHEMA
  name: 'Melega DEX'
  origin: 'https://www.melega.finance'
  marco_pay: {
    enabled: boolean
    merchant_id: string | null
    application_ref: string | null
    base_url: typeof MARCO_PAY_BASE_URL
    callback_url: typeof DEX_MANIFEST_CALLBACK_URL
    authoritative_activation_event: typeof MARCO_PAY_AUTHORITATIVE_ACTIVATION_EVENT
    frontend_never_sets_paid: true
    executable: boolean
  }
  marco_connect: {
    enabled: true
    payment_requires_passport: false
    widget: typeof MARCO_CONNECT_WIDGET_URL
    client_supplied_passport_id_accepted: false
  }
}

export function buildDexManifest(input: {
  applicationRef: string | null
  executable: boolean
}): DexManifest {
  const connect = publicMarcoConnectStatus()
  return {
    schema: DEX_MANIFEST_SCHEMA,
    name: 'Melega DEX',
    origin: 'https://www.melega.finance',
    marco_pay: {
      enabled: Boolean(input.applicationRef),
      merchant_id: input.applicationRef,
      application_ref: input.applicationRef,
      base_url: MARCO_PAY_BASE_URL,
      callback_url: DEX_MANIFEST_CALLBACK_URL,
      authoritative_activation_event: MARCO_PAY_AUTHORITATIVE_ACTIVATION_EVENT,
      frontend_never_sets_paid: true,
      executable: input.executable,
    },
    marco_connect: {
      enabled: true,
      payment_requires_passport: false,
      widget: connect.widget,
      client_supplied_passport_id_accepted: false,
    },
  }
}
