/**
 * App.jsx — top-level game state orchestrator.
 *
 * State machine:
 *   MENU → startGame() → PLAYING
 *   PLAYING (death, platform < 5) → reset player only, stay PLAYING
 *   PLAYING (death, platform >= 5) → reportDeath() → new platforms → reset score → PLAYING
 *   PLAYING (reach platform 30) → reportWin() → WON
 *   PLAYING (manual quit) → MENU
 *   WON → startGame() → PLAYING
 */
import { useReducer, useState, useCallback, useRef } from 'react'
import { gameReducer, initialGameState, GAME_STATES } from './state/gameState.js'
import { useScoreState } from './state/scoreState.js'
import { startGame, reportDeath, reportWin } from './api/gameApi.js'
import MenuScreen from './components/MenuScreen.jsx'
import GameCanvas from './components/GameCanvas.jsx'
import GameOverScreen from './components/GameOverScreen.jsx'
import WonScreen from './components/WonScreen.jsx'

const RESPAWN_OVERLAY_MS = 1000

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState)
  const [loadingApi, setLoadingApi] = useState(false)
  const [respawnOverlay, setRespawnOverlay] = useState(false)
  const respawnTimerRef = useRef(null)

  const {
    score,
    deaths,
    sessionHighScore,
    resetScore,
    incrementDeaths,
    resetAll,
  } = useScoreState()

  // ---- helpers ----

  const showRespawnOverlay = useCallback(() => {
    setRespawnOverlay(true)
    clearTimeout(respawnTimerRef.current)
    respawnTimerRef.current = setTimeout(() => {
      setRespawnOverlay(false)
      dispatch({ type: 'RESPAWN_DONE' })
    }, RESPAWN_OVERLAY_MS)
  }, [])

  // ---- transitions ----

  const handleStart = useCallback(async () => {
    setLoadingApi(true)
    try {
      const data = await startGame()
      dispatch({ type: 'START_GAME', platforms: data?.platforms, seed: data?.seed })
    } catch {
      // If backend is down, still let the player in (offline mode)
      dispatch({ type: 'START_GAME' })
    } finally {
      setLoadingApi(false)
    }
  }, [])

  const handleDeath = useCallback(
    async (highestPlatform) => {
      incrementDeaths()

      if (highestPlatform < 5) {
        // Early death — just reset position in-place, no API call
        dispatch({ type: 'PLAYER_DIED_EARLY' })
        // RESPAWN_DONE dispatched automatically after overlay
        return
      }

      // Late death — call API, get new layout, reset score
      resetScore()
      showRespawnOverlay()
      try {
        const data = await reportDeath()
        dispatch({
          type: 'PLAYER_DIED_LATE',
          platforms: data?.platforms,
          seed: data?.seed,
        })
      } catch {
        dispatch({ type: 'PLAYER_DIED_LATE' })
      }
    },
    [incrementDeaths, resetScore, showRespawnOverlay],
  )

  const handleWin = useCallback(async () => {
    try {
      await reportWin()
    } catch {
      // Ignore win report errors
    }
    dispatch({ type: 'PLAYER_WON' })
  }, [])

  const handleQuit = useCallback(() => {
    dispatch({ type: 'QUIT_TO_MENU' })
  }, [])

  const handlePlayAgain = useCallback(async () => {
    resetAll()
    setLoadingApi(true)
    try {
      const data = await startGame()
      dispatch({ type: 'START_GAME', platforms: data?.platforms, seed: data?.seed })
    } catch {
      dispatch({ type: 'START_GAME' })
    } finally {
      setLoadingApi(false)
    }
  }, [resetAll])

  // ---- render ----

  const { gameState, platforms, respawning } = state

  if (gameState === GAME_STATES.MENU) {
    return <MenuScreen onStart={handleStart} loading={loadingApi} />
  }

  if (gameState === GAME_STATES.WON) {
    return (
      <WonScreen
        score={score}
        deaths={deaths}
        sessionHighScore={sessionHighScore}
        onPlayAgain={handlePlayAgain}
      />
    )
  }

  // PLAYING
  return (
    <div style={{ position: 'relative' }}>
      <GameCanvas
        platforms={platforms}
        onDeath={handleDeath}
        onWin={handleWin}
        respawning={respawning}
      />
      <GameOverScreen visible={respawnOverlay} />
      <button
        onClick={handleQuit}
        style={{
          position: 'fixed',
          top: '0.5rem',
          right: '0.5rem',
          padding: '0.4rem 0.8rem',
          fontFamily: 'monospace',
          fontSize: '0.8rem',
          background: 'rgba(0,0,0,0.6)',
          color: '#a0a0c0',
          border: '1px solid #4a4a6e',
          borderRadius: '4px',
          cursor: 'pointer',
          zIndex: 20,
        }}
        aria-label="Quit to menu"
      >
        Quit
      </button>
    </div>
  )
}
