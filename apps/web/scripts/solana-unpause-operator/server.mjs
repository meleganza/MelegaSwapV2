import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { Connection, PublicKey, Transaction, TransactionInstruction } = require('../../../../node_modules/@solana/web3.js')

const ADMIN = 'BRhBJ8iX2wcMPKe4SqiPK2K3ZbegmVDEiWtiSFLJ1aRd'
const PROGRAM = 'Gti4f873FUw5jpMa4wnRVcZDjr5YwonZ1FcY8vXu2Wnm'
const STORE = '7L8x99W1yVVgtsu3wWy9DgD9ysnnfF4XXhdKhUrQxEuW'
const DATA_HEX = '377e57d99f4218c20300'
const RPC = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
const PORT = Number(process.env.SOLANA_UNPAUSE_OPERATOR_PORT || 8787)
const HOST = process.env.SOLANA_UNPAUSE_OPERATOR_HOST || '0.0.0.0'

const here = path.dirname(fileURLToPath(import.meta.url))
const html = fs.readFileSync(path.join(here, 'index.html'))
const web3 = fs.readFileSync(path.join(here, '../../../../node_modules/@solana/web3.js/lib/index.iife.min.js'))

function json(res, status, body) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(JSON.stringify(body))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      if (chunks.length === 0) return resolve({})
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

function assertAdmin(connectedPublicKey) {
  if (connectedPublicKey !== ADMIN) {
    throw new Error(`Connected wallet is not the certified OFT admin ${ADMIN}.`)
  }
}

function buildTx(recentBlockhash) {
  const tx = new Transaction({
    feePayer: new PublicKey(ADMIN),
    recentBlockhash,
  })
  tx.add(
    new TransactionInstruction({
      programId: new PublicKey(PROGRAM),
      keys: [
        { pubkey: new PublicKey(ADMIN), isSigner: true, isWritable: false },
        { pubkey: new PublicKey(STORE), isSigner: false, isWritable: true },
      ],
      data: Buffer.from(DATA_HEX, 'hex'),
    }),
  )
  return tx
}

function parsePaused(raw) {
  return raw[156] === 1
}

const connection = new Connection(RPC, 'confirmed')

async function preview() {
  const acc = await connection.getAccountInfo(new PublicKey(STORE))
  if (!acc) throw new Error('OFT store account was not found.')
  return {
    network: 'Solana Mainnet',
    signer: ADMIN,
    program: PROGRAM,
    store: STORE,
    instruction: 'set_oft_config / SetOftConfig',
    config: 'Paused(false)',
    paused: parsePaused(acc.data),
    targetPaused: false,
    peersUlnDvnMintUntouched: true,
  }
}

async function simulateExact(connectedPublicKey, encodedTx) {
  assertAdmin(connectedPublicKey)
  const { blockhash } = await connection.getLatestBlockhash('confirmed')
  const tx = encodedTx
    ? Transaction.from(Buffer.from(encodedTx, 'base64'))
    : buildTx(blockhash)
  if (tx.instructions.length !== 1) throw new Error('Transaction is not the single unpause instruction.')
  if (tx.instructions[0].programId.toBase58() !== PROGRAM) throw new Error('Program mismatch.')
  if (tx.instructions[0].data.toString('hex') !== DATA_HEX) throw new Error('Data is not Paused(false).')
  if (tx.feePayer?.toBase58() !== ADMIN) throw new Error('Fee payer is not the certified admin.')
  const sim = await connection.simulateTransaction(tx)
  const ok = sim.value.err == null
  return {
    ok,
    result: ok ? 'PASS' : 'FAIL',
    message: ok
      ? 'SetOftConfig Paused(false) simulated successfully. Peers/ULN/DVN/mint untouched.'
      : JSON.stringify(sim.value.err),
    logs: sim.value.logs || [],
    units: sim.value.unitsConsumed ?? null,
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`)
    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' })
      return res.end(html)
    }
    if (req.method === 'GET' && url.pathname === '/vendor/solana-web3.js') {
      res.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8', 'cache-control': 'public, max-age=3600' })
      return res.end(web3)
    }
    if (req.method === 'GET' && url.pathname === '/health') {
      return json(res, 200, { ok: true, service: 'marco-solana-unpause-operator' })
    }
    if (req.method === 'GET' && url.pathname === '/preview') {
      return json(res, 200, await preview())
    }
    if (req.method === 'POST' && url.pathname === '/simulate') {
      const body = await readBody(req)
      return json(res, 200, await simulateExact(body.connectedPublicKey, body.tx))
    }
    if (req.method === 'POST' && url.pathname === '/unsigned-tx') {
      const body = await readBody(req)
      assertAdmin(body.connectedPublicKey)
      const { blockhash } = await connection.getLatestBlockhash('confirmed')
      const tx = buildTx(blockhash)
      const serialized = tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64')
      const check = await simulateExact(body.connectedPublicKey, serialized)
      if (!check.ok) return json(res, 200, { ok: false, message: check.message })
      return json(res, 200, { ok: true, tx: serialized, blockhash })
    }
    json(res, 404, { error: 'NOT_FOUND' })
  } catch (error) {
    json(res, 200, { ok: false, result: 'FAIL', message: error instanceof Error ? error.message : 'Operator helper failed.' })
  }
})

server.listen(PORT, HOST, () => {
  console.log(`MARCO Solana unpause operator helper http://127.0.0.1:${PORT}/`)
})
