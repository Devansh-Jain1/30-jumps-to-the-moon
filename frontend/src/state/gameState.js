/**
 * gameState.js — game state machine enum and reducer.
 */

export const GAME_STATES = {
  MENU: 'menu',
  PLAYING: 'playing',
  WON: 'won',
}

/**
 * Reducer for game state transitions.
 * Actions: START_GAME, PLAYER_DIED_EARLY, PLAYER_DIED_LATE, PLAYER_WON, QUIT_TO_MENU
 */
export function gameReducer(state, action) {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        gameState: GAME_STATES.PLAYING,
        platforms: action.platforms ?? state.platforms,
        seed: action.seed ?? state.seed,
      }
    case 'PLAYER_DIED_EARLY':
      // Stay in PLAYING, just reset position — no platform/score change
      return { ...state, gameState: GAME_STATES.PLAYING, respawning: true }
    case 'RESPAWN_DONE':
      return { ...state, respawning: false }
    case 'PLAYER_DIED_LATE':
      // Platform >= 5: new platforms from API, score already reset by caller
      return {
        ...state,
        gameState: GAME_STATES.PLAYING,
        platforms: action.platforms ?? state.platforms,
        seed: action.seed ?? state.seed,
        respawning: true,
      }
    case 'PLAYER_WON':
      return { ...state, gameState: GAME_STATES.WON }
    case 'QUIT_TO_MENU':
      return { ...state, gameState: GAME_STATES.MENU }
    default:
      return state
  }
}

export const initialGameState = {
  gameState: GAME_STATES.MENU,
  platforms: [],
  seed: null,
  respawning: false,
}
