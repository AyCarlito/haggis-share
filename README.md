# haggis-share

Browser based peer-to-peer screen sharing.

A sharer generates a session URL and sends it to a viewer. The viewer opens the URL and sees the sharer's selected browser tab, window, or entire screen in real time via WebRTC.

PeerJS Cloud signaling server handles peer discovery.

## How It Works

1. **Share** — Click "Share Your Screen", select a tab/window/screen via the browser prompt. A session URL is generated.
2. **Send** — Copy the URL and send it to the intended viewer.
3. **View** — The viewer opens the URL. The connection succeeds only if the session, timestamp, and user agent match the sharer's.
4. **Monitor** — The sharer sees a live viewer count when someone connects.
5. **End** — The sharer clicks "End Session". All connections drop, the URL stops working.

## Usage

### Sharing a screen

1. Open the app at `#/share`
2. Click **Start Sharing**
3. In the browser prompt, select a tab, window, or entire screen
4. Copy the generated URL and send it to your viewer
5. Monitor the viewer count; click **End Session** when done

### Viewing a screen

- Open the session URL directly, or
- Open the app at `#/view` and paste the session URL/code into the input field

## Commands

```sh
npm install       # install dependencies
npm run dev       # start dev server (usually http://localhost:5173)
npm run build     # production build
npm run preview   # preview production build
npm run lint      # run ESLint
```

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19 |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"`) |
| Bundler | Vite 8 with `@tailwindcss/vite` |
| P2P | PeerJS 1.5 (WebRTC abstraction) |
| Language | TypeScript ~6.0 |
| Linter | ESLint 10 |
