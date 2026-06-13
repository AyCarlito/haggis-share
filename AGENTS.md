# Rules

- Every type and function you add must be documented in that same source file.
- Be honest about what you don't know, never assume.
- Always ask clarifying questions when uncertain.

## Tech Stack

- **React 19** — `createRoot`, `StrictMode`
- **Tailwind CSS v4** — CSS-first config via `@import "tailwindcss"`; no `tailwind.config.js`
- **Vite 8** — build tool with `@tailwindcss/vite` and `@vitejs/plugin-react`
- **PeerJS 1.5** — WebRTC abstraction, uses PeerJS Cloud (`0.peerjs.com`) for signaling
- **TypeScript ~6.0** — strict mode, ES2022 target
- **ESLint 10** — with `eslint-plugin-react-hooks` (includes `react-hooks/set-state-in-effect` and `react-hooks/refs` rules)

## Project Structure

```
src/
├── main.tsx                        # Entry: createRoot + StrictMode
├── App.tsx                         # Hash-based router
├── index.css                       # @import "tailwindcss"
├── types.ts                        # SessionParams, ConnectionState
├── utils/
│   └── crypto.ts                   # SHA-256, createSession(), derivePeerId()
├── hooks/
│   └── usePeerSession.ts           # useSharerPeer() + useViewerPeer()
├── components/
│   ├── HomePage.tsx                # Landing with two CTAs
│   ├── SharerPage.tsx              # Screen share UI
│   └── ViewerPage.tsx              # View shared screen
└── assets/                         # (any static assets)
```

## Routes (hash-based, no router lib)

| Hash | Component | Description |
|---|---|---|
| `#/` | `HomePage` | Choose Share or View |
| `#/share` | `SharerPage` | Start sharing screen |
| `#/view` | `ViewerPage` | Input for session code |
| `#/view/<params>` | `ViewerPage` | Auto-connects using params |

Route parsing is in `App.tsx` — `parseHash()` reads `window.location.hash`.

## Session URL Format

```
#/view/<sessionId>:<timestamp>:<uaDigest>
```

- `sessionId`: `crypto.randomUUID()`
- `timestamp`: `Date.now().toString()` (epoch ms)
- `uaDigest`: first 16 hex chars of `sha256(navigator.userAgent)`

## Peer ID Derivation (Multi-Factor Hash)

```
peerId = "hag-" + sha256(sessionId + ":" + timestamp + ":" + uaDigest).slice(0, 20)
```

Created in `utils/crypto.ts:createSession()`. Both sharer and viewer derive the identical peer ID from the URL params.

## PeerJS Architecture

**Sharer (`useSharerPeer`):**
1. Calls `getDisplayMedia()` for screen capture
2. Creates Peer with the derived peer ID
3. Listens for `peer.on('call')` → `call.answer(screenStream)`
4. Tracks active calls in a `Map<string, MediaConnection>` for viewer count
5. `stopSharing()`: closes all calls, stops media tracks, destroys peer

**Viewer (`useViewerPeer`):**
1. Creates Peer with random ID
2. Calls `peer.call(sharerPeerId, new MediaStream())`
3. Receives stream via `call.on('stream')`
4. `sessionEnded` state set inside `call.on('close')` (from remote peer drop)
5. `disconnect()`: closes call, destroys peer, resets to idle

**Important PeerJS caveats:**
- Only `Peer` (default export) is available at runtime. `MediaConnection` is type-only from `'peerjs'`.
- Always use `import type { MediaConnection } from 'peerjs'` for the type.

## State Machine

**Sharer:**
`idle` → `connecting` → `connected` → `disconnected` (on end)
`*` → `failed` (on error)

**Viewer:**
`idle` → `connecting` → `connected` → `disconnected` → `sessionEnded=true`
`*` → `failed` (on error)

## ESLint Rules to Follow

Two React 19-specific rules that will reject code:

1. **`react-hooks/set-state-in-effect`** — Never call `setState(...)` synchronously inside `useEffect`. If you need to derive state from a value that changes, compute it during render (using `useMemo`) or set it inside a callback (PeerJS event handler, DOM event handler, etc.).

2. **`react-hooks/refs`** — Never access `ref.current` during render (in JSX conditions or render-phase logic). Use state variables instead, or access refs only in effects and event handlers.

## Commands

```sh
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build (must pass both)
npm run lint      # ESLint (must pass with 0 errors)
npm run preview   # Preview production build
```

When making changes, always run `npm run build && npm run lint` to verify.

## Deployment

The project generates a fully static site in `dist/`. Deploy to any static CDN (Netlify, Vercel, Cloudflare Pages, etc.). No server or backend needed — PeerJS Cloud handles signaling.

For production at scale, consider self-hosting a PeerJS Server (`peers/peerjs-server`).

## Styling

- Tailwind CSS v4 utility classes only
- No custom CSS files (except `index.css` which is just `@import "tailwindcss"`)
- Dark theme throughout (`bg-gray-950`, `bg-gray-900`, `white`/`gray-400` text)
- Use `@theme` directives in `index.css` for any custom tokens
