/**
 * GameCanvas.jsx — active PLAYING state canvas.
 * Draws via renderer.js, uses useScoreState, fires callbacks on game events.
 */
import { useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useScoreState } from '../state/scoreState.js'
import { drawBackground, drawPlatform, drawPlayer, drawHUD } from '../renderer.js'

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const GRAVITY = 0.5
const JUMP_FORCE = -12
const PLAYER_SPEED = 5
const PLAYER_W = 24
const PLAYER_H = 24

function makeDummyPlatforms() {
  const platforms = []
  for (let i = 0; i <= 30; i++) {
    platforms.push({
      index: i,
      x: 50 + (i % 5) * 130,
      y: CANVAS_HEIGHT - 40 - i * 18,
      width: 100,
      height: 12,
    })
  }
  return platforms
}

export default function GameCanvas({
  platforms,
  onDeath,
  onPlatformReached,
  onWin,
  highlightPlatformIndex,
  respawning,
}) {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const animFrameRef = useRef(null)
  const keysRef = useRef({})
  const { score, deaths, sessionHighScore, incrementScore, resetScore, incrementDeaths } =
    useScoreState()

  // Use provided platforms or fall back to dummy layout
  const effectivePlatforms =
    platforms && platforms.length > 0 ? platforms : makeDummyPlatforms()

  // Initialise / reset player position
  const initPlayer = useCallback(() => {
    const firstPlatform = effectivePlatforms[0]
    return {
      x: firstPlatform ? firstPlatform.x + firstPlatform.width / 2 - PLAYER_W / 2 : 200,
      y: firstPlatform ? firstPlatform.y - PLAYER_H : CANVAS_HEIGHT - 60,
      vx: 0,
      vy: 0,
      onGround: true,
      currentPlatform: 0,
    }
  }, [effectivePlatforms])

  useEffect(() => {
    stateRef.current = {
      player: initPlayer(),
      highestPlatform: 0,
    }
  }, [initPlayer])

  // Reset on respawn signal
  useEffect(() => {
    if (respawning && stateRef.current) {
      stateRef.current.player = initPlayer()
      stateRef.current.highestPlatform = 0
    }
  }, [respawning, initPlayer])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const handleKeyDown = (e) => { keysRef.current[e.code] = true }
    const handleKeyUp = (e) => { keysRef.current[e.code] = false }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    function gameLoop() {
      if (!stateRef.current) { animFrameRef.current = requestAnimationFrame(gameLoop); return }
      const { player } = stateRef.current
      const keys = keysRef.current

      // Horizontal movement
      if (keys['ArrowLeft'] || keys['KeyA']) player.vx = -PLAYER_SPEED
      else if (keys['ArrowRight'] || keys['KeyD']) player.vx = PLAYER_SPEED
      else player.vx = 0

      // Jump
      if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && player.onGround) {
        player.vy = JUMP_FORCE
        player.onGround = false
        incrementScore(1)
      }

      // Physics
      player.vy += GRAVITY
      player.x += player.vx
      player.y += player.vy

      // Clamp horizontal
      player.x = Math.max(0, Math.min(CANVAS_WIDTH - PLAYER_W, player.x))

      // Platform collision
      player.onGround = false
      for (const plat of effectivePlatforms) {
        if (
          player.vy >= 0 &&
          player.x + PLAYER_W > plat.x &&
          player.x < plat.x + plat.width &&
          player.y + PLAYER_H >= plat.y &&
          player.y + PLAYER_H <= plat.y + plat.height + Math.abs(player.vy) + 1
        ) {
          player.y = plat.y - PLAYER_H
          player.vy = 0
          player.onGround = true

          // Track highest platform reached
          if (plat.index > stateRef.current.highestPlatform) {
            stateRef.current.highestPlatform = plat.index
            onPlatformReached?.(plat.index)

            if (plat.index >= 30) {
              onWin?.()
              return
            }
          }
        }
      }

      // Death: fell off bottom
      if (player.y > CANVAS_HEIGHT + 50) {
        onDeath?.(stateRef.current.highestPlatform)
        stateRef.current.player = initPlayer()
        stateRef.current.highestPlatform = 0
      }

      // Draw
      drawBackground(ctx, CANVAS_WIDTH, CANVAS_HEIGHT)

      for (const plat of effectivePlatforms) {
        drawPlatform(ctx, plat, plat.index === highlightPlatformIndex)
      }

      drawPlayer(ctx, player)

      drawHUD(ctx, {
        score,
        deaths,
        platform: stateRef.current.highestPlatform,
        width: CANVAS_WIDTH,
      })

      animFrameRef.current = requestAnimationFrame(gameLoop)
    }

    animFrameRef.current = requestAnimationFrame(gameLoop)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [
    effectivePlatforms,
    highlightPlatformIndex,
    score,
    deaths,
    incrementScore,
    resetScore,
    incrementDeaths,
    onDeath,
    onPlatformReached,
    onWin,
    initPlayer,
  ])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0a0a1a',
        position: 'relative',
      }}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ display: 'block', border: '1px solid #2a2a4e' }}
        aria-label="Game canvas"
      />
      <div
        style={{
          marginTop: '0.5rem',
          color: '#6080a0',
          fontFamily: 'monospace',
          fontSize: '0.8rem',
        }}
      >
        Arrow keys / WASD to move · Space / W / Up to jump
      </div>
    </div>
  )
}

GameCanvas.propTypes = {
  platforms: PropTypes.arrayOf(PropTypes.object),
  onDeath: PropTypes.func,
  onPlatformReached: PropTypes.func,
  onWin: PropTypes.func,
  highlightPlatformIndex: PropTypes.number,
  respawning: PropTypes.bool,
}

GameCanvas.defaultProps = {
  platforms: [],
  onDeath: null,
  onPlatformReached: null,
  onWin: null,
  highlightPlatformIndex: null,
  respawning: false,
}
