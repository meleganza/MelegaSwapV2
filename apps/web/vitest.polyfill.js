import { TextDecoder, TextEncoder } from 'node:util'

Object.defineProperty(globalThis, 'TextEncoder', {
  configurable: true,
  writable: true,
  value: TextEncoder,
})
Object.defineProperty(globalThis, 'TextDecoder', {
  configurable: true,
  writable: true,
  value: TextDecoder,
})
