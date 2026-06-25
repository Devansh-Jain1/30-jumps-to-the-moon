/**
 * MenuScreen.jsx — initial MENU state screen.
 */
import PropTypes from 'prop-types'

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#1a1a2e',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  title: {
    fontSize: '3rem',
    fontWeight: 'bold',
    margin: '0 0 1rem',
    textShadow: '0 0 20px #4a9eff',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#a0a0c0',
    margin: '0 0 3rem',
    maxWidth: '400px',
    textAlign: 'center',
  },
  button: {
    padding: '1rem 2.5rem',
    fontSize: '1.2rem',
    fontFamily: 'monospace',
    background: '#4a9eff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    letterSpacing: '0.05em',
  },
  moon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
}

export default function MenuScreen({ onStart, loading }) {
  return (
    <div style={styles.container}>
      <div style={styles.moon} aria-hidden="true">🌙</div>
      <h1 style={styles.title}>30 Jumps to the Moon</h1>
      <p style={styles.subtitle}>
        Jump across 30 platforms from Earth to the Moon
      </p>
      <button
        style={styles.button}
        onClick={onStart}
        disabled={loading}
        aria-label="Start Game"
      >
        {loading ? 'Starting…' : 'Start Game'}
      </button>
    </div>
  )
}

MenuScreen.propTypes = {
  onStart: PropTypes.func.isRequired,
  loading: PropTypes.bool,
}

MenuScreen.defaultProps = {
  loading: false,
}
