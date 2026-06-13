import { useRef, useState, useEffect } from 'react'
import { useSharerPeer } from '../hooks/usePeerSession'
import { createSession, encodeParams } from '../utils/crypto'

export default function SharerPage() {
  const { viewerCount, connectionState, error, screenStream, startSharing, stopSharing } = useSharerPeer()
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const startedRef = useRef(false)

  const handleStart = async () => {
    if (startedRef.current) return
    startedRef.current = true
    const { params, peerId } = await createSession()
    const encoded = encodeParams(params)
    const url = `${window.location.origin}${window.location.pathname}#/view/${encoded}`
    setShareUrl(url)
    startSharing(peerId)
  }

  const handleCopy = async () => {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEnd = () => {
    startedRef.current = false
    stopSharing()
  }

    useEffect(() => {
    if (videoRef.current && screenStream) {
      videoRef.current.srcObject = screenStream
    }
  }, [screenStream])

  useEffect(() => {
    if (connectionState !== 'failed' && connectionState !== 'disconnected') return
    startedRef.current = false
  }, [connectionState])

  if (connectionState === 'failed') {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
        <div className="rounded-xl bg-red-900/40 px-6 py-4 text-center">
          <p className="text-red-400">{error}</p>
        </div>
        <a
          href="#/"
          className="rounded-lg bg-gray-800 px-6 py-3 text-gray-200 transition-colors hover:bg-gray-700"
        >
          Back Home
        </a>
      </div>
    )
  }

  if (screenStream) {
    return (
      <div className="mx-auto flex min-h-svh max-w-2xl flex-col items-center gap-6 p-6">
        <div className="flex items-center gap-3">
          <span className={`h-3 w-3 animate-pulse rounded-full ${connectionState === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <h2 className="text-xl font-semibold text-white">
            {connectionState === 'connected' ? 'Screen Sharing Active' : 'Connecting...'}
          </h2>
        </div>

        <div className="w-full overflow-hidden rounded-xl bg-gray-900">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="max-h-64 w-full object-contain"
          />
        </div>

        <div className="w-full rounded-xl border border-gray-800 bg-gray-900/50 p-4">
          <p className="mb-2 text-sm text-gray-400">Share this URL:</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={shareUrl ?? ''}
              className="min-w-0 flex-1 rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-200"
            />
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-300">
          <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          {viewerCount > 0 ? (
            <span>
              <span className="font-semibold text-green-400">{viewerCount}</span> viewer{viewerCount > 1 ? 's' : ''} watching
            </span>
          ) : (
            <span className="text-gray-500">Waiting for viewer...</span>
          )}
        </div>

        <button
          onClick={handleEnd}
          className="mt-4 rounded-lg bg-red-700 px-8 py-3 font-semibold text-white transition-colors hover:bg-red-600"
        >
          End Session
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-4">
      <h2 className="text-2xl font-semibold text-white">Share Your Screen</h2>
      <p className="text-center text-gray-400">
        When you click start, you will be prompted to select a browser tab, window, or your entire screen to share.
      </p>
      <button
        onClick={handleStart}
        disabled={connectionState === 'connecting'}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {connectionState === 'connecting' ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Starting...
          </>
        ) : (
          'Start Sharing'
        )}
      </button>
    </div>
  )
}
