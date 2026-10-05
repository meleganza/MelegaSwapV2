import { describe, expect, it } from 'vitest'
import {
  PUBLIC_MELEGA_SURFACES,
  collectPublicActionables,
  isDeadPublicHref,
  observePublicActionTransition,
  validatePublicActionable,
} from '../publicClickIntegrity'

describe('bounded public click-integrity harness', () => {
  it('keeps the certification scope explicit and unique', () => {
    expect(PUBLIC_MELEGA_SURFACES).toHaveLength(13)
    expect(new Set(PUBLIC_MELEGA_SURFACES.map(({ path }) => path)).size).toBe(PUBLIC_MELEGA_SURFACES.length)
  })

  it('collects links, buttons, role buttons, and public tabs once', () => {
    document.body.innerHTML = `
      <a href="/swap">Swap</a>
      <button aria-label="Connect wallet"></button>
      <div role="button" tabindex="0">Open search</div>
      <div role="tab">Smart Swap</div>
    `
    expect(collectPublicActionables(document).map(({ label }) => label)).toEqual([
      'Swap',
      'Connect wallet',
      'Open search',
      'Smart Swap',
    ])
  })

  it('rejects dead hrefs and unexplained disabled public controls', () => {
    document.body.innerHTML = `
      <a href="#">Dead</a>
      <a href="javascript:void(0)">Also dead</a>
      <button disabled>MAX</button>
      <button disabled data-disabled-reason="Connect wallet first">Safe MAX</button>
    `
    const [dead, alsoDead, unexplained, explained] = collectPublicActionables(document)
    expect(isDeadPublicHref(dead.href)).toBe(true)
    expect(isDeadPublicHref(alsoDead.href)).toBe(true)
    expect(validatePublicActionable(dead)).toContain('dead href: #')
    expect(validatePublicActionable(unexplained)).toContain('disabled without a truthful reason')
    expect(validatePublicActionable(explained)).toEqual([])
  })

  it('observes a modal state transition and detects a silent click', async () => {
    document.body.innerHTML = '<button id="open">Open</button><button id="silent">Silent</button>'
    const open = document.querySelector<HTMLElement>('#open')!
    open.addEventListener('click', () => {
      const dialog = document.createElement('div')
      dialog.setAttribute('role', 'dialog')
      dialog.textContent = 'Review'
      document.body.append(dialog)
    })
    expect((await observePublicActionTransition(open)).changed).toBe(true)
    expect((await observePublicActionTransition(document.querySelector<HTMLElement>('#silent')!)).changed).toBe(false)
  })
})
