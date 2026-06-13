import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import { useViewerPeer } from '../hooks/usePeerSession'
import { decodeParams, derivePeerId } from '../utils/crypto'
import Layout from './Layout'

interface Props {
  encodedParams?: string
}

export default function ViewerPage({ encodedParams }: Props) {
  const { remoteStream, connectionState, error, sessionEnded, connect, disconnect } = useViewerPeer()
  const [inputUrl, setInputUrl] = useState('')
  const [inputError, setInputError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const initRef = useRef(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }, [])

  const decodedParams = useMemo(
    () => (encodedParams ? decodeParams(encodedParams) : null),
    [encodedParams],
  )

  const urlError = encodedParams && !decodedParams ? 'Invalid session link' : null
  const displayError = inputError || urlError

  useEffect(() => {
    if (initRef.current || !decodedParams) return
    initRef.current = true
    derivePeerId(decodedParams).then(connect)
  }, [decodedParams, connect])

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  const handleConnect = async () => {
    let raw = inputUrl.trim()
    if (raw.includes('#/view/')) {
      raw = raw.split('#/view/')[1]
    }
    const params = decodeParams(raw)
    if (!params) {
      setInputError('Invalid URL or session code')
      return
    }
    setInputError(null)
    initRef.current = true
    const peerId = await derivePeerId(params)
    connect(peerId)
  }

  if (connectionState === 'connected' && remoteStream) {
    return (
      <Layout statusText="Connected">
        <div
          ref={containerRef}
          className="relative flex min-h-full items-center justify-center bg-black/20"
        >
          <div className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full bg-green-900/60 px-3 py-1.5 text-sm text-green-300 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            Connected
          </div>
          <div className="flex w-full max-w-5xl flex-col items-center gap-4 p-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg bg-black object-contain max-h-[calc(100dvh-12rem)]"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={toggleFullscreen}
                className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white transition-colors hover:bg-white/20"
              >
                {isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
              </button>
              <button
                onClick={disconnect}
                className="rounded-lg bg-danger px-4 py-2 text-sm text-white transition-colors hover:bg-danger-hover"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (connectionState === 'connecting') {
    return (
      <Layout statusText="Connecting…">
        <div className="flex min-h-full flex-col items-center justify-center gap-4">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-accent" />
          <p className="text-gray-400">Connecting...</p>
        </div>
      </Layout>
    )
  }

  if (sessionEnded) {
    return (
      <Layout statusText="Session ended">
        <div className="flex min-h-full flex-col items-center justify-center gap-4">
          <div className="glass rounded-xl px-6 py-4 text-center">
            <p className="text-sidebar-fg">Session ended</p>
          </div>
          <a href="#/" className="glass rounded-lg px-6 py-3 text-sm font-medium text-sidebar-fg transition-colors hover:bg-white/15">
            Back Home
          </a>
        </div>
      </Layout>
    )
  }

  if (connectionState === 'failed') {
    return (
      <Layout statusText={error ?? 'Connection failed'}>
        <div className="flex min-h-full flex-col items-center justify-center gap-4">
          <div className="glass rounded-xl px-6 py-4 text-center">
            <p className="text-red-400">{error || 'Connection failed'}</p>
          </div>
          <button
            onClick={() => { initRef.current = false }}
            className="glass rounded-lg px-6 py-3 text-sm font-medium text-sidebar-fg transition-colors hover:bg-white/15"
          >
            Try Again
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout statusText="Paste a session URL to connect">
      <div className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center gap-6 p-4">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-semibold text-white">View a Shared Screen</h2>
          <p className="text-gray-400">
            Paste the URL or session code you received from the sharer.
          </p>
        </div>
        <div className="w-full">
          <input
            value={inputUrl}
            onChange={e => { setInputUrl(e.target.value); setInputError(null) }}
            onKeyDown={e => e.key === 'Enter' && handleConnect()}
            placeholder="Paste session URL or code…"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sidebar-fg placeholder-gray-500 outline-none transition-colors focus:border-accent"
          />
          {displayError && (
            <p className="mt-1 text-sm text-red-400">{displayError}</p>
          )}
        </div>
        <button
          onClick={handleConnect}
          className="glass rounded-xl px-8 py-3 font-semibold text-white transition-all hover:bg-white/15"
        >
          Connect
        </button>
      </div>
    </Layout>
  )
}
