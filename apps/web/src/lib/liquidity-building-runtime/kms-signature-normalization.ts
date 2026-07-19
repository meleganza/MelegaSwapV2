/**
 * LB010 — KMS ECDSA DER → Ethereum 65-byte signature normalization.
 *
 * Pure cryptographic adapter: no private keys, no broadcast, no KMS credentials.
 * Production signing still requires a provisioned non-exportable authority (LB-G03B).
 *
 * Pipeline:
 *   KMS DER (DIGEST semantics assumed already applied to EIP-712 digest)
 *   → ASN.1 decode → r,s
 *   → scalar bounds → low-s
 *   → recovery ID (0|1) → verify recovered address
 *   → 65-byte r||s||v (v = 27|28 for OpenZeppelin ECDSA)
 */

import { ecdsaRecover, publicKeyConvert } from 'ethereum-cryptography/secp256k1'
import { keccak256 } from 'ethereum-cryptography/keccak'

export const SECP256K1_N = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141')
export const SECP256K1_HALF_N = SECP256K1_N / 2n

export type NormalizeErrorCode =
  | 'MALFORMED_HEX'
  | 'INVALID_ASN1_SEQUENCE'
  | 'INVALID_INTEGER_TAG'
  | 'TRUNCATED_SIGNATURE'
  | 'NEGATIVE_INTEGER'
  | 'OVERSIZED_INTEGER'
  | 'ZERO_R'
  | 'ZERO_S'
  | 'R_OUT_OF_RANGE'
  | 'S_OUT_OF_RANGE'
  | 'RECOVERY_FAILED'
  | 'WRONG_AUTHORITY'
  | 'DIGEST_INVALID'
  | 'MUTATED_DIGEST'

export type NormalizeOk = {
  ok: true
  r: bigint
  s: bigint
  recoveryId: 0 | 1
  v: 27 | 28
  signature65: string
  recoveredAddress: string
  highSNormalized: boolean
}

export type NormalizeErr = {
  ok: false
  code: NormalizeErrorCode
  reason: string
}

export type NormalizeResult = NormalizeOk | NormalizeErr

function strip0x(h: string): string {
  return h.startsWith('0x') || h.startsWith('0X') ? h.slice(2) : h
}

function hexToBytes(hex: string): Uint8Array | null {
  const s = strip0x(hex)
  if (!/^[0-9a-fA-F]*$/.test(s) || s.length % 2 !== 0) return null
  const out = new Uint8Array(s.length / 2)
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(s.slice(i * 2, i * 2 + 2), 16)
  }
  return out
}

