import { onlineManager } from '@tanstack/react-query'
import { act, screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/msw/server'
import { apiUrl } from '@/test/msw/utils'
import { renderRoute } from '@/test/renderRoute'

const findBanner = () => screen.findByRole('status', { name: 'État de la connexion' })

describe('ConnectionBanner', () => {
  it('stays empty when everything works', async () => {
    renderRoute('/')

    await screen.findAllByRole('link', { name: /Jeremie|Elodie/ })

    expect(await findBanner()).toBeEmptyDOMElement()
  })

  it('warns the user when they go offline and hides once back online', async () => {
    renderRoute('/')
    const banner = await findBanner()

    act(() => onlineManager.setOnline(false))
    expect(banner).toHaveTextContent('Vous êtes hors ligne')

    act(() => onlineManager.setOnline(true))
    expect(banner).toBeEmptyDOMElement()
  })

  it('reassures the user while the servers are failing and hides once they recover', async () => {
    server.use(http.get(apiUrl('/conversations/:userId'), () => new HttpResponse(null, { status: 503 }), { once: true }))
    const { user } = renderRoute('/')
    const banner = await findBanner()

    expect(await within(banner).findByText(/serveurs rencontrent un souci/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Réessayer' }))

    await expect.poll(() => banner.textContent).toBe('')
  })

  it('does not blame the servers for client errors', async () => {
    server.use(http.get(apiUrl('/conversations/:userId'), () => new HttpResponse(null, { status: 400 })))
    renderRoute('/')

    await screen.findByRole('alert')

    expect(await findBanner()).toBeEmptyDOMElement()
  })
})
