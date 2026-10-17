declare module 'node:test' {
  export function test(name: string, fn: () => void | Promise<void>): void
}
