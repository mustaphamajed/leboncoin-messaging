import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { messages } from '@/test/fixtures'
import { server } from '@/test/msw/server'
import { apiUrl } from '@/test/msw/utils'
import { renderRoute } from '@/test/renderRoute'

const findMessageLog = () => screen.findByRole('log', { name: 'Messages avec Jeremie' })

describe('ConversationView', () => {
  it('shows the other participant and the date of the last message in the header', async () => {
    renderRoute('/conversations/1')

    const header = (await screen.findByRole('heading', { name: 'Jeremie' })).closest('header')!

    expect(within(header).getByText(/Dernier message/)).toHaveTextContent('Dernier message : 7 juil. 2021')
    await waitFor(() => expect(document.title).toBe('Jeremie · Messages · leboncoin'))
  })

  it('shows the messages in chronological order with their author', async () => {
    server.use(http.get(apiUrl('/messages/1'), () => HttpResponse.json(messages.toReversed())))
    renderRoute('/conversations/1')

    const items = within(await findMessageLog()).getAllByRole('listitem')

    expect(items.map((item) => item.textContent)).toEqual([
      'Mercredi 7 juillet 2021',
      'Vous : Bonjour06:04',
      expect.stringContaining('Jeremie : Salut !'),
    ])
  })

  it('shows an empty state when the conversation has no message', async () => {
    renderRoute('/conversations/3')

    expect(await screen.findByRole('heading', { name: 'Aucun message pour le moment' })).toBeInTheDocument()
    expect(screen.getByText('Dites bonjour à Elodie !')).toBeInTheDocument()
  })

  it('does not load messages of a conversation the user is not part of', async () => {
    let messagesRequested = false
    server.use(
      http.get(apiUrl('/messages/:conversationId'), () => {
        messagesRequested = true
        return HttpResponse.json([])
      }),
    )
    renderRoute('/conversations/1', { userId: 3 })

    expect(await screen.findByRole('heading', { name: 'Conversation introuvable' })).toBeInTheDocument()
    expect(messagesRequested).toBe(false)
  })

  it.each(['abc', '0', '-1', '1.5'])('shows a not found state for the invalid conversation id "%s"', async (id) => {
    renderRoute(`/conversations/${id}`)

    expect(await screen.findByRole('heading', { name: 'Conversation introuvable' })).toBeInTheDocument()
  })

  it('shows an error with a retry button when messages fail to load', async () => {
    server.use(http.get(apiUrl('/messages/1'), () => new HttpResponse(null, { status: 503 }), { once: true }))
    const { user } = renderRoute('/conversations/1')

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Messages indisponibles')

    await user.click(within(alert).getByRole('button', { name: 'Réessayer' }))

    expect(await findMessageLog()).toBeInTheDocument()
  })

  it('shows an error when the conversation cannot be loaded', async () => {
    server.use(http.get(apiUrl('/conversations/:userId'), () => HttpResponse.error()))
    renderRoute('/conversations/1')

    const main = await screen.findByRole('main')

    expect(await within(main).findByRole('alert')).toHaveTextContent('Conversation indisponible')
  })

  it('offers a way back to the list on small screens', async () => {
    const { user } = renderRoute('/conversations/1')

    await user.click(await screen.findByRole('link', { name: 'Retour aux conversations' }))

    expect(await screen.findByRole('heading', { name: 'Sélectionnez une conversation' })).toBeInTheDocument()
  })
})
