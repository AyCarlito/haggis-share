import { useEffect, useRef, useState, useCallback } from 'react'
import Peer from 'peerjs'
import type { MediaConnection } from 'peerjs'
import type { ConnectionState } from '../types'

/* Chrome 109+: CaptureController prevents auto-switch to the captured tab */
interface CaptureController {
  setFocusBehavior(focusBehavior: 'focus-captured-surface' | 'no-focus-change'): void
}

interface DisplayMediaOptions {
  video: boolean | MediaTrackConstraints
  audio: boolean | MediaTrackConstraints
  controller?: CaptureController
}

export function useSharerPeer() {
  const [peerId, setPeerId] = useState<string | null>(null)
  const [viewerCount, setViewerCount] = useState(0)
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const peerRef = useRef<Peer | null>(null)
  const screenRef = useRef<MediaStream | null>(null)
  const callsRef = useRef<Map<string, MediaConnection>>(new Map())

  const stopSharing = useCallback(() => {
    for (const [, call] of callsRef.current) call.close()
    callsRef.current.clear()
    setViewerCount(0)

    if (screenRef.current) {
      screenRef.current.getTracks().forEach(t => t.stop())
      screenRef.current = null
    }

    if (peerRef.current) {
      peerRef.current.destroy()
      peerRef.current = null
    }

    setScreenStream(null)
    setPeerId(null)
    setConnectionState('disconnected')
  }, [])

  const startSharing = useCallback(async (targetPeerId: string) => {
    setError(null)
    setConnectionState('connecting')

    try {
      let captureController: CaptureController | undefined
      try {
        const cc = new (window as unknown as { CaptureController: new () => CaptureController }).CaptureController()
        cc.setFocusBehavior('no-focus-change')
        captureController = cc
      } catch {
        // CaptureController not available — fallback to window.focus()
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
        controller: captureController,
      } as DisplayMediaOptions)

      if (!captureController) {
        window.focus()
      }
      screenRef.current = stream
      setScreenStream(stream)
      stream.getVideoTracks()[0]?.addEventListener('ended', stopSharing)

      const peer = new Peer(targetPeerId)

      peer.on('open', () => {
        setPeerId(targetPeerId)
        setConnectionState('connected')
      })

      peer.on('call', (call) => {
        call.answer(screenRef.current!)
        const pid = call.peer
        callsRef.current.set(pid, call)
        setViewerCount(callsRef.current.size)
        call.on('close', () => {
          callsRef.current.delete(pid)
          setViewerCount(callsRef.current.size)
        })
      })

      peer.on('error', (err) => {
        setError(err.message)
        setConnectionState('failed')
      })

      peerRef.current = peer
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Screen sharing permission was denied')
      } else {
        setError(msg)
      }
      setConnectionState('failed')
    }
  }, [stopSharing])

  useEffect(() => {
    const calls = callsRef.current
    const screen = screenRef.current
    const peer = peerRef.current
    return () => {
      for (const [, call] of calls) call.close()
      if (screen) screen.getTracks().forEach(t => t.stop())
      if (peer) peer.destroy()
    }
  }, [])

  return { peerId, viewerCount, connectionState, error, screenStream, startSharing, stopSharing }
}

export function useViewerPeer() {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [sessionEnded, setSessionEnded] = useState(false)
  const peerRef = useRef<Peer | null>(null)
  const callRef = useRef<MediaConnection | null>(null)
  const connectRef = useRef(false)

  const disconnect = useCallback(() => {
    connectRef.current = false
    if (callRef.current) { callRef.current.close(); callRef.current = null }
    if (peerRef.current) { peerRef.current.destroy(); peerRef.current = null }
    setRemoteStream(null)
    setConnectionState('idle')
    setSessionEnded(false)
  }, [])

  const connect = useCallback(async (sharerPeerId: string) => {
    if (connectRef.current) return
    connectRef.current = true
    setError(null)
    setConnectionState('connecting')
    setSessionEnded(false)

    try {
      const peer = new Peer()

      peer.on('open', () => {
        const call = peer.call(sharerPeerId, new MediaStream())
        callRef.current = call

        call.on('stream', (stream) => {
          setRemoteStream(stream)
          setConnectionState('connected')
        })

        call.on('close', () => {
          connectRef.current = false
          setRemoteStream(null)
          setConnectionState('disconnected')
          setSessionEnded(true)
        })

        call.on('error', (err) => {
          connectRef.current = false
          setError(err.message)
          setConnectionState('failed')
        })
      })

      peer.on('error', (err) => {
        connectRef.current = false
        setError(err.message)
        setConnectionState('failed')
      })

      peerRef.current = peer
    } catch (err: unknown) {
      connectRef.current = false
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      setConnectionState('failed')
    }
  }, [])

  useEffect(() => {
    return () => {
      if (callRef.current) callRef.current.close()
      if (peerRef.current) peerRef.current.destroy()
    }
  }, [])

  return { remoteStream, connectionState, error, sessionEnded, connect, disconnect }
}
