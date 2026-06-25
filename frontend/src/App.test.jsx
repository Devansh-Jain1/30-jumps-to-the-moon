import { render, screen } from '@testing-library/react'
import App from './App'

describe('App scaffold', () => {
  it('renders the app heading', () => {
    render(<App />)
    expect(screen.getByRole('heading')).toBeInTheDocument()
  })

  it('renders 30 Jumps to the Moon title', () => {
    render(<App />)
    expect(screen.getByText(/30 Jumps to the Moon/i)).toBeInTheDocument()
  })
})
