import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Connection, PublicKey, Transaction, ComputeBudgetProgram } from '@solana/web3.js'
import { lzReceive } from '@layerzerolabs/lz-solana-sdk-v2'

const PORT = Number(process.env.RECOVER_20M_LZRECEIVE_OPERATOR_PORT || 8789)
const HOST = process.env.RECOVER_20M_LZRECEIVE_OPERATOR_HOST || '127.0.0.1'
const here = path.dirname(fileURLToPath(import.meta.url))
const html = fs.readFileSync(path.join(here, 'index.html'))

const INCIDENT = {
  sourceTx: '0xc7fe6e70ebe2554ec67c9145d73d5281e23c27f2ed03953c0c85d09db251b842',
  guid: '0x74157354ec7a936fadbb5fe2fd600ed79d32cd336d1a3a47c575ac8ff508625d',
  nonce: 3,
  srcEid: 30102,
  sender: '0x000000000000000000000000c92b49ddf9312cbfc01ad397963df915c7a2399e',
  store: '7L8x99W1yVVgtsu3wWy9DgD9ysnnfF4XXhdKhUrQxEuW',
  program: 'Gti4f873FUw5jpMa4wnRVcZDjr5YwonZ1FcY8vXu2Wnm',
  mint: '6SWgjmuTyPAcYYU77Mzf1gE6QA7ZcZsbsfiThz2cW1VF',
  owner: 'bBpaFvmGvGmYGwuvXRb6ZXNHYzra4ed6tt7qRp3WK7Y',
  ata: '65VwbdJcJw7Ln4xEFDtmB1K7YfutmMf7iFcPcP6JDTV5',
  payload: '0x08c1fb633a38e649e6cffe5d66552d016aa0f48778c09f1d6af378987b9f2d0b000012309ce54000',
  amountSd: 20_000_000_000_000n,
  treasury: '2LxBuA9o3AwNyFnXsqbZnKFzyuw9WarYydknQXQieRzb',
  tokenProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  ataProgram: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
}

const RPCS = [
  process.env.SOLANA_RPC_URL,
  'https://api.mainnet-beta.solana.com',
  'https://solana-rpc.publicnode.com',
].filter(Boolean)

function encodeBase58(bytes) {
  return new PublicKey(bytes).toBase58()
}

function parseStoreMintAndPaused(raw) {
  if (raw.length < 157) throw new Error('FAIL CLOSED — OFT store is truncated.')
  const mint = encodeBase58(raw.subarray(17, 49))
  const paused = raw[156] === 1
  return { mint, paused }
}

function hexToBytes(hex) {
  const value = hex.startsWith('0x') ? hex.slice(2) : hex
  if (value.length % 2 !== 0) throw new Error('FAIL CLOSED — invalid hex.')
  return Uint8Array.from(value.match(/../g).map((byte) => Number.parseInt(byte, 16)))
}

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(body))
}

async function connectRpc() {
  let lastError
  for (const url of RPCS) {
    try {
      const connection = new Connection(url, 'confirmed')
      await connection.getLatestBlockhash('confirmed')
      return connection
    } catch (error) {
      lastError = error
    }
  }
  throw lastError || new Error('Solana mainnet RPC is unavailable.')
}

function deriveAta() {
  const [ata] = PublicKey.findProgramAddressSync(
    [
      new PublicKey(INCIDENT.owner).toBuffer(),
      new PublicKey(INCIDENT.tokenProgram).toBuffer(),
      new PublicKey(INCIDENT.mint).toBuffer(),
    ],
    new PublicKey(INCIDENT.ataProgram),
  )
  if (ata.toBase58() !== INCIDENT.ata) {
    throw new Error(`FAIL CLOSED — derived ATA ${ata.toBase58()} != ${INCIDENT.ata}.`)
  }
  return ata
}

function derivePeer(store) {
  const eid = Buffer.alloc(4)
  eid.writeUInt32BE(INCIDENT.srcEid)
  return PublicKey.findProgramAddressSync(
    [Buffer.from('Peer'), new PublicKey(store).toBuffer(), eid],
    new PublicKey(INCIDENT.program),
  )[0]
}

function assertPinnedPacket() {
  const dest = hexToBytes(INCIDENT.payload).slice(0, 32)
  const amount = Buffer.from(hexToBytes(INCIDENT.payload).slice(32)).readBigUInt64BE()
  if (new PublicKey(dest).toBase58() !== INCIDENT.owner) {
    throw new Error('FAIL CLOSED — payload destination is not the incident owner.')
  }
  if (amount !== INCIDENT.amountSd) throw new Error('FAIL CLOSED — payload amount is not 20,000,000 MARCO.')
  if (INCIDENT.guid !== '0x74157354ec7a936fadbb5fe2fd600ed79d32cd336d1a3a47c575ac8ff508625d') {
    throw new Error('FAIL CLOSED — helper GUID was altered.')
  }
  if (INCIDENT.nonce !== 3) throw new Error('FAIL CLOSED — helper nonce was altered.')
}

