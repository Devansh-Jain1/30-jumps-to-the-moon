import { describe, it, expect } from 'vitest'
import { gameReducer, initialGameState, GAME_STATES } from './gameState.js'

describe('gameState reducer', () => {
  it('starts in MENU state', () => {
    expect(initialGameState.gameState).toBe(GAME_STATES.MENU)
  })

  it('START_GAME transitions MENU → PLAYING', () => {
    const next = gameReducer(initialGameState, {
      type: 'START_GAME',
      platforms: [{ index: 0 }],
      seed: 42,
    })
    expect(next.gameState).toBe(GAME_STATES.PLAYING)
    expect(next.platforms).toEqual([{ index: 0 }])
    expect(next.seed).toBe(42)
  })

  it('START_GAME transitions WON → PLAYING', () => {
    const wonState = { ...initialGameState, gameState: GAME_STATES.WON }
    const next = gameReducer(wonState, { type: 'START_GAME' })
    expect(next.gameState).toBe(GAME_STATES.PLAYING)
  })

  it('PLAYER_DIED_EARLY stays in PLAYING and sets respawning=true', () => {
    const playing = { ...initialGameState, gameState: GAME_STATES.PLAYING }
    const next = gameReducer(playing, { type: 'PLAYER_DIED_EARLY' })
    expect(next.gameState).toBe(GAME_STATES.PLAYING)
    expect(next.respawning).toBe(true)
  })

  it('PLAYER_DIED_LATE stays in PLAYING with new platforms', () => {
    const playing = { ...initialGameState, gameState: GAME_STATES.PLAYING }
    const newPlatforms = [{ index: 0 }, { index: 1 }]
    const next = gameReducer(playing, { type: 'PLAYER_DIED_LATE', platforms: newPlatforms, seed: 99 })
    expect(next.gameState).toBe(GAME_STATES.PLAYING)
    expect(next.platforms).toBe(newPlatforms)
    expect(next.seed).toBe(99)
    expect(next.respawning).toBe(true)
  })

  it('RESPAWN_DONE clears respawning flag', () => {
    const respawningState = { ...initialGameState, gameState: GAME_STATES.PLAYING, respawning: true }
    const next = gameReducer(respawningState, { type: 'RESPAWN_DONE' })
    expect(next.respawning).toBe(false)
  })

  it('PLAYER_WON transitions PLAYING → WON', () => {
    const playing = { ...initialGameState, gameState: GAME_STATES.PLAYING }
    const next = gameReducer(playing, { type: 'PLAYER_WON' })
    expect(next.gameState).toBe(GAME_STATES.WON)
  })

  it('QUIT_TO_MENU transitions PLAYING → MENU', () => {
    const playing = { ...initialGameState, gameState: GAME_STATES.PLAYING }
    const next = gameReducer(playing, { type: 'QUIT_TO_MENU' })
    expect(next.gameState).toBe(GAME_STATES.MENU)
  })

  it('unknown action returns state unchanged', () => {
    const next = gameReducer(initialGameState, { type: 'UNKNOWN' })
    expect(next).toBe(initialGameState)
  })
})
