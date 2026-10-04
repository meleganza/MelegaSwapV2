const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core')
const fs = require('fs')
const path = require('path')
const out = process.env.OUTPUT_DIR || '/private/tmp/swap-confirm-browser-results'
fs.mkdirSync(out,{recursive:true})
;(async()=>{
 const browser = await chromium.launch({channel:'chrome',headless:true})
 const results=[]
 try {
  for (const width of [1440,1280,390]) {
   const page = await browser.newPage({viewport:{width,height:width===390?844:900}})
   const errors=[]; page.on('pageerror',e=>errors.push(e.message))
   await page.goto('http://127.0.0.1:3121/')
   await page.getByRole('button',{name:'Swap MARCO-AARON'}).click()
   const confirm=page.getByRole('button',{name:'Confirm Swap',exact:true})
   await confirm.waitFor()
   await page.waitForTimeout(500)
   await confirm.evaluate(el=>window.originalConfirm=el)
   const boxes=[]
   for(let i=0;i<12;i++) { boxes.push(await confirm.boundingBox()); await page.waitForTimeout(120) }
   const same=await confirm.evaluate(el=>el===window.originalConfirm)
   const b=boxes.at(-1)
   await page.mouse.move(b.x+b.width/2,b.y+b.height/2)
   await page.mouse.down()
   await page.waitForTimeout(350)
   await page.mouse.up()
   const stats=await page.evaluate(()=>window.stats)
   const drift=Math.max(...boxes.map(x=>Math.max(Math.abs(x.x-boxes[0].x),Math.abs(x.y-boxes[0].y))))
   const result={width,sameButton:same,drift,stats,errors}
   results.push(result)
   await page.screenshot({path:path.join(out,`${width}.png`)})
   if(!same || drift>1 || stats.mounts!==1 || stats.unmounts!==0 || stats.correct!==1 || stats.wrong!==0 || errors.length) throw Error(JSON.stringify(result))
   await page.mouse.click(8, 8)
   await page.getByTestId('review').waitFor({state:'detached',timeout:3000})
   await page.getByRole('button',{name:'Swap MARCO-AARON'}).click()
   await confirm.click()
   if((await page.evaluate(()=>window.stats.correct))!==2) throw Error('Reopen/click failed')
   await page.close()
  }
 } finally { fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2)); await browser.close() }
 console.log(JSON.stringify(results,null,2))
})().catch(e=>{console.error(e);process.exit(1)})
