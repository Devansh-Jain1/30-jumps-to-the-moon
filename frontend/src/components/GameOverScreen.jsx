/**
 * GameOverScreen.jsx — minimal overlay shown for 1 second after a platform-5+ death.
 * Not a separate screen — rendered as an overlay on top of the game canvas.
 */
import PropTypes from 'prop-types'

const styles = {
  overlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.6)',
    zIndex: 10,
    fontFamily: 'monospace',
    color: '#ffffff',
  },
  box: {
    textAlign: 'center',
  },
  heading: {
    fontSize: '2rem',
    margin: '0 0 0.5rem',
    color: '#ff6b6b',
  },
  sub: {
    fontSize: '1rem',
    color: '#a0a0c0',
  },
}

export default function GameOverScreen({ visible }) {
  if (!visible) return null
  return (
    <div style={styles.overlay} role="status" aria-live="polite">
      <div style={styles.box}>
        <h2 style={styles.heading}>Respawning…</h2>
        <p style={styles.sub}>New layout incoming</p>
      </div>
    </div>
  )
}

GameOverScreen.propTypes = {
  visible: PropTypes.bool.isRequired,
}
