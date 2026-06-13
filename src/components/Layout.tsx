import type { ReactNode } from 'react'
import logoUrl from '../assets/logo.svg'

interface LayoutProps {
  children: ReactNode
  statusText?: string
}

export default function Layout({ children, statusText }: LayoutProps) {
  return (
    <div className="flex h-svh flex-col bg-[#232544]">
      <header className="flex shrink-0 items-center justify-between border-b border-sidebar-border bg-gradient-to-r from-[#232544] via-[#2a2b4e] to-[#232544] px-4 h-14">
        <a href="#/" className="flex items-center gap-2.5 no-underline">
          <img src={logoUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
          <h1 className="text-xl font-semibold tracking-tight text-sidebar-fg">
            HaggisShare
          </h1>
        </a>

        <a
          href="#/faq"
          className="text-sm text-gray-400 no-underline transition-colors hover:text-white"
        >
          FAQ
        </a>
      </header>

      <main className="flex-1 overflow-y-auto editor-grid bg-[#1e1f38] app-scroll">
        {children}
      </main>

      <footer className="glass-solid flex h-7 shrink-0 items-center px-4 text-xs text-status-fg">
        {statusText ?? 'Ready'}
      </footer>
    </div>
  )
}
