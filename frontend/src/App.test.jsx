import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App'

// Mock gameApi to avoid network calls
vi.mock('./api/gameApi.js', () => ({
  startGame: vi.fn(),
  reportDeath: vi.fn(),
  reportWin: vi.fn(),
  getHighscores: vi.fn(),
}))

import { startGame, reportWin, getHighscores } from './api/gameApi.js'

// Mock GameCanvas to avoid canvas + rAF in jsdom
vi.mock('./components/GameCanvas.jsx', () => ({
  default: ({ onWin, onDeath }) => (
    <div data-testid="game-canvas">
      <button onClick={() => onDeath(0)} data-testid="die-early">Die early (platform 0)</button>
      <button onClick={() => onDeath(5)} data-testid="die-late">Die late (platform 5)</button>
      <button onClick={() => onWin()} data-testid="win">Win</button>
    </div>
  ),
}))

describe('App state machine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    startGame.mockResolvedValue({ platforms: [], seed: 1 })
    reportWin.mockResolvedValue(null)
    getHighscores.mockResolvedValue([])
  })

  it('AC-1: renders MENU screen on load with Start button', () => {
    render(<App />)
    expect(screen.getByText(/30 Jumps to the Moon/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument()
  })

  it('AC-2: clicking Start calls startGame() and transitions to PLAYING', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /start game/i }))
    await waitFor(() => expect(startGame).toHaveBeenCalledOnce())
    await waitFor(() => expect(screen.getByTestId('game-canvas')).toBeInTheDocument())
  })

  it('AC-3: dying at platform 0 (< 5) stays in PLAYING without extra API call', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /start game/i }))
    await waitFor(() => screen.getByTestId('game-canvas'))

    startGame.mockClear()
    fireEvent.click(screen.getByTestId('die-early'))

    // Give any async work a tick
    await waitFor(() => expect(screen.getByTestId('game-canvas')).toBeInTheDocument())
    // startGame should NOT have been called again
    expect(startGame).not.toHaveBeenCalled()
  })

  it('AC-5: reaching platform 30 transitions to WON screen', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /start game/i }))
    await waitFor(() => screen.getByTestId('game-canvas'))

    fireEvent.click(screen.getByTestId('win'))
    await waitFor(() => expect(reportWin).toHaveBeenCalledOnce())
    await waitFor(() => expect(screen.getByText(/You Won/i)).toBeInTheDocument())
  })

  it('AC-6: Play Again from WON returns to PLAYING', async () => {
    render(<App />)
    // Get to won state
    fireEvent.click(screen.getByRole('button', { name: /start game/i }))
    await waitFor(() => screen.getByTestId('game-canvas'))
    fireEvent.click(screen.getByTestId('win'))
    await waitFor(() => screen.getByText(/You Won/i))

    // Play again
    fireEvent.click(screen.getByRole('button', { name: /play again/i }))
    await waitFor(() => expect(screen.getByTestId('game-canvas')).toBeInTheDocument())
  })

  it('Quit button transitions PLAYING → MENU', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /start game/i }))
    await waitFor(() => screen.getByTestId('game-canvas'))

    fireEvent.click(screen.getByRole('button', { name: /quit to menu/i }))
    expect(screen.getByText(/30 Jumps to the Moon/i)).toBeInTheDocument()
  })

  it('startGame failure still enters PLAYING (offline mode)', async () => {
    startGame.mockRejectedValue(new Error('network down'))
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /start game/i }))
    await waitFor(() => expect(screen.getByTestId('game-canvas')).toBeInTheDocument())
  })
})
