export interface SessionParams {
  sessionId: string
  timestamp: string
  uaDigest: string
}

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'failed'
