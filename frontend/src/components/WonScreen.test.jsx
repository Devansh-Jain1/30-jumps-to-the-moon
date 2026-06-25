import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import WonScreen from './WonScreen.jsx'

// Mock gameApi so tests don't hit the network
vi.mock('../api/gameApi.js', () => ({
  getHighscores: vi.fn(),
}))

import { getHighscores } from '../api/gameApi.js'

const defaultProps = {
  score: 100,
  deaths: 3,
  sessionHighScore: 150,
  onPlayAgain: vi.fn(),
}

describe('WonScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders You Won heading', async () => {
    getHighscores.mockResolvedValue([])
    render(<WonScreen {...defaultProps} />)
    expect(screen.getByText(/You Won/i)).toBeInTheDocument()
  })

  it('shows score, deaths, and session high score', async () => {
    getHighscores.mockResolvedValue([])
    render(<WonScreen {...defaultProps} />)
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
  })

  it('renders Play Again button and calls onPlayAgain', async () => {
    getHighscores.mockResolvedValue([])
    const onPlayAgain = vi.fn()
    render(<WonScreen {...defaultProps} onPlayAgain={onPlayAgain} />)
    fireEvent.click(screen.getByRole('button', { name: /play again/i }))
    expect(onPlayAgain).toHaveBeenCalledOnce()
  })

  it('renders leaderboard table when scores load', async () => {
    getHighscores.mockResolvedValue([
      { rank: 1, score: 500, deaths: 1 },
      { rank: 2, score: 400, deaths: 2 },
    ])
    render(<WonScreen {...defaultProps} />)
    await waitFor(() => {
      expect(screen.getByText('500')).toBeInTheDocument()
      expect(screen.getByText('400')).toBeInTheDocument()
    })
  })

  it('shows no scores message when leaderboard is empty', async () => {
    getHighscores.mockResolvedValue([])
    render(<WonScreen {...defaultProps} />)
    await waitFor(() => {
      expect(screen.getByText(/No scores yet/i)).toBeInTheDocument()
    })
  })

  it('shows no scores message when getHighscores rejects', async () => {
    getHighscores.mockRejectedValue(new Error('network error'))
    render(<WonScreen {...defaultProps} />)
    await waitFor(() => {
      expect(screen.getByText(/No scores yet/i)).toBeInTheDocument()
    })
  })

  it('shows leaderboard columns: Rank, Score, Deaths', async () => {
    getHighscores.mockResolvedValue([{ rank: 1, score: 300, deaths: 0 }])
    render(<WonScreen {...defaultProps} />)
    await waitFor(() => {
      expect(screen.getByText('Rank')).toBeInTheDocument()
      // "Score" appears in the stat block AND the table header
      expect(screen.getAllByText('Score').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Deaths').length).toBeGreaterThanOrEqual(1)
    })
  })
})
