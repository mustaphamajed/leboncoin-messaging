import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { conversationKeys } from '@/features/conversations'
import { conversations } from '@/test/fixtures'
import { server } from '@/test/msw/server'
import { apiUrl } from '@/test/msw/utils'
import { renderRoute } from '@/test/renderRoute'

const getSidebar = () => screen.getByRole('complementary', { name: 'Conversations' })
const findUserButtons = async () => within(await screen.findByRole('main')).findAllByRole('button')

describe('NewConversation', () => {
  it('is reachable from the conversation list', async () => {
    const { user } = renderRoute('/')

    await user.click(await screen.findByRole('link', { name: 'New conversation' }))

    expect(await screen.findByRole('heading', { name: 'New conversation' })).toBeInTheDocument()
  })

  it('lists the other users alphabetically and flags existing conversations', async () => {
    renderRoute('/conversations/new')

    const buttons = await findUserButtons()

    expect(buttons.map((button) => button.textContent)).toEqual([
      'EElodieOpen conversation',
      'JJeremieOpen conversation',
      'PPatrick',
    ])
  })

  it('filters users by nickname', async () => {
    const { user } = renderRoute('/conversations/new')

    await user.type(await screen.findByRole('searchbox', { name: 'Search users' }), 'pat')

    expect((await findUserButtons()).map((button) => button.textContent)).toEqual(['PPatrick'])

    await user.clear(screen.getByRole('searchbox'))
    await user.type(screen.getByRole('searchbox'), 'zzz')

    expect(await screen.findByText('No user matches “zzz”.')).toBeInTheDocument()
  })

  it('opens the existing conversation instead of creating a duplicate', async () => {
    let created = false
    server.use(
      http.post(apiUrl('/conversations/:userId'), () => {
        created = true
        return HttpResponse.json({ id: 99 })
      }),
    )
    const { user, router } = renderRoute('/conversations/new')

    await user.click(await screen.findByRole('button', { name: /Jeremie/ }))

    expect(await screen.findByRole('log', { name: 'Messages with Jeremie' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/conversations/1')
    expect(created).toBe(false)
  })

  it('creates a conversation, opens it and adds it to the list', async () => {
    let body: unknown
    server.use(
      http.post(apiUrl('/conversations/1'), async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ id: 4 })
      }),
    )
    const { user, router } = renderRoute('/conversations/new')

    await user.click(await screen.findByRole('button', { name: /Patrick/ }))

    expect(await screen.findByRole('heading', { name: 'Patrick', level: 2 })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/conversations/4')
    expect(within(getSidebar()).getByRole('link', { name: /Patrick/ })).toHaveAttribute('aria-current', 'page')
    expect(body).toMatchObject({ senderId: 1, senderNickname: 'Thibaut', recipientId: 3, recipientNickname: 'Patrick' })
  })

  it('keeps the new conversation when the server does not return it yet', async () => {
    server.use(http.get(apiUrl('/conversations/:userId'), () => HttpResponse.json(conversations)))
    const { user, queryClient } = renderRoute('/conversations/new')

    await user.click(await screen.findByRole('button', { name: /Patrick/ }))
    await screen.findByRole('heading', { name: 'Patrick', level: 2 })

    await queryClient.refetchQueries({ queryKey: conversationKeys.all })

    expect(within(getSidebar()).getByRole('link', { name: /Patrick/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Patrick', level: 2 })).toBeInTheDocument()
  })

  it('keeps the new conversation after a page reload', async () => {
    server.use(http.get(apiUrl('/conversations/:userId'), () => HttpResponse.json(conversations)))
    const first = renderRoute('/conversations/new')

    await first.user.click(await screen.findByRole('button', { name: /Patrick/ }))
    await screen.findByRole('heading', { name: 'Patrick', level: 2 })
    first.unmount()

    renderRoute('/')

    expect(await within(getSidebar()).findByRole('link', { name: /Patrick/ })).toBeInTheDocument()
  })

  it('shows an error and stays on the page when the creation fails', async () => {
    server.use(http.post(apiUrl('/conversations/:userId'), () => new HttpResponse(null, { status: 503 })))
    const { user, router } = renderRoute('/conversations/new')

    await user.click(await screen.findByRole('button', { name: /Patrick/ }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not start the conversation.')
    expect(router.state.location.pathname).toBe('/conversations/new')
  })

  it('shows an error with a retry button when users cannot be loaded', async () => {
    server.use(http.get(apiUrl('/users'), () => new HttpResponse(null, { status: 503 }), { once: true }))
    const { user } = renderRoute('/conversations/new')

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Users unavailable')

    await user.click(within(alert).getByRole('button', { name: 'Try again' }))

    expect(await screen.findByRole('button', { name: /Patrick/ })).toBeInTheDocument()
  })

  it('invites users without conversations to start one', async () => {
    server.use(http.get(apiUrl('/conversations/:userId'), () => HttpResponse.json([])))
    const { user } = renderRoute('/')

    await user.click(await within(getSidebar()).findByRole('link', { name: 'Start a conversation' }))

    expect(await screen.findByRole('heading', { name: 'New conversation' })).toBeInTheDocument()
  })
})
