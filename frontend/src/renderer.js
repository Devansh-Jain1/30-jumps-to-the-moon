/**
 * renderer.js — pixel-art canvas drawing matching the game spec design.
 * All art is drawn programmatically — no external image assets needed.
 */

// ─── Background ─────────────────────────────────────────────────────────────

export function drawBackground(ctx, width, height, cameraY) {
  // cameraY is negative as player climbs (world scrolls down)
  // worldTop = how high up the world we're looking (0 = ground, increases as we climb)
  const worldTop = -cameraY

  // Each stage spans ~540px of world height (30 platforms * ~18px each)
  // Stage 1: 0–540, Stage 2: 540–1080, Stage 3: 1080+
  const stageProgress = Math.min(worldTop / 1620, 1) // 0=ground, 1=space

  // Sky gradient transitions: green/blue → orange/purple → dark purple/black
  const gradient = ctx.createLinearGradient(0, 0, 0, height)

  if (stageProgress < 0.33) {
    // Stage 1: sunny day sky
    const t = stageProgress / 0.33
    gradient.addColorStop(0, lerpColor('#5ba8e8', '#e8a850', t))
    gradient.addColorStop(1, lerpColor('#87ceeb', '#f4d03f', t))
  } else if (stageProgress < 0.66) {
    // Stage 2: sunset
    const t = (stageProgress - 0.33) / 0.33
    gradient.addColorStop(0, lerpColor('#e8a850', '#4a1580', t))
    gradient.addColorStop(0.5, lerpColor('#c0392b', '#7d3c98', t))
    gradient.addColorStop(1, lerpColor('#f39c12', '#2c1654', t))
  } else {
    // Stage 3: night/space
    const t = (stageProgress - 0.66) / 0.34
    gradient.addColorStop(0, lerpColor('#4a1580', '#020010', t))
    gradient.addColorStop(1, lerpColor('#2c1654', '#000005', t))
  }

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // Stage-specific decorations
  if (stageProgress < 0.4) {
    drawMountainScene(ctx, width, height, cameraY)
  } else if (stageProgress < 0.75) {
    drawSunsetClouds(ctx, width, height, cameraY, stageProgress)
  } else {
    drawSpaceScene(ctx, width, height, cameraY, stageProgress)
  }
}

function drawMountainScene(ctx, width, height, cameraY) {
  // Ground / grass strip at bottom
  const groundY = height + cameraY % height
  ctx.fillStyle = '#2d5a1b'
  ctx.fillRect(0, height - 40, width, 40)
  ctx.fillStyle = '#4a8c2a'
  ctx.fillRect(0, height - 44, width, 8)

  // Mountain silhouettes (parallax: move at half camera speed)
  const parallax = -(cameraY * 0.2) % height
  ctx.fillStyle = '#1a3d0a'
  drawTriangle(ctx, width * 0.15, height - 40 + parallax, 100, 180)
  drawTriangle(ctx, width * 0.55, height - 40 + parallax, 80, 150)
  drawTriangle(ctx, width * 0.8, height - 40 + parallax, 110, 190)
  // Snowy peaks
  ctx.fillStyle = '#e8e8e8'
  drawTriangle(ctx, width * 0.15, height - 40 + parallax, 30, 50)
  drawTriangle(ctx, width * 0.55, height - 40 + parallax, 22, 38)
  drawTriangle(ctx, width * 0.8, height - 40 + parallax, 28, 46)

  // Cabin
  const cabinX = width * 0.62
  const cabinY = height - 68 + parallax
  ctx.fillStyle = '#8B4513'
  ctx.fillRect(cabinX, cabinY + 18, 32, 20) // walls
  ctx.fillStyle = '#c0392b'
  drawRoofPixel(ctx, cabinX - 4, cabinY, 40, 22)
  ctx.fillStyle = '#5d3a1a'
  ctx.fillRect(cabinX + 11, cabinY + 26, 10, 12) // door
  ctx.fillStyle = '#f1c40f'
  ctx.fillRect(cabinX + 24, cabinY + 22, 5, 5) // window

  // Trees
  drawPixelTree(ctx, width * 0.25, height - 54 + parallax)
  drawPixelTree(ctx, width * 0.35, height - 60 + parallax)
  drawPixelTree(ctx, width * 0.72, height - 50 + parallax)

  // Goat
  drawGoat(ctx, width * 0.42, height - 52 + parallax)
}

