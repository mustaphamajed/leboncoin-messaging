import { QueryClient } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { AppProviders } from '@/app/providers'
import { routes } from '@/app/routes'

interface RenderRouteOptions {
  userId?: number
}

export function renderRoute(path: string, { userId = 1 }: RenderRouteOptions = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter(routes, { initialEntries: [path] })

  return {
    user: userEvent.setup(),
    router,
    queryClient,
    ...render(
      <AppProviders queryClient={queryClient} userId={userId}>
        <RouterProvider router={router} />
      </AppProviders>,
    ),
  }
}
