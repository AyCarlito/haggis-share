import { useRef, useEffect, useState, useMemo } from 'react'
import { useViewerPeer } from '../hooks/usePeerSession'
import { decodeParams, derivePeerId } from '../utils/crypto'

interface Props {
  encodedParams?: string
}

export default function ViewerPage({ encodedParams }: Props) {
  const { remoteStream, connectionState, error, sessionEnded, connect, disconnect } = useViewerPeer()
  const [inputUrl, setInputUrl] = useState('')
  const [inputError, setInputError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const decodedParams = useMemo(
    () => (encodedParams ? decodeParams(encodedParams) : null),
    [encodedParams],
  )

  const urlError = encodedParams && !decodedParams ? 'Invalid session link' : null
  const displayError = inputError || urlError

  useEffect(() => {
    if (!decodedParams) return
    derivePeerId(decodedParams).then(connect)
  }, [decodedParams, connect])

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream
      videoRef.current.play()
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
    const peerId = await derivePeerId(params)
    connect(peerId)
  }

  if (connectionState === 'connected' && remoteStream) {
    return (
      <div className="flex min-h-svh flex-col">
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full bg-green-900/60 px-3 py-1.5 text-sm text-green-300 backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          Connected
        </div>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="h-svh w-full object-contain bg-black"
        />
        <button
          onClick={disconnect}
          className="absolute bottom-4 right-4 z-10 rounded-lg bg-red-700 px-4 py-2 text-sm text-white transition-colors hover:bg-red-600"
        >
          Disconnect
        </button>
      </div>
    )
  }

  if (connectionState === 'connecting') {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-gray-700 border-t-indigo-500" />
        <p className="text-gray-400">Connecting...</p>
      </div>
    )
  }

  if (sessionEnded) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4">
        <div className="rounded-xl bg-gray-900 px-6 py-4 text-center">
          <p className="text-gray-300">Session ended</p>
        </div>
        <a href="#/" className="rounded-lg bg-gray-800 px-6 py-3 text-gray-200 transition-colors hover:bg-gray-700">
          Back Home
        </a>
      </div>
    )
  }

  if (connectionState === 'failed') {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4">
        <div className="rounded-xl bg-red-900/40 px-6 py-4 text-center">
          <p className="text-red-400">{error || 'Connection failed'}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-gray-800 px-6 py-3 text-gray-200 transition-colors hover:bg-gray-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center gap-6 p-4">
      <h2 className="text-2xl font-semibold text-white">View a Shared Screen</h2>
      <p className="text-center text-gray-400">
        Paste the URL or session code you received from the sharer.
      </p>
      <div className="w-full">
        <input
          value={inputUrl}
          onChange={e => { setInputUrl(e.target.value); setInputError(null) }}
          onKeyDown={e => e.key === 'Enter' && handleConnect()}
          placeholder="https://... or session code"
          className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-gray-200 placeholder-gray-500 outline-none transition-colors focus:border-indigo-500"
        />
        {displayError && (
          <p className="mt-1 text-sm text-red-400">{displayError}</p>
        )}
      </div>
      <button
        onClick={handleConnect}
        className="rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-indigo-500"
      >
        Connect
      </button>
    </div>
  )
}