function drawSunsetClouds(ctx, width, height, cameraY, stageProgress) {
  const parallax = -(cameraY * 0.15) % (height * 2)
  const t = (stageProgress - 0.33) / 0.33
  // Clouds in orange/pink
  const cloudColor = lerpColor('#f39c12', '#9b59b6', t)
  ctx.fillStyle = cloudColor
  ctx.globalAlpha = 0.6
  drawCloud(ctx, width * 0.1, height * 0.2 + parallax % height, 60)
  drawCloud(ctx, width * 0.65, height * 0.45 + parallax % height, 80)
  drawCloud(ctx, width * 0.35, height * 0.7 + parallax % height, 50)
  ctx.globalAlpha = 1.0

  // Sun near horizon
  const sunY = height * 0.8 - (stageProgress - 0.33) * 300
  ctx.fillStyle = '#f39c12'
  ctx.beginPath()
  ctx.arc(width * 0.7, sunY, 28, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#f1c40f'
  ctx.beginPath()
  ctx.arc(width * 0.7, sunY, 20, 0, Math.PI * 2)
  ctx.fill()
}

function drawSpaceScene(ctx, width, height, cameraY, stageProgress) {
  const t = (stageProgress - 0.66) / 0.34
  // Stars (deterministic)
  ctx.fillStyle = '#ffffff'
  for (let i = 0; i < 120; i++) {
    const sx = ((i * 137 + 11) * 31 + Math.floor(cameraY / height) * 17) % width
    const sy = ((i * 97 + 7) * 43) % height
    const size = i % 5 === 0 ? 2 : 1
    ctx.globalAlpha = 0.4 + (i % 3) * 0.2
    ctx.fillRect(sx, sy, size, size)
  }
  ctx.globalAlpha = 1.0

  // Moon
  const moonY = height * 0.12
  ctx.fillStyle = '#e8e8d0'
  ctx.beginPath()
  ctx.arc(width * 0.75, moonY, 35, 0, Math.PI * 2)
  ctx.fill()
  // Moon craters
  ctx.fillStyle = '#c8c8b0'
  ctx.beginPath(); ctx.arc(width * 0.75 - 10, moonY - 8, 6, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(width * 0.75 + 12, moonY + 10, 4, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(width * 0.75 - 5, moonY + 15, 5, 0, Math.PI * 2); ctx.fill()

  // Platform 30 glow near the moon
  if (stageProgress > 0.9) {
    ctx.fillStyle = 'rgba(232,232,208,0.15)'
    ctx.beginPath()
    ctx.arc(width / 2, height * 0.2, 60, 0, Math.PI * 2)
    ctx.fill()
  }
}

// ─── Platforms ───────────────────────────────────────────────────────────────

export function drawPlatform(ctx, platform, isHighlight = false) {
  const { x, y, width: w, stage } = platform
  const h = 14

  if (isHighlight) {
    // Gold glow
    ctx.shadowColor = '#FFD700'
    ctx.shadowBlur = 10
  }

  if (stage === 1) {
    // Grass/dirt — green top, brown body
    ctx.fillStyle = '#5d8a3c'
    ctx.fillRect(x, y, w, 5)
    ctx.fillStyle = '#4a8c2a'
    ctx.fillRect(x + 2, y, w - 4, 4)
    ctx.fillStyle = '#8B4513'
    ctx.fillRect(x, y + 5, w, h - 5)
    // Grass tufts
    ctx.fillStyle = '#2ecc71'
    for (let i = 2; i < w - 4; i += 6) {
      ctx.fillRect(x + i, y - 2, 2, 3)
    }
  } else if (stage === 2) {
    // Stone / cloud — gray with white puffs
    ctx.fillStyle = '#ecf0f1'
    ctx.fillRect(x, y, w, h)
    ctx.fillStyle = '#bdc3c7'
    ctx.fillRect(x, y + h - 4, w, 4)
    // Cloud puffs
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    for (let i = 4; i < w - 6; i += 10) {
      ctx.beginPath()
      ctx.arc(x + i + 3, y + 3, 5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = '#95a5a6'
    ctx.fillRect(x + 2, y + h - 5, w - 4, 2)
  } else {
    // Icy/space rock — light blue/gray crystalline
    ctx.fillStyle = '#a8d8ea'
    ctx.fillRect(x, y, w, h)
    ctx.fillStyle = '#85c1e9'
    ctx.fillRect(x, y + h - 4, w, 4)
    // Crystal highlights
    ctx.fillStyle = '#d6eaf8'
    for (let i = 3; i < w - 4; i += 8) {
      ctx.fillRect(x + i, y + 2, 3, 4)
    }
    ctx.fillStyle = '#2980b9'
    ctx.fillRect(x, y + h - 2, w, 2)
  }

  ctx.shadowBlur = 0
  ctx.shadowColor = 'transparent'

  // Platform number
  ctx.fillStyle = isHighlight ? '#FFD700' : 'rgba(255,255,255,0.7)'
  ctx.font = 'bold 8px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(platform.index, x + w / 2, y + h - 2)
}

// ─── Player ──────────────────────────────────────────────────────────────────

export function drawPlayer(ctx, player) {
  const { x, y, vy = 0, onGround = false } = player
  const w = 20
  const h = 28

  // Determine animation state
  const isJumping = !onGround && vy < 0
  const isFalling = !onGround && vy >= 0

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)'
  ctx.fillRect(x + 2, y + h, w - 4, 3)

  // Body (blue tunic)
  ctx.fillStyle = '#2980b9'
  ctx.fillRect(x + 4, y + 12, w - 8, 14)

  // Legs (animated)
  ctx.fillStyle = '#1a5276'
  if (isJumping) {
    ctx.fillRect(x + 4, y + 22, 6, 6)
    ctx.fillRect(x + w - 10, y + 20, 6, 8)
  } else if (isFalling) {
    ctx.fillRect(x + 4, y + 22, 6, 8)
    ctx.fillRect(x + w - 10, y + 22, 6, 8)
  } else {
    ctx.fillRect(x + 4, y + 22, 6, 8)
    ctx.fillRect(x + w - 10, y + 22, 6, 8)
  }

  // Head (skin)
  ctx.fillStyle = '#f0c27f'
  ctx.fillRect(x + 4, y + 2, w - 8, 12)

  // Hat (adventure hat — brown)
  ctx.fillStyle = '#6d4c41'
  ctx.fillRect(x + 2, y + 4, w - 4, 4)   // brim
  ctx.fillRect(x + 6, y, w - 12, 6)       // crown

  // Eyes
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(x + 7, y + 6, 2, 2)
  ctx.fillRect(x + w - 9, y + 6, 2, 2)

  // Mouth
  ctx.fillStyle = '#c0392b'
  ctx.fillRect(x + 8, y + 10, 4, 1)

  // Arms
  ctx.fillStyle = '#2980b9'
  if (isJumping) {
    ctx.fillRect(x, y + 10, 4, 6)        // arms up
    ctx.fillRect(x + w - 4, y + 10, 4, 6)
  } else {
    ctx.fillRect(x, y + 13, 4, 8)
    ctx.fillRect(x + w - 4, y + 13, 4, 8)
  }

  // Scarf (white)
  ctx.fillStyle = '#ecf0f1'
  ctx.fillRect(x + 4, y + 13, w - 8, 3)
}

// ─── HUD ─────────────────────────────────────────────────────────────────────

export function drawHUD(ctx, { score, deaths, platform, width }) {
  // Semi-transparent bar
  ctx.fillStyle = 'rgba(0,0,0,0.55)'
  ctx.fillRect(0, 0, width, 32)

  // Hearts for deaths (red = dead, gray = alive stock)
  for (let i = 0; i < Math.min(deaths, 5); i++) {
    drawHeart(ctx, 10 + i * 16, 8, '#e74c3c')
  }
  if (deaths > 5) {
    ctx.fillStyle = '#e74c3c'
    ctx.font = '10px monospace'
    ctx.textAlign = 'left'
    ctx.fillText(`×${deaths}`, 10, 20)
  }

  // Level centre
  ctx.fillStyle = '#f1c40f'
  ctx.font = 'bold 13px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(`LEVEL ${platform ?? 0} / 30`, width / 2, 21)

  // Score right
  ctx.fillStyle = '#2ecc71'
  ctx.font = '12px monospace'
  ctx.textAlign = 'right'
  ctx.fillText(`⭐ ${score}`, width - 10, 21)
}

function drawHeart(ctx, x, y, color) {
  ctx.fillStyle = color
  ctx.fillRect(x + 2, y, 4, 2)
  ctx.fillRect(x + 8, y, 4, 2)
  ctx.fillRect(x, y + 2, 14, 4)
  ctx.fillRect(x + 2, y + 6, 10, 2)
  ctx.fillRect(x + 4, y + 8, 6, 2)
  ctx.fillRect(x + 6, y + 10, 2, 2)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function drawTriangle(ctx, tipX, baseY, halfBase, height) {
  ctx.beginPath()
  ctx.moveTo(tipX, baseY - height)
  ctx.lineTo(tipX - halfBase, baseY)
  ctx.lineTo(tipX + halfBase, baseY)
  ctx.closePath()
  ctx.fill()
}

function drawRoofPixel(ctx, x, y, w, h) {
  ctx.beginPath()
  ctx.moveTo(x + w / 2, y)
  ctx.lineTo(x + w, y + h)
  ctx.lineTo(x, y + h)
  ctx.closePath()
  ctx.fill()
}

function drawPixelTree(ctx, x, y) {
  // Trunk
  ctx.fillStyle = '#6d4c41'
  ctx.fillRect(x + 6, y + 20, 8, 16)
  // Layers
  ctx.fillStyle = '#27ae60'
  ctx.fillRect(x, y + 12, 20, 12)
  ctx.fillStyle = '#2ecc71'
  ctx.fillRect(x + 2, y + 4, 16, 12)
  ctx.fillRect(x + 4, y, 12, 8)
}

function drawCloud(ctx, x, y, size) {
  const s = size / 60
  ctx.beginPath()
  ctx.arc(x, y, 18 * s, 0, Math.PI * 2)
  ctx.arc(x + 20 * s, y - 8 * s, 22 * s, 0, Math.PI * 2)
  ctx.arc(x + 44 * s, y, 16 * s, 0, Math.PI * 2)
  ctx.fill()
}

function drawGoat(ctx, x, y) {
  ctx.fillStyle = '#ecf0f1'
  // Body
  ctx.fillRect(x, y + 8, 22, 12)
  // Head
  ctx.fillRect(x + 14, y + 2, 10, 10)
  // Legs
  ctx.fillStyle = '#bdc3c7'
  ctx.fillRect(x + 2, y + 18, 4, 8)
  ctx.fillRect(x + 8, y + 18, 4, 8)
  ctx.fillRect(x + 14, y + 18, 4, 8)
  // Horn
  ctx.fillStyle = '#f1c40f'
  ctx.fillRect(x + 20, y, 3, 6)
  // Eye
  ctx.fillStyle = '#2c3e50'
  ctx.fillRect(x + 20, y + 4, 2, 2)
}

function lerpColor(hex1, hex2, t) {
  const r1 = parseInt(hex1.slice(1, 3), 16)
  const g1 = parseInt(hex1.slice(3, 5), 16)
  const b1 = parseInt(hex1.slice(5, 7), 16)
  const r2 = parseInt(hex2.slice(1, 3), 16)
  const g2 = parseInt(hex2.slice(3, 5), 16)
  const b2 = parseInt(hex2.slice(5, 7), 16)
  const r = Math.round(r1 + (r2 - r1) * t)
  const g = Math.round(g1 + (g2 - g1) * t)
  const b = Math.round(b1 + (b2 - b1) * t)
  return `rgb(${r},${g},${b})`
}
