import type { RouteObject } from 'react-router'
import { FullPageSpinner, RouteErrorBoundary } from '@/components'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { SelectConversationPage } from '@/pages/SelectConversationPage'
import { AppLayout } from './AppLayout'

export const routes: RouteObject[] = [
  {
    path: '/',
    Component: AppLayout,
    HydrateFallback: FullPageSpinner,
    ErrorBoundary: RouteErrorBoundary,
    children: [
      { index: true, Component: SelectConversationPage },
      {
        path: 'conversations/:conversationId',
        ErrorBoundary: RouteErrorBoundary,
        lazy: async () => ({ Component: (await import('@/pages/ConversationPage')).ConversationPage }),
      },
    ],
  },
  { path: '*', Component: NotFoundPage },
]
