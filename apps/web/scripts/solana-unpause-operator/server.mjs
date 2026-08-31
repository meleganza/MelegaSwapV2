import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PORT = Number(process.env.SOLANA_UNPAUSE_OPERATOR_PORT || 8787)
const HOST = process.env.SOLANA_UNPAUSE_OPERATOR_HOST || '127.0.0.1'
const here = path.dirname(fileURLToPath(import.meta.url))
const html = fs.readFileSync(path.join(here, 'index.html'))

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`)
  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '/health')) {
    if (url.pathname === '/health') {
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
      return res.end(JSON.stringify({ ok: true, service: 'marco-solana-unpause-operator-static' }))
    }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' })
    return res.end(html)
  }
  res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify({ error: 'NOT_FOUND' }))
})

server.listen(PORT, HOST, () => {
  console.log(`Open on this machine: http://127.0.0.1:${PORT}/`)
})
