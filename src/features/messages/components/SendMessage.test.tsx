import { onlineManager } from '@tanstack/react-query'
import { act, screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { MESSAGE_MAX_LENGTH } from '@/services'
import { db } from '@/test/msw/db'
import { server } from '@/test/msw/server'
import { apiUrl } from '@/test/msw/utils'
import { renderRoute } from '@/test/renderRoute'

const getComposer = () => screen.findByRole('textbox', { name: 'Message à Jeremie' })
const getMessageLog = () => screen.findByRole('log', { name: 'Messages avec Jeremie' })

function deferredResponse() {
  let resolve!: () => void
  const released = new Promise<void>((r) => (resolve = r))
  return { released, release: () => resolve() }
}

describe('sending a message', () => {
  it('sends the message on Enter, shows it in the conversation and clears the input', async () => {
    let body: unknown
    server.use(
      http.post(apiUrl('/messages/1'), async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ id: 50 })
      }),
    )
    const { user } = renderRoute('/conversations/1')

    await user.type(await getComposer(), '  Is it still available?  {Enter}')

    expect(await within(await getMessageLog()).findByText('Is it still available?')).toBeInTheDocument()
    expect(await getComposer()).toHaveValue('')
    expect(body).toMatchObject({ conversationId: 1, authorId: 1, body: 'Is it still available?' })
  })

  it('sends the message with the send button', async () => {
    const { user } = renderRoute('/conversations/1')

    await user.type(await getComposer(), 'Hello')
    await user.click(screen.getByRole('button', { name: 'Envoyer le message' }))

    expect(await within(await getMessageLog()).findByText('Hello')).toBeInTheDocument()
  })

  it('adds a new line with Shift+Enter instead of sending', async () => {
    const { user } = renderRoute('/conversations/1')
    const composer = await getComposer()

    await user.type(composer, 'Hello{Shift>}{Enter}{/Shift}there')

    expect(composer).toHaveValue('Hello\nthere')
  })

  it('does not allow sending an empty message', async () => {
    const { user } = renderRoute('/conversations/1')
    const sendButton = await screen.findByRole('button', { name: 'Envoyer le message' })

    expect(sendButton).toBeDisabled()

    await user.type(await getComposer(), '   ')

    expect(sendButton).toBeDisabled()
  })

  it('shows the message as sending until the server confirms it', async () => {
    const { released, release } = deferredResponse()
    server.use(
      http.post(apiUrl('/messages/1'), async () => {
        await released
        return HttpResponse.json({ id: 51 })
      }),
    )
    const { user } = renderRoute('/conversations/1')

    await user.type(await getComposer(), 'On my way{Enter}')

    const log = await getMessageLog()
    expect(within(log).getByText('On my way')).toBeInTheDocument()
    expect(within(log).getByText('Envoi…')).toBeInTheDocument()

    release()

    expect(await within(log).findByText('On my way')).toBeInTheDocument()
    await expect.poll(() => within(log).queryByText('Envoi…')).toBeNull()
  })

  it('keeps a failed message with the option to retry it', async () => {
    server.use(http.post(apiUrl('/messages/1'), () => new HttpResponse(null, { status: 503 }), { once: true }))
    const { user } = renderRoute('/conversations/1')

    await user.type(await getComposer(), 'Are you there?{Enter}')

    const log = await getMessageLog()
    expect(await within(log).findByText('Non envoyé.')).toBeInTheDocument()

    await user.click(within(log).getByRole('button', { name: 'Renvoyer' }))

    await expect.poll(() => within(log).queryByText('Non envoyé.')).toBeNull()
    expect(within(log).getByText('Are you there?')).toBeInTheDocument()
  })

  it('lets the user delete a failed message', async () => {
    server.use(http.post(apiUrl('/messages/1'), () => HttpResponse.error()))
    const { user } = renderRoute('/conversations/1')

    await user.type(await getComposer(), 'Oops{Enter}')

    const log = await getMessageLog()
    await user.click(await within(log).findByRole('button', { name: 'Supprimer' }))

    expect(within(log).queryByText('Oops')).not.toBeInTheDocument()
  })

  it('waits for the connection to come back before sending a message written offline', async () => {
    const isSaved = () => db.messages.some(({ body }) => body === 'See you tomorrow')
    const { user } = renderRoute('/conversations/1')
    const composer = await getComposer()

    act(() => onlineManager.setOnline(false))
    await user.type(composer, 'See you tomorrow{Enter}')

    const log = await getMessageLog()
    expect(await within(log).findByText('En attente de connexion…')).toBeInTheDocument()
    expect(isSaved()).toBe(false)

    act(() => onlineManager.setOnline(true))

    await expect.poll(() => within(log).queryByText('En attente de connexion…')).toBeNull()
    expect(isSaved()).toBe(true)
    expect(within(log).getByText('See you tomorrow')).toBeInTheDocument()
  })

  it('replaces the empty state when sending the first message', async () => {
    const { user } = renderRoute('/conversations/3')

    await user.type(await screen.findByRole('textbox', { name: 'Message à Elodie' }), 'Hi Elodie{Enter}')

    expect(await screen.findByText('Hi Elodie')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Aucun message pour le moment' })).not.toBeInTheDocument()
  })

  it('limits the message length and warns when getting close to it', async () => {
    const { user } = renderRoute('/conversations/1')
    const composer = await getComposer()

    expect(composer).toHaveAttribute('maxLength', String(MESSAGE_MAX_LENGTH))

    await user.click(composer)
    await user.paste('a'.repeat(MESSAGE_MAX_LENGTH - 50))

    expect(screen.getByText('50 caractères restants')).toBeInTheDocument()
    expect(composer).toHaveAccessibleDescription('50 caractères restants')
  })
})
