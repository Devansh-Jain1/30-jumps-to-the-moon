/**
 * scoreState.js — React hook for tracking score, deaths, and session high score.
 */
import { useState, useCallback, useRef } from 'react'

export function useScoreState() {
  const [score, setScore] = useState(0)
  const [deaths, setDeaths] = useState(0)
  const [sessionHighScore, setSessionHighScore] = useState(0)

  // Mutable ref so callbacks can read the current score without stale closure
  const scoreRef = useRef(0)
  const highRef = useRef(0)

  const incrementScore = useCallback((amount = 1) => {
    scoreRef.current += amount
    setScore(scoreRef.current)
  }, [])

  // Set score to an absolute value (used when score == highest platform reached).
  const setScoreTo = useCallback((value) => {
    scoreRef.current = value
    setScore(value)
    if (value > highRef.current) {
      highRef.current = value
      setSessionHighScore(value)
    }
  }, [])

  const resetScore = useCallback(() => {
    if (scoreRef.current > highRef.current) {
      highRef.current = scoreRef.current
      setSessionHighScore(highRef.current)
    }
    scoreRef.current = 0
    setScore(0)
  }, [])

  const incrementDeaths = useCallback(() => {
    setDeaths((prev) => prev + 1)
  }, [])

  const resetAll = useCallback(() => {
    if (scoreRef.current > highRef.current) {
      highRef.current = scoreRef.current
      setSessionHighScore(highRef.current)
    }
    scoreRef.current = 0
    setScore(0)
    setDeaths(0)
  }, [])

  return {
    score,
    deaths,
    sessionHighScore,
    incrementScore,
    setScoreTo,
    resetScore,
    incrementDeaths,
    resetAll,
  }
}
