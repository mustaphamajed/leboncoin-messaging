import { Link, Outlet, useMatch } from 'react-router'
import { cn } from '@/lib'

// The URL decides which pane is visible: one at a time on mobile, side by side from the md breakpoint.
export function AppLayout() {
  const isConversationOpen = useMatch('/conversations/:conversationId') !== null

  return (
    <div className="flex h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:shadow-md"
      >
        Skip to main content
      </a>

      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 px-4">
        <Link to="/" className="text-xl font-bold text-brand">
          leboncoin
        </Link>
        <h1 className="text-lg font-semibold">Messages</h1>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          aria-label="Conversations"
          className={cn(
            'w-full flex-col border-gray-200 md:flex md:w-80 md:border-r lg:w-96',
            isConversationOpen ? 'hidden' : 'flex',
          )}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="font-semibold">Conversations</h2>
            <Link
              to="/conversations/new"
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-brand hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-brand"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" d="M12 5v14M5 12h14" />
              </svg>
              New conversation
            </Link>
          </div>
        </aside>

        <main
          id="main-content"
          tabIndex={-1}
          className={cn('min-w-0 flex-1 flex-col outline-none md:flex', isConversationOpen ? 'flex' : 'hidden')}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
