import Layout from './Layout'

export default function HomePage() {
  return (
    <Layout statusText="Choose an option to get started">
      <div className="flex min-h-full flex-col items-center justify-center gap-10 p-4">
        <div className="text-center">
          <h2 className="mb-3 text-4xl font-bold tracking-tight text-white">
            Share your screen
          </h2>
          <p className="text-base text-gray-400">
            Peer-to-peer. No accounts. No servers.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <a
            href="#/share"
            className="glass inline-flex cursor-pointer items-center gap-2.5 rounded-xl px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white/15"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
            </svg>
            Share Your Screen
          </a>

          <a
            href="#/view"
            className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-semibold text-sidebar-fg transition-all hover:bg-white/10"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            View a Screen
          </a>
        </div>
      </div>
    </Layout>
  )
}
