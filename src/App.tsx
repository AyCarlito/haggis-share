import { useState, useEffect } from 'react'
import HomePage from './components/HomePage'
import SharerPage from './components/SharerPage'
import ViewerPage from './components/ViewerPage'

type Route =
  | { type: 'home' }
  | { type: 'share' }
  | { type: 'view'; params?: string }

function parseHash(): Route {
  const hash = window.location.hash.slice(1)
  if (hash.startsWith('/share')) return { type: 'share' }
  if (hash.startsWith('/view/')) {
    const params = hash.slice('/view/'.length)
    return { type: 'view', params: params || undefined }
  }
  if (hash === '/view') return { type: 'view' }
  return { type: 'home' }
}

export default function App() {
  const [route, setRoute] = useState<Route>(parseHash)

  useEffect(() => {
    const onHash = () => setRoute(parseHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  switch (route.type) {
    case 'share':
      return <SharerPage />
    case 'view':
      return <ViewerPage encodedParams={route.params} />
    default:
      return <HomePage />
  }
}
