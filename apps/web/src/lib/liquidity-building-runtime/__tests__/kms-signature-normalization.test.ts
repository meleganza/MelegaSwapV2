/**
 * TEST-ONLY vectors for KMS DER normalization.
 * Ephemeral secp256k1 keys generated in-process — NEVER production authority.
 */
import { describe, expect, it } from 'vitest'
import {
  createPrivateKeySync,
  ecdsaSign,
  publicKeyCreate,
  signatureExport,
} from 'ethereum-cryptography/secp256k1'
import { keccak256 } from 'ethereum-cryptography/keccak'
import {
  SECP256K1_HALF_N,
  SECP256K1_N,
  decodeDerSignature,
  encodeDerSignature,
  normalizeKmsDerSignature,
  signatureNormalizationProductionStatus,
} from '../kms-signature-normalization'

function addrFromPk(pk: Uint8Array): string {
  const pub = publicKeyCreate(pk, false)
  const hash = keccak256(Buffer.from(pub.slice(1)))
  return (
    '0x' +
    Array.from(hash.subarray(12))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  ).toLowerCase()
}

function digestOf(label: string): Uint8Array {
  return keccak256(Buffer.from(label, 'utf8'))
}

function toHex(b: Uint8Array): string {
  return (
    '0x' +
    Array.from(b)
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
  )
}

describe('LB010 KMS signature normalization', () => {
  it('valid KMS DER → 65-byte Ethereum signature matching authority', () => {
    // TEST-ONLY ephemeral key — not production
    const pk = createPrivateKeySync()
    const authority = addrFromPk(pk)
    const digest = digestOf('lb010-valid-intent')
    const signed = ecdsaSign(digest, pk)
    const der = signatureExport(signed.signature)
    const result = normalizeKmsDerSignature({
      derSignature: toHex(der),
      digest: toHex(digest),
      expectedAuthority: authority,
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.signature65.length).toBe(132) // 0x + 130 hex = 65 bytes
    expect(result.recoveredAddress).toBe(authority)
    expect([27, 28]).toContain(result.v)
  })

  it('leading-zero r/s DER integers decode', () => {
    const r = 1n
    const s = SECP256K1_HALF_N
    const der = encodeDerSignature(r, s)
    const d = decodeDerSignature(der)
    expect(d.ok).toBe(true)
    if (d.ok) {
      expect(d.r).toBe(1n)
      expect(d.s).toBe(s)
    }
  })

  it('high-s normalization', () => {
    const r = 2n
    const highS = SECP256K1_N - 5n
    expect(highS > SECP256K1_HALF_N).toBe(true)
    const d = decodeDerSignature(encodeDerSignature(r, highS))
    expect(d.ok).toBe(true)
    if (d.ok) {
      expect(d.highSNormalized).toBe(true)
      expect(d.s).toBe(5n)
    }
  })

  it('invalid ASN.1 sequence', () => {
    const r = decodeDerSignature('0x3100')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.code).toBe('INVALID_ASN1_SEQUENCE')
  })

  it('invalid integer tag', () => {
    // SEQUENCE length 4: 0x03 (wrong tag) ...
    const r = decodeDerSignature('0x300403010001')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.code).toBe('INVALID_INTEGER_TAG')
  })

  it('truncated signature', () => {
    const r = decodeDerSignature('0x3006')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(['TRUNCATED_SIGNATURE', 'INVALID_INTEGER_TAG']).toContain(r.code)
  })

  it('r equal to zero', () => {
    const r = decodeDerSignature(encodeDerSignature(0n, 5n))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.code).toBe('ZERO_R')
  })

  it('s equal to zero', () => {
    const r = decodeDerSignature(encodeDerSignature(5n, 0n))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.code).toBe('ZERO_S')
  })

  it('r outside curve order', () => {
    const r = decodeDerSignature(encodeDerSignature(SECP256K1_N, 5n))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.code).toBe('R_OUT_OF_RANGE')
  })

  it('s outside curve order', () => {
    const r = decodeDerSignature(encodeDerSignature(5n, SECP256K1_N))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.code).toBe('S_OUT_OF_RANGE')
  })

  it('wrong authority recovered', () => {
    const pk = createPrivateKeySync()
    const digest = digestOf('lb010-wrong-auth')
    const signed = ecdsaSign(digest, pk)
    const der = signatureExport(signed.signature)
    const result = normalizeKmsDerSignature({
      derSignature: toHex(der),
      digest: toHex(digest),
      expectedAuthority: '0x1111111111111111111111111111111111111111',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.code).toBe('WRONG_AUTHORITY')
  })

  it('mutated digest rejected (wrong authority or recovery fail)', () => {
    const pk = createPrivateKeySync()
    const authority = addrFromPk(pk)
    const digest = digestOf('lb010-mut-digest')
    const signed = ecdsaSign(digest, pk)
    const der = signatureExport(signed.signature)
    const mutated = digestOf('lb010-mut-digest-OTHER')
    const result = normalizeKmsDerSignature({
      derSignature: toHex(der),
      digest: toHex(mutated),
      expectedAuthority: authority,
    })
    expect(result.ok).toBe(false)
  })

  it('production status remains awaiting authority', () => {
    const s = signatureNormalizationProductionStatus()
    expect(s.status).toBe('IMPLEMENTED_AWAITING_PRODUCTION_AUTHORITY')
    expect(s.blocker).toContain('LB-G03B')
  })
})
