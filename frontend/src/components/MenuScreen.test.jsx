import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MenuScreen from './MenuScreen.jsx'

describe('MenuScreen', () => {
  it('renders the game title', () => {
    render(<MenuScreen onStart={vi.fn()} />)
    expect(screen.getByText(/30 Jumps to the Moon/i)).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<MenuScreen onStart={vi.fn()} />)
    expect(screen.getByText(/Jump across 30 platforms/i)).toBeInTheDocument()
  })

  it('renders Start Game button', () => {
    render(<MenuScreen onStart={vi.fn()} />)
    expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument()
  })

  it('calls onStart when Start Game is clicked', () => {
    const onStart = vi.fn()
    render(<MenuScreen onStart={onStart} />)
    fireEvent.click(screen.getByRole('button', { name: /start game/i }))
    expect(onStart).toHaveBeenCalledOnce()
  })

  it('disables button when loading=true', () => {
    render(<MenuScreen onStart={vi.fn()} loading={true} />)
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).toHaveTextContent(/starting/i)
  })
})
