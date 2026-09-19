const { chromium } = require('playwright')
const fs = require('fs')
const output = process.env.BROWSER_EVIDENCE_DIR || 'acceptance/eth-remove/browser-evidence'
fs.mkdirSync(output, { recursive: true })
const before = process.argv.includes('--before')
async function rpc(method, params = []) {
  const r = await fetch('http://127.0.0.1:18545', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const j = await r.json()
  if (j.error) throw Error(JSON.stringify(j.error))
  return j.result
}
;(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  try {
    for (const chain of before ? [1] : [1, 56])
      for (const viewport of before
        ? [{ width: 1440, height: 1000 }]
        : [
            { width: 1440, height: 1000 },
            { width: 390, height: 844 },
          ]) {
        const snapshot = await rpc('evm_snapshot')
        const label = `${before ? 'before' : 'after'}-${chain}-${viewport.width}`
        const page = await browser.newPage({ viewport })
        const errors = []
        page.on('pageerror', (e) => errors.push(e.message))
        try {
          await page.goto(`http://127.0.0.1:4180/?chain=${chain}${chain === 1 ? '&fork=1' : ''}`)
          const approve = page.getByRole('button', { name: 'Approve LP Token', exact: true })
          await approve.waitFor({ timeout: 25000 })
          await page.screenshot({ path: `${output}/${label}-approve.png`, fullPage: true })
          await approve.click()
          await page.getByRole('button', { name: 'Approving LP Token…', exact: true }).waitFor({ timeout: 15000 })
          await page.getByTestId('settle').click()
          if (before) {
            await page.waitForTimeout(4000)
            await page.getByRole('button', { name: 'Approving LP Token…', exact: true }).waitFor()
            await page.screenshot({ path: `${output}/${label}-stuck.png`, fullPage: true })
          } else {
            const remove = page.getByRole('button', { name: 'Remove Liquidity', exact: true })
            await remove.waitFor({ timeout: 15000 })
            await remove.click()
            await page.getByRole('button', { name: 'Confirm Withdrawal', exact: true }).waitFor()
            await page.screenshot({ path: `${output}/${label}-review.png`, fullPage: true })
            await page.getByRole('button', { name: 'Confirm Withdrawal', exact: true }).click()
            await page
              .locator('[data-testid=liquidity-remove-confirm-body][data-remove-lifecycle=confirmed]')
              .waitFor({ timeout: 35000 })
            await page.screenshot({ path: `${output}/${label}-confirmed.png`, fullPage: true })
          }
          const evidence = await page.getByTestId('evidence').textContent()
          fs.writeFileSync(`${output}/${label}-evidence.json`, evidence)
          if (chain === 1 && !before && !evidence.includes('fork remove payload ready'))
            throw Error('Missing actual payload')
          if (errors.length) throw Error(errors.join('\n'))
          console.log(label, 'PASS')
        } catch (e) {
          console.log(label, await page.locator('body').innerText())
          throw e
        } finally {
          await page.close()
          await rpc('anvil_setAutomine', [true])
          await rpc('evm_revert', [snapshot])
        }
      }
  } finally {
    await browser.close()
  }
})().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
