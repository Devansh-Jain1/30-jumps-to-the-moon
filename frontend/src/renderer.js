/**
 * renderer.js — pure canvas drawing helpers (no React, no state).
 */

export function drawBackground(ctx, width, height) {
  // Space gradient: dark blue at top, darker at bottom
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#0a0a1a')
  gradient.addColorStop(1, '#1a1a2e')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // Simple stars (deterministic via position hash)
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  for (let i = 0; i < 80; i++) {
    const x = ((i * 137 + 11) * 31) % width
    const y = ((i * 97 + 7) * 43) % height
    ctx.fillRect(x, y, 1, 1)
  }
}

export function drawPlatform(ctx, platform, isHighlight = false) {
  const { x, y, width: w, height: h = 12 } = platform
  ctx.fillStyle = isHighlight ? '#ffd700' : '#4a9eff'
  ctx.fillRect(x, y, w, h)

  // Platform index label
  if (platform.index !== undefined) {
    ctx.fillStyle = isHighlight ? '#1a1a2e' : '#ffffff'
    ctx.font = '10px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(platform.index, x + w / 2, y + h - 2)
  }
}

export function drawPlayer(ctx, player) {
  const { x, y, width: w = 24, height: h = 24 } = player
  ctx.fillStyle = '#ff6b6b'
  ctx.fillRect(x, y, w, h)

  // Simple face
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(x + 5, y + 6, 4, 4)
  ctx.fillRect(x + 15, y + 6, 4, 4)
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(x + 7, y + 8, 2, 2)
  ctx.fillRect(x + 17, y + 8, 2, 2)
}

export function drawHUD(ctx, { score, deaths, platform, width }) {
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fillRect(0, 0, width, 28)

  ctx.fillStyle = '#ffffff'
  ctx.font = '14px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(`Score: ${score}`, 10, 18)

  ctx.textAlign = 'center'
  ctx.fillText(`Platform: ${platform ?? 0} / 30`, width / 2, 18)

  ctx.textAlign = 'right'
  ctx.fillText(`Deaths: ${deaths}`, width - 10, 18)
}
