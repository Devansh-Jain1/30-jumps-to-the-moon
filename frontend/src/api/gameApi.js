/**
 * gameApi.js — all fetch calls go through here.
 * Backend base URL is resolved from env or defaults to localhost:8080.
 */

const BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080'

async function post(path, body = undefined) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`)
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return res.json()
}

/**
 * Start a new game session. Returns { platforms, seed }.
 */
export async function startGame() {
  return post('/api/game/start')
}

/**
 * Report a death (platform >= 5). Returns { platforms, seed }.
 */
export async function reportDeath() {
  return post('/api/game/death')
}

/**
 * Report a win. Returns server acknowledgement or null.
 */
export async function reportWin() {
  return post('/api/game/win')
}

/**
 * Fetch the global highscores list. Returns array of { rank, score, deaths }.
 */
export async function getHighscores() {
  return get('/api/scores')
}