async function assertCanonicalState(connection) {
  assertPinnedPacket()
  const ata = deriveAta()
  const ataInfo = await connection.getParsedAccountInfo(ata)
  if (!ataInfo.value) throw new Error('FAIL CLOSED — destination ATA is missing. Create it first.')
  const token = ataInfo.value.data?.parsed?.info
  if (token?.mint !== INCIDENT.mint) throw new Error('FAIL CLOSED — ATA mint mismatch.')
  if (token?.owner !== INCIDENT.owner) throw new Error('FAIL CLOSED — ATA owner mismatch.')

  const storeInfo = await connection.getAccountInfo(new PublicKey(INCIDENT.store))
  if (!storeInfo) throw new Error('FAIL CLOSED — OFT store missing.')
  if (storeInfo.owner.toBase58() !== INCIDENT.program) throw new Error('FAIL CLOSED — store owner is not the certified OFT program.')
  const store = parseStoreMintAndPaused(storeInfo.data)
  if (store.mint !== INCIDENT.mint) throw new Error('FAIL CLOSED — store mint mismatch.')
  if (store.paused) throw new Error('FAIL CLOSED — Solana OFT store is paused.')

  const peer = derivePeer(INCIDENT.store)
  const peerInfo = await connection.getAccountInfo(peer)
  if (!peerInfo) throw new Error('FAIL CLOSED — BNB peer account missing.')
  if (peerInfo.owner.toBase58() !== INCIDENT.program) throw new Error('FAIL CLOSED — peer owner is not the OFT program.')
  const peerHex = Buffer.from(peerInfo.data).toString('hex')
  if (!peerHex.includes('c92b49ddf9312cbfc01ad397963df915c7a2399e')) {
    throw new Error('FAIL CLOSED — peer is not the canonical BNB adapter.')
  }

  const mintInfo = await connection.getParsedAccountInfo(new PublicKey(INCIDENT.mint))
  const supply = mintInfo.value?.data?.parsed?.info?.supply
  return {
    ata: INCIDENT.ata,
    ataBalance: token?.tokenAmount?.uiAmountString || '0',
    mintSupply: supply || null,
    peer: peer.toBase58(),
    paused: false,
  }
}

function assertInstructionIsThisGuid(ix) {
  if (ix.programId.toBase58() !== INCIDENT.program) {
    throw new Error('FAIL CLOSED — instruction program is not the certified OFT.')
  }
  const dataHex = Buffer.from(ix.data).toString('hex')
  const guidHex = INCIDENT.guid.slice(2)
  if (!dataHex.includes(guidHex)) throw new Error('FAIL CLOSED — built instruction does not contain this GUID.')
  const keys = ix.keys.map((key) => key.pubkey.toBase58())
  if (!keys.includes(INCIDENT.store)) throw new Error('FAIL CLOSED — store missing from lzReceive.')
  if (!keys.includes(INCIDENT.mint)) throw new Error('FAIL CLOSED — mint missing from lzReceive.')
  if (!keys.includes(INCIDENT.ata)) throw new Error('FAIL CLOSED — ATA missing from lzReceive.')
  if (!keys.includes(INCIDENT.owner)) throw new Error('FAIL CLOSED — destination owner missing from lzReceive.')
}

async function prepare(payer) {
  if (!payer) throw new Error('Connect a Solana fee payer.')
  new PublicKey(payer)
  const connection = await connectRpc()
  const state = await assertCanonicalState(connection)
  const ix = await lzReceive(
    connection,
    new PublicKey(payer),
    {
      srcEid: INCIDENT.srcEid,
      sender: INCIDENT.sender,
      nonce: String(INCIDENT.nonce),
      guid: INCIDENT.guid,
      receiver: INCIDENT.store,
      message: INCIDENT.payload,
    },
    Uint8Array.from([0, 0]),
    'confirmed',
  )
  assertInstructionIsThisGuid(ix)
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
  const tx = new Transaction({ feePayer: new PublicKey(payer), blockhash, lastValidBlockHeight })
  tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }))
  tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50_000 }))
  tx.add(ix)
  if (tx.instructions.length !== 3) throw new Error('FAIL CLOSED — unexpected instruction count.')
  if (tx.instructions[2].programId.toBase58() !== INCIDENT.program) {
    throw new Error('FAIL CLOSED — third instruction is not lzReceive.')
  }
  const sim = await connection.simulateTransaction(tx)
  const ok = sim.value.err == null
  return {
    ok,
    state,
    payer,
    guid: INCIDENT.guid,
    nonce: INCIDENT.nonce,
    sourceTx: INCIDENT.sourceTx,
    treasuryPreferred: payer === INCIDENT.treasury,
    simulationError: ok ? null : sim.value.err,
    logs: sim.value.logs || [],
    txBase64: tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64'),
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`)
  try {
    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' })
      return res.end(html)
    }
    if (req.method === 'GET' && url.pathname === '/health') {
      return json(res, 200, { ok: true, service: 'marco-20m-lzreceive-operator', guid: INCIDENT.guid, nonce: INCIDENT.nonce })
    }
    if (req.method === 'GET' && url.pathname === '/status') {
      const connection = await connectRpc()
      const state = await assertCanonicalState(connection)
      return json(res, 200, { ok: true, guid: INCIDENT.guid, nonce: INCIDENT.nonce, ...state })
    }
    if (req.method === 'POST' && url.pathname === '/prepare') {
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
      const prepared = await prepare(body.payer)
      return json(res, prepared.ok ? 200 : 409, prepared)
    }
    json(res, 404, { error: 'NOT_FOUND' })
  } catch (error) {
    json(res, 500, { ok: false, error: error instanceof Error ? error.message : 'Operator helper failed.' })
  }
})

server.listen(PORT, HOST, () => {
  console.log(`Open on this Mac: http://127.0.0.1:${PORT}/`)
  console.log(`Permissionless lzReceive for GUID ${INCIDENT.guid} only. Does not resend BNB.`)
})
