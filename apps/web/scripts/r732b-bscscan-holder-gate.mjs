#!/usr/bin/env node
/** R732B — BscScan holder count env gate. */
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB = path.resolve(__dirname, '..')
const MARCO = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
const OUT = path.resolve(__dirname, '../../../docs/runtime/R732B_BSCSCAN_GATE.json')

async function probeBscScanDirect(apiKey) {
  const url = `https://api.bscscan.com/api?module=token&action=tokenholdercount&contractaddress=${MARCO}&apikey=${apiKey}`
  const res = await fetch(url)
  const json = await res.json()
  return {
    httpStatus: res.status,
    apiStatus: json.status,
    message: json.message,
    count: json.result != null ? Number.parseInt(String(json.result), 10) : null,
    ok: json.status === '1' && json.result != null,
  }
}

async function probeLocalApi(baseUrl, apiKey) {
  const env = {
    ...process.env,
    NEXT_PUBLIC_BSCSCAN_API_KEY: apiKey,
    NEXT_PUBLIC_BSCSAN_API_KEY: '',
  }
  return new Promise((resolve, reject) => {
    const child = spawn(
      'node',
      [
        '-e',
        `
        const http = require('http');
        const handler = require('./.next/server/pages/api/holder-count.js').default;
        const server = http.createServer(async (req, res) => {
          const url = new URL(req.url, '${baseUrl}');
          await handler({ method: 'GET', query: Object.fromEntries(url.searchParams), headers: req.headers }, res);
        });
        server.listen(0, () => {
          const port = server.address().port;
          fetch('${baseUrl.replace(/\/$/, '')}:' + port + '/api/holder-count?chainId=56&address=${MARCO}')
            .then(r => r.json().then(j => ({ status: r.status, body: j })))
            .then(result => { server.close(); console.log(JSON.stringify(result)); })
            .catch(err => { server.close(); process.exit(1); });
        });
      `,
      ],
      { cwd: WEB, env, stdio: ['ignore', 'pipe', 'pipe'] },
    )
    let out = ''
    child.stdout.on('data', (d) => { out += d })
    child.on('close', (code) => {
      if (code !== 0) return reject(new Error('local api probe failed'))
      try {
        resolve(JSON.parse(out.trim()))
      } catch {
        reject(new Error(`invalid probe output: ${out}`))
      }
    })
  })
}

async function main() {
  const apiKey = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY?.trim() || process.env.NEXT_PUBLIC_BSCSAN_API_KEY?.trim()
  const envSource = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY
    ? 'NEXT_PUBLIC_BSCSCAN_API_KEY'
    : process.env.NEXT_PUBLIC_BSCSAN_API_KEY
      ? 'NEXT_PUBLIC_BSCSAN_API_KEY'
      : 'none'

  const report = {
    timestamp: new Date().toISOString(),
    envSource,
    canonicalEnvSet: Boolean(process.env.NEXT_PUBLIC_BSCSCAN_API_KEY?.trim()),
    typoEnvSet: Boolean(process.env.NEXT_PUBLIC_BSCSAN_API_KEY?.trim()),
    directProbe: apiKey ? await probeBscScanDirect(apiKey) : { skipped: true, reason: 'no_api_key_in_shell' },
    deploySha: null,
  }

  try {
    report.deploySha = (await import('child_process')).execSync('git rev-parse HEAD', { cwd: path.resolve(WEB, '../..') }).toString().trim()
  } catch {
    /* ignore */
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2))

  const failures = []
  if (!apiKey) failures.push('NEXT_PUBLIC_BSCSCAN_API_KEY not set in shell')
  if (apiKey && !report.directProbe.ok) failures.push(`BscScan API failed: ${report.directProbe.message ?? 'unknown'}`)
  if (envSource === 'NEXT_PUBLIC_BSCSAN_API_KEY') failures.push('typo env NEXT_PUBLIC_BSCSAN_API_KEY in use — rename to NEXT_PUBLIC_BSCSCAN_API_KEY in Vercel')

  console.log(JSON.stringify(report, null, 2))
  if (failures.length) {
    console.error('R732B FAIL:', failures.join('; '))
    process.exit(1)
  }
  console.log('R732B PASS')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
