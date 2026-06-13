# haggis-share

Peer-to-peer screen sharing as a static site. No backend, no accounts, no data stored — just a URL.

A sharer generates a session URL and sends it to a viewer. The viewer opens the URL and sees the sharer's selected browser tab, window, or entire screen in real time via WebRTC.

## How It Works

1. **Share** — Click "Share Your Screen", select a tab/window/screen via the browser prompt. A session URL is generated.
2. **Send** — Copy the URL and send it to the intended viewer (any channel: text, email, carrier pigeon).
3. **View** — The viewer opens the URL. The session URL contains a multi-factor hash derived from the session, timestamp, and user agent — only the intended recipient can view it.
4. **Monitor** — The sharer sees a live viewer count. When someone connects, they know.
5. **End** — The sharer clicks "End Session". All connections drop, the URL stops working.

## Architecture

```
┌──────────┐     PeerJS Cloud      ┌──────────┐
│  Sharer  │◄────────────────────►│  Viewer  │
│          │     (signaling)      │          │
│  PeerJS  │◄────────────────────►│  PeerJS  │
│  Peer    │     WebRTC (media)   │  Peer    │
└──────────┘                      └──────────┘
```

- **Signaling:** PeerJS Cloud (`0.peerjs.com`) — no server to run
- **Media:** Direct WebRTC peer-to-peer (STUN via Google's public servers)
- **Session binding:** `peerId = "hag-" + sha256(sessionId + ":" + timestamp + ":" + uaDigest)`
- **Routing:** Hash-based (`#/share`, `#/view/<params>`) — fully static, no server-side logic

## Quick Start

```sh
npm install
npm run dev        # → http://localhost:5173
npm run build      # → dist/ (static site)
npm run preview    # preview production build
```

## Usage

### Sharing a screen

1. Open the app at `#/share`
2. Click **Start Sharing**
3. In the browser prompt, select a tab, window, or entire screen
4. Copy the generated URL and send it to your viewer
5. Monitor the viewer count; click **End Session** when done

### Viewing a screen

- Open the session URL directly, OR
- Open the app at `#/view` and paste the session URL/code into the input field

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | TypeScript check + production build |
| `npm run lint` | ESLint |
| `npm run preview` | Preview production build locally |

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19 |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"`) |
| Bundler | Vite 8 with `@tailwindcss/vite` |
| P2P | PeerJS 1.5 (WebRTC abstraction) |
| Language | TypeScript ~6.0 |
| Linter | ESLint 10 |

## Deployment

The `dist/` directory is a fully static site. Deploy anywhere:

```sh
npm run build
# Upload dist/ to Netlify, Vercel, Cloudflare Pages, GitHub Pages, etc.
```

No server configuration needed. The PeerJS Cloud signaling server handles peer discovery.

For production at scale, consider [self-hosting PeerJS Server](https://github.com/peers/peerjs-server) to avoid cloud rate limits.

## Security Model

- Session URLs are **unguessable**: the peer ID is a SHA-256 hash of `randomUUID + timestamp + userAgent digest`
- No data is stored on any server — all media streams are direct P2P
- When the sharer ends the session, all connections terminate immediately
- The browser's `getDisplayMedia()` prompt lets the user choose exactly what to share

## Limitations

- Both peers must be online simultaneously
- NAT traversal depends on STUN; some restrictive networks may need a TURN server
- PeerJS Cloud has usage rate limits (acceptable for casual use; self-host for production)