function bytesToHex(buf: Uint8Array): string {
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function readLen(buf: Uint8Array, i: number): { len: number; next: number } | null {
  if (i >= buf.length) return null
  const first = buf[i]
  if (first < 0x80) return { len: first, next: i + 1 }
  const n = first & 0x7f
  if (n === 0 || n > 2 || i + n >= buf.length) return null
  let len = 0
  for (let k = 0; k < n; k++) len = (len << 8) | buf[i + 1 + k]
  return { len, next: i + 1 + n }
}

function parseDerInteger(
  buf: Uint8Array,
  i: number,
): { value: bigint; next: number; error?: NormalizeErrorCode } {
  if (i >= buf.length || buf[i] !== 0x02) {
    return { value: 0n, next: i, error: 'INVALID_INTEGER_TAG' }
  }
  const lenInfo = readLen(buf, i + 1)
  if (!lenInfo) return { value: 0n, next: i, error: 'TRUNCATED_SIGNATURE' }
  const { len, next } = lenInfo
  if (next + len > buf.length) return { value: 0n, next: i, error: 'TRUNCATED_SIGNATURE' }
  if (len === 0) return { value: 0n, next: i, error: 'TRUNCATED_SIGNATURE' }
  const slice = buf.subarray(next, next + len)
  if (slice[0] & 0x80) return { value: 0n, next: i, error: 'NEGATIVE_INTEGER' }
  if (len > 33) return { value: 0n, next: i, error: 'OVERSIZED_INTEGER' }
  if (len === 33 && slice[0] !== 0x00) return { value: 0n, next: i, error: 'OVERSIZED_INTEGER' }
  let hex = bytesToHex(slice)
  while (hex.length > 2 && hex.startsWith('00')) hex = hex.slice(2)
  const value = BigInt('0x' + (hex || '0'))
  return { value, next: next + len }
}

/**
 * Decode secp256k1 ECDSA signature from DER (no private key).
 */
export function decodeDerSignature(derHex: string): NormalizeResult {
  const buf = hexToBytes(derHex)
  if (!buf) return { ok: false, code: 'MALFORMED_HEX', reason: 'Invalid hex' }
  if (buf.length < 2) return { ok: false, code: 'TRUNCATED_SIGNATURE', reason: 'Too short' }
  if (buf[0] !== 0x30) return { ok: false, code: 'INVALID_ASN1_SEQUENCE', reason: 'Expected SEQUENCE' }
  const seqLen = readLen(buf, 1)
  if (!seqLen) return { ok: false, code: 'TRUNCATED_SIGNATURE', reason: 'Bad sequence length' }
  if (seqLen.next + seqLen.len > buf.length) {
    return { ok: false, code: 'TRUNCATED_SIGNATURE', reason: 'Sequence length overrun' }
  }
  if (seqLen.next + seqLen.len < buf.length) {
    return { ok: false, code: 'INVALID_ASN1_SEQUENCE', reason: 'Trailing bytes after SEQUENCE' }
  }

  const rParsed = parseDerInteger(buf, seqLen.next)
  if (rParsed.error) return { ok: false, code: rParsed.error, reason: `r: ${rParsed.error}` }
  const sParsed = parseDerInteger(buf, rParsed.next)
  if (sParsed.error) return { ok: false, code: sParsed.error, reason: `s: ${sParsed.error}` }
  if (sParsed.next !== buf.length) {
    return { ok: false, code: 'INVALID_ASN1_SEQUENCE', reason: 'Unexpected trailing content' }
  }

  const r = rParsed.value
  let s = sParsed.value
  if (r === 0n) return { ok: false, code: 'ZERO_R', reason: 'r == 0' }
  if (s === 0n) return { ok: false, code: 'ZERO_S', reason: 's == 0' }
  if (r >= SECP256K1_N) return { ok: false, code: 'R_OUT_OF_RANGE', reason: 'r >= n' }
  if (s >= SECP256K1_N) return { ok: false, code: 'S_OUT_OF_RANGE', reason: 's >= n' }

  let highSNormalized = false
  if (s > SECP256K1_HALF_N) {
    s = SECP256K1_N - s
    highSNormalized = true
  }

  return {
    ok: true,
    r,
    s,
    recoveryId: 0,
    v: 27,
    signature65: encodeSignature65(r, s, 27),
    recoveredAddress: '0x0000000000000000000000000000000000000000',
    highSNormalized,
  }
}

export function encodeSignature65(r: bigint, s: bigint, v: 27 | 28): string {
  const rb = r.toString(16).padStart(64, '0')
  const sb = s.toString(16).padStart(64, '0')
  const vb = v.toString(16).padStart(2, '0')
  return `0x${rb}${sb}${vb}`
}

function bigintTo32(bytes: bigint): Uint8Array {
  const hex = bytes.toString(16).padStart(64, '0')
  return hexToBytes(hex)!
}

function pubkeyToAddress(pubUncompressed: Uint8Array): string {
  let pub = pubUncompressed
  if (pub.length === 33) {
    pub = publicKeyConvert(pub, false)
  }
  const body = pub.length === 65 && pub[0] === 0x04 ? pub.subarray(1) : pub
  const hash = keccak256(Buffer.from(body))
  return `0x${bytesToHex(hash.subarray(12))}`.toLowerCase()
}

/**
 * Full normalization: DER → low-s → recover → match expected authority → 65-byte sig.
 */
export function normalizeKmsDerSignature(args: {
  derSignature: string
  /** 32-byte EIP-712 digest (already hashed) */
  digest: string
  expectedAuthority: string
}): NormalizeResult {
  const digestBytes = hexToBytes(args.digest)
  if (!digestBytes || digestBytes.length !== 32) {
    return { ok: false, code: 'DIGEST_INVALID', reason: 'Digest must be 32 bytes' }
  }

  const decoded = decodeDerSignature(args.derSignature)
  if (!decoded.ok) return decoded

  const compact = new Uint8Array(64)
  compact.set(bigintTo32(decoded.r), 0)
  compact.set(bigintTo32(decoded.s), 32)

  const expected = args.expectedAuthority.toLowerCase()
  let recoveredAddress: string | null = null
  let recoveryId: 0 | 1 | null = null
  let otherAuthority: string | null = null

  for (const rid of [0, 1] as const) {
    try {
      const pub = ecdsaRecover(compact, rid, digestBytes, false)
      const addr = pubkeyToAddress(pub)
      if (addr === expected) {
        recoveredAddress = addr
        recoveryId = rid
        break
      }
      otherAuthority = addr
    } catch {
      // try next recovery id
    }
  }

  if (recoveryId === null || !recoveredAddress) {
    if (otherAuthority) {
      return {
        ok: false,
        code: 'WRONG_AUTHORITY',
        reason: `Recovered ${otherAuthority}, expected ${expected}`,
      }
    }
    return { ok: false, code: 'RECOVERY_FAILED', reason: 'Both recovery IDs failed' }
  }

  const v = (27 + recoveryId) as 27 | 28
  return {
    ok: true,
    r: decoded.r,
    s: decoded.s,
    recoveryId,
    v,
    signature65: encodeSignature65(decoded.r, decoded.s, v),
    recoveredAddress,
    highSNormalized: decoded.highSNormalized,
  }
}

/** Encode r,s as DER for test vectors (no signing). */
export function encodeDerSignature(r: bigint, s: bigint): string {
  const encInt = (x: bigint): Uint8Array => {
    let hex = x.toString(16)
    if (hex.length % 2) hex = '0' + hex
    let bytes = hexToBytes(hex)!
    if (bytes[0] & 0x80) {
      const prefixed = new Uint8Array(bytes.length + 1)
      prefixed[0] = 0x00
      prefixed.set(bytes, 1)
      bytes = prefixed
    }
    const out = new Uint8Array(2 + bytes.length)
    out[0] = 0x02
    out[1] = bytes.length
    out.set(bytes, 2)
    return out
  }
  const rb = encInt(r)
  const sb = encInt(s)
  const bodyLen = rb.length + sb.length
  const out = new Uint8Array(2 + bodyLen)
  out[0] = 0x30
  out[1] = bodyLen
  out.set(rb, 2)
  out.set(sb, 2 + rb.length)
  return `0x${bytesToHex(out)}`
}

export type SignatureNormalizationStatus =
  | 'IMPLEMENTED_AWAITING_PRODUCTION_AUTHORITY'
  | 'VERIFIED'
  | 'NOT_IMPLEMENTED'

export function signatureNormalizationProductionStatus(): {
  status: SignatureNormalizationStatus
  blocker: string
} {
  return {
    status: 'IMPLEMENTED_AWAITING_PRODUCTION_AUTHORITY',
    blocker: 'LB-G03B/LB-G11: module ready; production KMS authority not provisioned',
  }
}
