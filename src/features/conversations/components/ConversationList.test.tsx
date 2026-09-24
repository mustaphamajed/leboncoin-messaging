import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/msw/server'
import { apiUrl } from '@/test/msw/utils'
import { renderRoute } from '@/test/renderRoute'

const getSidebar = () => screen.getByRole('complementary', { name: 'Conversations' })
const findConversationLinks = async () => within(await within(getSidebar()).findByRole('list')).getAllByRole('link')

describe('ConversationList', () => {
  it('lists conversations by most recent, named after the other participant', async () => {
    renderRoute('/')

    const links = await findConversationLinks()

    expect(links.map((link) => link.textContent)).toEqual([
      expect.stringContaining('Elodie'),
      expect.stringContaining('Jeremie'),
    ])
  })

  it('links each conversation to its page', async () => {
    renderRoute('/')

    const link = await within(getSidebar()).findByRole('link', { name: /Jeremie/ })

    expect(link).toHaveAttribute('href', '/conversations/1')
  })

  it('shows the date of the last message', async () => {
    renderRoute('/')

    const link = await within(getSidebar()).findByRole('link', { name: /Jeremie/ })

    expect(within(link).getByText('7 juil. 2021')).toHaveAttribute('datetime', '2021-07-07T06:04:09.000Z')
  })

  it('shows a loading state while fetching', async () => {
    renderRoute('/')

    expect(within(getSidebar()).getByRole('status')).toHaveTextContent('Chargement des conversations')
    await findConversationLinks()
  })

  it('shows an empty state when the user has no conversation', async () => {
    server.use(http.get(apiUrl('/conversations/:userId'), () => HttpResponse.json([])))
    renderRoute('/')

    expect(await within(getSidebar()).findByRole('heading', { name: 'Aucune conversation pour le moment' })).toBeInTheDocument()
  })

  it('shows an error with a retry button when the server fails', async () => {
    server.use(http.get(apiUrl('/conversations/:userId'), () => new HttpResponse(null, { status: 503 }), { once: true }))
    const { user } = renderRoute('/')

    const alert = await within(getSidebar()).findByRole('alert')
    expect(alert).toHaveTextContent('Conversations indisponibles')

    await user.click(within(alert).getByRole('button', { name: 'Réessayer' }))

    expect(await findConversationLinks()).toHaveLength(2)
  })

  it('opens the conversation on click and marks it as current', async () => {
    const { user } = renderRoute('/')

    await user.click(await within(getSidebar()).findByRole('link', { name: /Jeremie/ }))

    expect(await screen.findByRole('heading', { name: 'Jeremie' })).toBeInTheDocument()
    expect(within(getSidebar()).getByRole('link', { name: /Jeremie/ })).toHaveAttribute('aria-current', 'page')
  })
})
