import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderRoute } from '@/test/renderRoute'

describe('routes', () => {
  it('shows the conversations pane and an invitation to pick one on the home page', async () => {
    renderRoute('/')

    expect(await screen.findByRole('heading', { name: 'Select a conversation' })).toBeInTheDocument()
    expect(screen.getByRole('complementary', { name: 'Conversations' })).toBeInTheDocument()
    await waitFor(() => expect(document.title).toBe('Messages · leboncoin'))
  })

  it('shows a not found page for unknown urls and links back to the messages', async () => {
    const { user } = renderRoute('/unknown')

    await user.click(await screen.findByRole('link', { name: 'Go to messages' }))

    expect(await screen.findByRole('heading', { name: 'Select a conversation' })).toBeInTheDocument()
  })

  it('lets keyboard users skip to the main content', async () => {
    renderRoute('/')

    expect(await screen.findByRole('link', { name: 'Skip to main content' })).toHaveAttribute('href', '#main-content')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
  })
})
