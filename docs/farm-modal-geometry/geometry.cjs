// Actual app/modal/card DOM; replay unmodified local indexer response for reproducible LP content.
// BASE_URL=http://localhost:3118 PLAYWRIGHT_MODULE=/path/to/playwright-core node docs/farm-modal-geometry/geometry.cjs
// PHASE=before changes artifact names only: identical assertions MUST fail on broken main.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const fs = require('fs')
const path = require('path')
const snapshot = require('./pairs-api-snapshot.json')
const phase = process.env.PHASE || 'after'
const base = process.env.BASE_URL || 'http://localhost:3118'
const results = []
const failures = []
const check = (ok, message) => { if (!ok) failures.push(message) }
;(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  try {
    for (const [width, height] of [[1440, 900], [1280, 800], [390, 844]]) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' })
      await context.route('**/api/indexer/pairs?*', route => route.fulfill({ json: snapshot }))
      const pair = snapshot.rows.find(p => p.pairAddress === '0x92015e7870af7c6c8eceebbe6176c2886b3f433b')
      if (!pair) throw new Error('Captured BNBDOG/WBNB pair required')
      await context.addInitScript(({ pair }) => localStorage.setItem('melega.public-farm-factory.draft.v1', JSON.stringify({
        draftId: 'geometry-regression', selectionMode: 'search_existing', selectedPair: { ...pair, lpTokenAddress: pair.pairAddress, symbol0: "BNBDOG", symbol1: "WBNB", sourceBlock: null },
        rewardToken: '', rewardTokenAddress: '', rewardBudget: '', emissionRate: '', durationDays: '', startMode: 'immediate',
        creatorWallet: '', updatedAt: new Date().toISOString(),
      })), { pair })
      const page = await context.newPage(); console.log('VIEWPORT', width)
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      await page.goto(`${base}/farms?create=1`, { waitUntil: 'domcontentloaded', timeout: 120000 })
      console.log('NAVIGATED', width); const modal = page.getByTestId('create-farm-modal')
      await modal.waitFor({ timeout: 15000 }).catch(async e => { console.log('PAGE_DEBUG', (await page.locator('body').innerText()).slice(-3500), errors); await page.screenshot({path: '/private/tmp/farm-blocked.png'}); throw e }); console.log('MODAL',width)
      await modal.locator('[role=option]').first().waitFor({ timeout: 15000 }).catch(async e => { console.log('MODAL_DEBUG', await modal.innerText(), errors); throw e })
      // Dismiss the pre-existing Next development error overlay through its own UI, if present.
      const devClose = page.locator('nextjs-portal').getByRole('button', { name: 'Close', exact: true })
      if (await devClose.count()) {
        await page.getByTestId('create-farm-modal-close').click()
        await modal.waitFor({state: 'hidden'})
        if (await devClose.count()) await devClose.click()
        await page.getByTestId('farms-hero-create-farm').click()
        await modal.waitFor()
      }
      await page.evaluate(() => Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 3000))])); console.log('MEASURING',width)
      await page.waitForTimeout(500)
      const m = await page.evaluate(() => {
        const get = id => document.querySelector(`[data-testid="${id}"]`)
        const box = e => { const r = e.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height } }
        const modal = get('create-farm-modal'), search = get('public-farm-pair-query'), selector = get('public-farm-pair-search')
        const list = get('create-farm-pair-dropdown'), status = get('public-farm-eligibility'), review = get('create-farm-review-panel')
        const sb = box(selector), lb = box(list), inputStyle = getComputedStyle(search)
        const cards = [...list.querySelectorAll('[role="option"]')].map(e => ({ ...box(e), text: e.innerText, overflow: e.scrollWidth > e.clientWidth + 1 }))
        const overflow = [...modal.querySelectorAll('*')].filter(e => e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 1 && !['INPUT', 'svg', 'path'].includes(e.tagName)).map(e => ({ testId: e.dataset.testid, tag: e.tagName, width: e.clientWidth, scrollWidth: e.scrollWidth }))
        return { modal: box(modal), search: box(search), selector: sb, list: lb, status: box(status), review: box(review),
          close: box(get('create-farm-modal-close')), label: box(selector.querySelector('span')),
          searchPosition: inputStyle.position, searchTransform: inputStyle.transform, searchBoxSizing: inputStyle.boxSizing,
          cards, visibleCards: cards.filter(c => c.bottom > lb.top && c.top < lb.bottom), overflow,
          documentOverflow: document.documentElement.scrollWidth > innerWidth,
          listOverflow: list.scrollWidth > list.clientWidth + 1, listScrollable: list.scrollHeight > list.clientHeight,
          bodyOverflowY: getComputedStyle(modal.querySelector('[data-melega-modal-body]')).overflowY,
          reviewText: review.innerText,
        }
      })
      await page.screenshot({ path: path.join(__dirname, phase === 'before' ? `before-farm-modal-${width}.png` : `farm-modal-${width}.png`) })
      const inside = (a, b) => a.left >= b.left - .5 && a.right <= b.right + .5 && a.top >= b.top - .5 && a.bottom <= b.bottom + .5
      const intersects = (a, b) => Math.min(a.right, b.right) > Math.max(a.left, b.left) + .5 && Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top) + .5
      const prefix = `${width}x${height}: `
      check(inside(m.search, m.selector), prefix + 'search contained')
      check(['static', 'relative'].includes(m.searchPosition) && m.searchTransform === 'none' && m.searchBoxSizing === 'border-box', prefix + 'search normal flow')
      check(m.label.bottom <= m.search.top && m.search.bottom <= m.list.top, prefix + 'label/search/list vertical order')
      check(!intersects(m.selector, m.status), prefix + 'selector/status separated')
      check(!intersects(m.status, m.review), prefix + 'status/review separated')
      check(!intersects(m.search, m.status) && !intersects(m.list, m.status), prefix + 'search/list/status separated')
      check(m.visibleCards.length > 0, prefix + 'actual LP cards visible')
      check(m.cards.every(c => inside(c, { ...m.list, top: -Infinity, bottom: Infinity }) && !c.overflow), prefix + 'all LP rows fit horizontally')
      check(!m.documentOverflow && !m.listOverflow && m.overflow.length === 0, prefix + 'no horizontal overflow')
      check(inside(m.modal, { left: 0, top: 0, right: width, bottom: height }), prefix + 'modal fits viewport')
      check(m.reviewText.includes('ACTIVATION FLOW') && m.review.width >= 280, prefix + 'review readable')
      if (width >= 1280) {
        check(Math.abs(m.modal.width - Math.min(1360, width - 32)) < 1, prefix + 'Farm width overrides shared shell in production')
        check(m.selector.width >= 280 && m.visibleCards.every(c => c.width >= 260), prefix + 'desktop selector/cards minimum widths')
        check(m.selector.right <= m.status.left && m.status.right <= m.review.left, prefix + 'three desktop columns')
      } else {
        check(m.selector.bottom <= m.status.top && m.status.bottom <= m.review.top, prefix + 'mobile selector/status/review order')
        check(m.cards.every(c => Math.abs(c.width - m.list.width) < 2), prefix + 'mobile full-width cards')
      }
      const cta = page.getByTestId('public-farm-inline-liquidity-open')
      await cta.scrollIntoViewIfNeeded()
      const scroll = await cta.evaluate(el => {
        const r = el.getBoundingClientRect(), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
        const modal = document.querySelector('[data-testid="create-farm-modal"]')
        const body = modal.querySelector('[data-melega-modal-body]')
        const close = document.querySelector('[data-testid="create-farm-modal-close"]'), cb = close.getBoundingClientRect()
        const closeHit = document.elementFromPoint(cb.left + cb.width / 2, cb.top + cb.height / 2)
        return { reachable: r.top >= 0 && r.bottom <= innerHeight && (el === hit || el.contains(hit)), bodyScrollTop: body.scrollTop,
          bodyScrollable: body.scrollHeight > body.clientHeight, pageScrollY: scrollY,
          closeVisible: cb.top >= 0 && cb.bottom <= innerHeight && (close === closeHit || close.contains(closeHit)), closeTop: cb.top }
      })
      check(scroll.reachable && ['auto', 'scroll'].includes(m.bodyOverflowY), prefix + 'CTA reachable through internal scrolling')
      check(scroll.closeVisible && Math.abs(scroll.closeTop - m.close.top) < 1, prefix + 'close visible/stable after scroll')
      check(scroll.pageScrollY === 0, prefix + 'page remains stationary')
      await page.screenshot({ path: path.join(__dirname, `${phase}-farm-modal-${width}-cta.png`) })
      await page.getByTestId('create-farm-review-panel').scrollIntoViewIfNeeded()
      await page.screenshot({ path: path.join(__dirname, `${phase}-farm-modal-${width}-review.png`) })
      // Selection is exercised after geometry capture, with the real existing UI handler.
      if (phase !== 'before') {
        await page.getByTestId('public-farm-pair-query').fill('M01')
        const option = modal.getByRole('option').first()
        await option.click()
        await page.waitForFunction(() => document.querySelector('[data-testid="create-farm-review-panel"]').textContent.includes('M01/ZLT'))
        check(!errors.some(e => /setPairDropdownOpen/.test(e)), prefix + 'selection has no stale dropdown setter error')
      }
      await page.getByTestId('create-farm-modal-close').click()
      await modal.waitFor({ state: 'hidden' })
      results.push({ width, height, ...m, scroll, pageErrors: errors })
      await context.close()
    }
  } finally {
    fs.writeFileSync(path.join(__dirname, `${phase}-geometry.json`), JSON.stringify({ results, failures }, null, 2))
    await browser.close()
  }
  console.log(JSON.stringify({ phase, viewports: results.map(m => ({ width: m.width, selector: m.selector.width, minCard: Math.min(...m.cards.map(c => c.width)), searchPosition: m.searchPosition, cta: m.scroll.reachable })), failures }, null, 2))
  if (failures.length) process.exitCode = 1
})().catch(error => { console.error(error); process.exitCode = 1 })
