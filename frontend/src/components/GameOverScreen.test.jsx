import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import GameOverScreen from './GameOverScreen.jsx'

describe('GameOverScreen', () => {
  it('renders nothing when visible=false', () => {
    const { container } = render(<GameOverScreen visible={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders respawn overlay when visible=true', () => {
    render(<GameOverScreen visible={true} />)
    expect(screen.getByText(/Respawning/i)).toBeInTheDocument()
  })

  it('has status role for accessibility', () => {
    render(<GameOverScreen visible={true} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
