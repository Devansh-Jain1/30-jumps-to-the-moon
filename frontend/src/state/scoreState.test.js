import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScoreState } from './scoreState.js'

describe('useScoreState', () => {
  it('starts at score=0, deaths=0, sessionHighScore=0', () => {
    const { result } = renderHook(() => useScoreState())
    expect(result.current.score).toBe(0)
    expect(result.current.deaths).toBe(0)
    expect(result.current.sessionHighScore).toBe(0)
  })

  it('incrementScore increases score by 1', () => {
    const { result } = renderHook(() => useScoreState())
    act(() => result.current.incrementScore())
    expect(result.current.score).toBe(1)
  })

  it('incrementScore increases score by custom amount', () => {
    const { result } = renderHook(() => useScoreState())
    act(() => result.current.incrementScore(5))
    expect(result.current.score).toBe(5)
  })

  it('resetScore sets score to 0 and updates sessionHighScore', () => {
    const { result } = renderHook(() => useScoreState())
    act(() => result.current.incrementScore(10))
    act(() => result.current.resetScore())
    expect(result.current.score).toBe(0)
    expect(result.current.sessionHighScore).toBe(10)
  })

  it('incrementDeaths increases deaths', () => {
    const { result } = renderHook(() => useScoreState())
    act(() => result.current.incrementDeaths())
    act(() => result.current.incrementDeaths())
    expect(result.current.deaths).toBe(2)
  })

  it('resetAll clears score and deaths, preserves sessionHighScore', () => {
    const { result } = renderHook(() => useScoreState())
    act(() => result.current.incrementScore(20))
    act(() => result.current.incrementDeaths())
    act(() => result.current.resetAll())
    expect(result.current.score).toBe(0)
    expect(result.current.deaths).toBe(0)
    expect(result.current.sessionHighScore).toBe(20)
  })

  it('sessionHighScore never goes down', () => {
    const { result } = renderHook(() => useScoreState())
    act(() => result.current.incrementScore(100))
    act(() => result.current.resetScore())
    act(() => result.current.incrementScore(50))
    act(() => result.current.resetScore())
    expect(result.current.sessionHighScore).toBe(100)
  })
})
