// AES-GCM encryption / decryption using WebCrypto. No dependencies.
// Output format for encrypted messages:
//   base64(salt[16] || iv[12] || ciphertext || tag)
// Key is derived from the passphrase via PBKDF2-SHA256 (200k iterations).

const ITERATIONS = 200_000
const SALT_BYTES = 16
const IV_BYTES = 12
const KEY_BITS = 256

const enc = new TextEncoder()
const dec = new TextDecoder()

function toB64(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}

function fromB64(b64: string): Uint8Array {
  const bin = atob(b64.trim())
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

// TS 5.7 tightened Uint8Array<ArrayBufferLike> vs BufferSource<ArrayBuffer>.
// Our buffers are always backed by ArrayBuffer (not SharedArrayBuffer), so a
// narrow cast at the WebCrypto boundary is safe.
function asBuf(u: Uint8Array): Uint8Array<ArrayBuffer> {
  return u as Uint8Array<ArrayBuffer>
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    asBuf(enc.encode(passphrase)),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: asBuf(salt), iterations: ITERATIONS, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: KEY_BITS },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encrypt(plaintext: string, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const key = await deriveKey(passphrase, salt)
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: asBuf(iv) }, key, asBuf(enc.encode(plaintext))),
  )
  const blob = new Uint8Array(salt.length + iv.length + ct.length)
  blob.set(salt, 0)
  blob.set(iv, salt.length)
  blob.set(ct, salt.length + iv.length)
  return toB64(blob)
}

export async function decrypt(encoded: string, passphrase: string): Promise<string> {
  const blob = fromB64(encoded)
  if (blob.length < SALT_BYTES + IV_BYTES + 16) {
    throw new Error('Payload is too short to be a valid AES-GCM message')
  }
  const salt = blob.slice(0, SALT_BYTES)
  const iv = blob.slice(SALT_BYTES, SALT_BYTES + IV_BYTES)
  const ct = blob.slice(SALT_BYTES + IV_BYTES)
  const key = await deriveKey(passphrase, salt)
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: asBuf(iv) }, key, asBuf(ct))
  return dec.decode(pt)
}
