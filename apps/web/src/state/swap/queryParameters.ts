import { ParsedUrlQuery } from 'querystring'
import { DEFAULT_INPUT_CURRENCY, DEFAULT_OUTPUT_CURRENCY } from 'config/constants/exchange'
import { isAddress } from 'utils'
import { Field } from './actions'
import { SwapState } from './reducer'

function queryValueToString(value: unknown): string | undefined {
  if (typeof value === 'string' && value) return value
  if (Array.isArray(value) && typeof value[0] === 'string' && value[0]) return value[0]
  return undefined
}

/** Native symbol must be a string. Class/object lookups (NativeCurrency[chainId]) are ignored. */
export function coerceNativeSymbol(nativeSymbol?: unknown): string | undefined {
  return typeof nativeSymbol === 'string' && nativeSymbol.trim() ? nativeSymbol : undefined
}

function parseTokenAmountURLParameter(urlParam: unknown): string {
  return typeof urlParam === 'string' && !Number.isNaN(parseFloat(urlParam)) ? urlParam : ''
}

function parseIndependentFieldURLParameter(urlParam: unknown): Field {
  return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output' ? Field.OUTPUT : Field.INPUT
}

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

function validatedRecipient(recipient: unknown): string | null {
  if (typeof recipient !== 'string') return null
  const address = isAddress(recipient)
  if (address) return address
  if (ADDRESS_REGEX.test(recipient)) return recipient
  return null
}

export function queryParametersToSwapState(
  parsedQs: ParsedUrlQuery,
  nativeSymbol?: unknown,
  defaultOutputCurrency?: string,
): SwapState {
  const native = coerceNativeSymbol(nativeSymbol)
  const inputRaw = queryValueToString(parsedQs.inputCurrency)
  const outputRaw = queryValueToString(parsedQs.outputCurrency)

  let inputCurrency: string = (inputRaw && isAddress(inputRaw)) || native || DEFAULT_INPUT_CURRENCY
  let outputCurrency: string = outputRaw
    ? isAddress(outputRaw) || native || ''
    : defaultOutputCurrency ?? DEFAULT_OUTPUT_CURRENCY

  if (typeof inputCurrency !== 'string' || !inputCurrency) {
    inputCurrency = DEFAULT_INPUT_CURRENCY
  }
  if (typeof outputCurrency !== 'string') {
    outputCurrency = defaultOutputCurrency ?? DEFAULT_OUTPUT_CURRENCY
  }

  if (inputCurrency && outputCurrency && inputCurrency.toLowerCase() === outputCurrency.toLowerCase()) {
    if (outputRaw) {
      inputCurrency = ''
    } else {
      outputCurrency = ''
    }
  }

  return {
    [Field.INPUT]: {
      currencyId: inputCurrency,
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency,
    },
    typedValue: parseTokenAmountURLParameter(parsedQs.exactAmount),
    independentField: parseIndependentFieldURLParameter(parsedQs.exactField),
    recipient: validatedRecipient(parsedQs.recipient),
    pairDataById: {},
    derivedPairDataById: {},
  }
}

export function queryParametersToBridgeState(parsedQs: ParsedUrlQuery, nativeSymbol?: unknown): SwapState {
  const native = coerceNativeSymbol(nativeSymbol)
  const token = queryValueToString(parsedQs.token)
  return {
    [Field.INPUT]: {
      currencyId: token ?? native,
    },
    [Field.OUTPUT]: {
      currencyId: undefined,
    },
    typedValue: parseTokenAmountURLParameter(parsedQs.exactAmount),
    independentField: parseIndependentFieldURLParameter(parsedQs.exactField),
    recipient: undefined,
    pairDataById: {},
    derivedPairDataById: {},
  }
}
