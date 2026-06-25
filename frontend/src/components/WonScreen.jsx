/**
 * WonScreen.jsx — WON state screen, shows score summary + leaderboard.
 */
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { getHighscores } from '../api/gameApi.js'

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
    padding: '2rem',
  },
  heading: {
    fontSize: '3rem',
    margin: '0 0 0.5rem',
    textShadow: '0 0 20px #ffd700',
  },
  stats: {
    display: 'flex',
    gap: '2rem',
    margin: '1.5rem 0',
    fontSize: '1.1rem',
    color: '#a0e0ff',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#6080a0',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  table: {
    borderCollapse: 'collapse',
    width: '100%',
    maxWidth: '400px',
    margin: '1.5rem 0',
  },
  th: {
    borderBottom: '1px solid #4a9eff',
    padding: '0.5rem 1rem',
    color: '#4a9eff',
    textAlign: 'left',
  },
  td: {
    padding: '0.4rem 1rem',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  button: {
    marginTop: '1rem',
    padding: '1rem 2.5rem',
    fontSize: '1.2rem',
    fontFamily: 'monospace',
    background: '#4a9eff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  leaderboardTitle: {
    fontSize: '1.1rem',
    color: '#a0a0c0',
    margin: '0 0 0.25rem',
  },
}

export default function WonScreen({ score, deaths, sessionHighScore, onPlayAgain }) {
  const [highscores, setHighscores] = useState([])
  const [loadingScores, setLoadingScores] = useState(true)

  useEffect(() => {
    let cancelled = false
    getHighscores()
      .then((data) => {
        if (!cancelled) setHighscores(Array.isArray(data) ? data.slice(0, 10) : [])
      })
      .catch(() => {
        if (!cancelled) setHighscores([])
      })
      .finally(() => {
        if (!cancelled) setLoadingScores(false)
      })
    return () => { cancelled = true }
  }, [])

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>You Won! 🌙</h1>

      <div style={styles.stats}>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Score</span>
          <span style={styles.statValue}>{score}</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Deaths</span>
          <span style={styles.statValue}>{deaths}</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Session Best</span>
          <span style={styles.statValue}>{sessionHighScore}</span>
        </div>
      </div>

      <p style={styles.leaderboardTitle}>Global Leaderboard</p>

      {loadingScores ? (
        <p style={{ color: '#6080a0' }}>Loading scores…</p>
      ) : highscores.length === 0 ? (
        <p style={{ color: '#6080a0' }}>No scores yet.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Rank</th>
              <th style={styles.th}>Score</th>
              <th style={styles.th}>Deaths</th>
            </tr>
          </thead>
          <tbody>
            {highscores.map((entry, i) => (
              <tr key={i}>
                <td style={styles.td}>{entry.rank ?? i + 1}</td>
                <td style={styles.td}>{entry.score}</td>
                <td style={styles.td}>{entry.deaths}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button style={styles.button} onClick={onPlayAgain}>
        Play Again
      </button>
    </div>
  )
}

WonScreen.propTypes = {
  score: PropTypes.number.isRequired,
  deaths: PropTypes.number.isRequired,
  sessionHighScore: PropTypes.number.isRequired,
  onPlayAgain: PropTypes.func.isRequired,
}
