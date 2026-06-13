import type { SessionParams } from '../types'

export async function sha256(message: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message))
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function createSession(): Promise<{ params: SessionParams; peerId: string }> {
  const sessionId = crypto.randomUUID()
  const timestamp = Date.now().toString()
  const uaDigest = (await sha256(navigator.userAgent)).slice(0, 16)
  const params: SessionParams = { sessionId, timestamp, uaDigest }
  const peerId = await derivePeerId(params)
  return { params, peerId }
}

export async function derivePeerId(params: SessionParams): Promise<string> {
  const raw = `${params.sessionId}:${params.timestamp}:${params.uaDigest}`
  return 'hag-' + (await sha256(raw)).slice(0, 20)
}

export function encodeParams(params: SessionParams): string {
  return `${params.sessionId}:${params.timestamp}:${params.uaDigest}`
}

export function decodeParams(encoded: string): SessionParams | null {
  const parts = encoded.split(':')
  if (parts.length < 3) return null
  const [sessionId, timestamp, uaDigest] = parts
  if (!sessionId || !timestamp || !uaDigest) return null
  if (timestamp.length < 10) return null
  return { sessionId, timestamp, uaDigest }
}
