/**
 * GameCanvas.jsx — active PLAYING state canvas.
 * Draws via renderer.js, fires callbacks on game events.
 *
 * The render loop runs in ONE useEffect that mounts once. All mutable values
 * the loop needs (callbacks, score, deaths, highlight) are read through refs
 * so the loop never tears down mid-game — this is what stops the canvas from
 * re-initialising on every jump.
 */
import { useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import { drawBackground, drawPlatform, drawPlayer, drawHUD } from '../renderer.js'

const CANVAS_WIDTH = 480
const CANVAS_HEIGHT = 640

// Physics — tuned so a single jump clears one platform gap with margin.
const GRAVITY = 0.62
const JUMP_FORCE = -15.5     // apex ≈ 193px; gaps are ~110px so always reachable
const JUMP_CUT = 0.45        // releasing jump early shortens the hop (variable height)
const MOVE_ACCEL = 0.9       // horizontal acceleration for a smoother feel
const MOVE_MAX = 5.2
const FRICTION = 0.78
const PLAYER_W = 20
const PLAYER_H = 28

const V_GAP = 110            // vertical distance between platforms
const GROUND_Y = CANVAS_HEIGHT - 60

// Reachable layout: vertical gap fixed, horizontal delta bounded to <= 150px.
function makeDummyPlatforms() {
  const platforms = [
    { index: 0, x: CANVAS_WIDTH / 2 - 90, y: GROUND_Y, width: 180, height: 16, stage: 1 },
  ]
  let prevX = CANVAS_WIDTH / 2 - 50
  for (let i = 1; i <= 30; i++) {
    const stage = i <= 10 ? 1 : i <= 20 ? 2 : 3
    const width = 70 + ((i * 37) % 40) // 70–110px, deterministic
    // bounded horizontal step so every jump is reachable
    const dir = i % 2 === 0 ? 1 : -1
    const step = 60 + ((i * 53) % 80) // 60–140px
    let x = prevX + dir * step
    x = Math.max(20, Math.min(CANVAS_WIDTH - width - 20, x))
    prevX = x
    platforms.push({
      index: i,
      x,
      y: GROUND_Y - i * V_GAP,
      width,
      height: 14,
      stage,
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
  deaths,
  respawning,
}) {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const animFrameRef = useRef(null)
  const keysRef = useRef({})
  const jumpHeldRef = useRef(false)

  // Provided platforms (from backend) or the reachable dummy layout.
  const effectivePlatforms =
    platforms && platforms.length > 0
      ? platforms.map((p) => ({ ...p, stage: p.stage ?? (p.index <= 10 ? 1 : p.index <= 20 ? 2 : 3) }))
      : makeDummyPlatforms()

  // Latest mutable values the loop reads via refs (so the loop never restarts).
  const liveRef = useRef({})
  liveRef.current = {
    platforms: effectivePlatforms,
    highlight: highlightPlatformIndex,
    deaths,
    onDeath,
    onPlatformReached,
    onWin,
  }

  const initPlayer = useCallback(() => {
    const p0 = effectivePlatforms[0]
    return {
      x: p0 ? p0.x + p0.width / 2 - PLAYER_W / 2 : CANVAS_WIDTH / 2,
      y: p0 ? p0.y - PLAYER_H : GROUND_Y - PLAYER_H,
      vx: 0,
      vy: 0,
      onGround: true,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectivePlatforms])

  // Respawn signal: reset player + camera, keep deaths.
  useEffect(() => {
    if (respawning && stateRef.current) {
      stateRef.current.player = initPlayer()
      stateRef.current.highestPlatform = 0
      stateRef.current.cameraY = 0
    }
  }, [respawning, initPlayer])

  // Mount the render loop ONCE. No score/deaths in deps.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false

    stateRef.current = {
      player: initPlayer(),
      highestPlatform: 0,
      cameraY: 0,
    }

    const onKeyDown = (e) => {
      keysRef.current[e.code] = true
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault()
        jumpHeldRef.current = true
      }
    }
    const onKeyUp = (e) => {
      keysRef.current[e.code] = false
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) jumpHeldRef.current = false
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    function loop() {
      const st = stateRef.current
      if (!st) { animFrameRef.current = requestAnimationFrame(loop); return }
      const { platforms: plats, highlight, deaths: liveDeaths, onDeath: dDeath,
              onPlatformReached: dReached, onWin: dWin } = liveRef.current
      const player = st.player
      const keys = keysRef.current

      // Horizontal: accelerate / decelerate for smoothness
      if (keys['ArrowLeft'] || keys['KeyA']) player.vx -= MOVE_ACCEL
      else if (keys['ArrowRight'] || keys['KeyD']) player.vx += MOVE_ACCEL
      else player.vx *= FRICTION
      player.vx = Math.max(-MOVE_MAX, Math.min(MOVE_MAX, player.vx))
      if (Math.abs(player.vx) < 0.1) player.vx = 0

      // Jump (only from ground)
      if (jumpHeldRef.current && player.onGround) {
        player.vy = JUMP_FORCE
        player.onGround = false
      }
      // Variable height: cut the rise if jump released early
      if (!jumpHeldRef.current && player.vy < 0) {
        player.vy *= JUMP_CUT
      }

      // Integrate
      player.vy += GRAVITY
      if (player.vy > 16) player.vy = 16 // terminal velocity
      player.x += player.vx
      player.y += player.vy
      player.x = Math.max(0, Math.min(CANVAS_WIDTH - PLAYER_W, player.x))

      // Platform collision (top-face, only while descending)
      player.onGround = false
      if (player.vy >= 0) {
        for (const plat of plats) {
          const prevBottom = player.y + PLAYER_H - player.vy
          if (
            player.x + PLAYER_W > plat.x &&
            player.x < plat.x + plat.width &&
            prevBottom <= plat.y + 2 &&
            player.y + PLAYER_H >= plat.y &&
            player.y + PLAYER_H <= plat.y + plat.height + 14
          ) {
            player.y = plat.y - PLAYER_H
            player.vy = 0
            player.onGround = true
            if (plat.index > st.highestPlatform) {
              st.highestPlatform = plat.index
              dReached?.(plat.index)
              if (plat.index >= 30) { dWin?.(plat.index); }
            }
            break
          }
        }
      }

      // Smooth camera follow (player sits ~65% down the screen)
      const targetCam = -(player.y - CANVAS_HEIGHT * 0.62)
      st.cameraY += (Math.max(0, targetCam) - st.cameraY) * 0.12
      const cameraY = st.cameraY

      // Death: fell below the visible area
      if (player.y + cameraY > CANVAS_HEIGHT + 80) {
        dDeath?.(st.highestPlatform)
        st.player = initPlayer()
        st.highestPlatform = 0
        st.cameraY = 0
        animFrameRef.current = requestAnimationFrame(loop)
        return
      }

      // ── Draw ──
      drawBackground(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, cameraY)
      ctx.save()
      ctx.translate(0, Math.round(cameraY))
      for (const plat of plats) {
        // cull off-screen platforms
        const sy = plat.y + cameraY
        if (sy > -30 && sy < CANVAS_HEIGHT + 30) {
          drawPlatform(ctx, plat, plat.index === highlight)
        }
      }
      drawPlayer(ctx, player)
      ctx.restore()

      drawHUD(ctx, {
        score: st.highestPlatform,
        deaths: liveDeaths,
        platform: st.highestPlatform,
        width: CANVAS_WIDTH,
      })

      animFrameRef.current = requestAnimationFrame(loop)
    }

    animFrameRef.current = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
    // Mount once. Mutable values flow through liveRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#05050f',
        position: 'relative',
      }}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          display: 'block',
          border: '2px solid #2a2a4e',
          borderRadius: 8,
          imageRendering: 'pixelated',
          boxShadow: '0 0 40px rgba(80,60,160,0.4)',
        }}
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
        ← → / A D to move · Space / W / ↑ to jump (hold for higher)
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
  deaths: PropTypes.number,
  respawning: PropTypes.bool,
}

GameCanvas.defaultProps = {
  platforms: [],
  onDeath: null,
  onPlatformReached: null,
  onWin: null,
  highlightPlatformIndex: -1,
  deaths: 0,
  respawning: false,
}
