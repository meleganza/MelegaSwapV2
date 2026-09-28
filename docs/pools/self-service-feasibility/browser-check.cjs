const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const assert = require('assert/strict')
const fs = require('fs')
const path = require('path')
;(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true})
 const results=[]
 try {
  for(const [width,height] of [[1440,900],[390,844]]) {
   const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'})
   await page.goto('http://localhost:3118/pools?create=1&chain=56&view=explore#create-pool',{waitUntil:'domcontentloaded',timeout:120000})
   await page.waitForFunction(()=>!location.search.includes('create=')&&!location.hash.includes('create-pool'),null,{timeout:60000})
   await page.getByTestId('pools-hero-module').waitFor()
   // The development server may display an existing hydration overlay.
   const close=page.locator('nextjs-portal').getByRole('button',{name:'Close',exact:true})
   if(await close.count())await close.click()
   await page.waitForTimeout(1500)
   if(await close.count())await close.click()
   const state=await page.evaluate(()=>({url:location.href,wizard:!!document.querySelector('[data-ps-create-pool-builder]'),modal:!!document.querySelector('[data-testid="create-pool-modal"]'),actions:[...document.querySelectorAll('a,button')].filter(e=>/create\s+(staking\s+)?pool/i.test(e.textContent||'')).map(e=>e.textContent),deployerCopy:document.body.innerText.includes('Final deployment requires'),overflow:document.documentElement.scrollWidth>innerWidth,explore:!!document.querySelector('[data-testid="pools-explore-pools-module"]')}))
   assert.equal(state.wizard,false);assert.equal(state.modal,false);assert.deepEqual(state.actions,[]);assert.equal(state.deployerCopy,false);assert.equal(state.overflow,false);assert.equal(state.explore,true)
   await page.screenshot({path:path.join(__dirname,`pools-${width}.png`)})
   await page.getByRole('button',{name:'Open My Melega'}).click()
   await page.getByTestId('my-melega-drawer').waitFor()
   assert(!/Create Pool/i.test(await page.getByTestId('my-melega-drawer').innerText()))
   await page.screenshot({path:path.join(__dirname,`my-melega-${width}.png`)})
   results.push({width,height,...state,drawerCreatePool:false,wallet:'disconnected'})
   await page.close()
  }
 } finally {fs.writeFileSync(path.join(__dirname,'browser-results.json'),JSON.stringify(results,null,2));await browser.close()}
 console.log(results)
})().catch(e=>{console.error(e);process.exitCode=1})
