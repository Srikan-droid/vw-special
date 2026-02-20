import { useState, useRef, useEffect, useCallback } from 'react'
import './HeartCatchGame.css'

const HEARTS_TO_WIN = 14
const LIVES = 3
const SPAWN_INTERVAL_MS = 1400
const FALL_SPEED = 0.15
const PLAYER_WIDTH = 80
const ITEM_SIZE = 44

const ITEM_TYPES = {
  heart: { emoji: '💕', score: 1, life: 0, weight: 58 },
  broken: { emoji: '💔', score: -2, life: -1, weight: 22 },
  lemon: { emoji: '🍋', score: -1, life: -1, weight: 20 },
}

function randomItemType() {
  const rand = Math.random() * 100
  if (rand < ITEM_TYPES.heart.weight) return 'heart'
  if (rand < ITEM_TYPES.heart.weight + ITEM_TYPES.broken.weight) return 'broken'
  return 'lemon'
}

function HeartCatchGame({ onWin }) {
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(LIVES)
  const [items, setItems] = useState([])
  const [gameOver, setGameOver] = useState(null)
  const [started, setStarted] = useState(false)
  const containerRef = useRef(null)
  const playerRef = useRef(null)
  const itemsRef = useRef([])
  const playerXRef = useRef(50)
  const rafRef = useRef(null)


  useEffect(() => {
    const container = containerRef.current
    if (!container || !playerRef.current) return

    const updatePosition = (clientX) => {
      const rect = container.getBoundingClientRect()
      const percent = Math.max(0, Math.min(100, ((clientX - rect.left - PLAYER_WIDTH / 2) / (rect.width - PLAYER_WIDTH)) * 100))
      playerXRef.current = percent
      const px = (percent / 100) * (rect.width - PLAYER_WIDTH)
      playerRef.current.style.transform = `translateX(${px}px)`
    }

    const onMove = (e) => {
      updatePosition(e.touches ? e.touches[0].clientX : e.clientX)
    }
    const onTouch = (e) => {
      e.preventDefault()
      if (e.touches.length) updatePosition(e.touches[0].clientX)
    }

    const rect = container.getBoundingClientRect()
    const initialPx = (50 / 100) * (rect.width - PLAYER_WIDTH)
    playerRef.current.style.transform = `translateX(${initialPx}px)`

    container.addEventListener('mousemove', onMove)
    container.addEventListener('touchmove', onTouch, { passive: false })
    container.addEventListener('touchstart', onTouch, { passive: false })
    return () => {
      container.removeEventListener('mousemove', onMove)
      container.removeEventListener('touchmove', onTouch)
      container.removeEventListener('touchstart', onTouch)
    }
  }, [])

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  useEffect(() => {
    if (gameOver || !started) return

    let lastTime = performance.now()

    const tick = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now

      const prev = itemsRef.current
      const bounds = containerRef.current?.getBoundingClientRect()
      const px = bounds ? (playerXRef.current / 100) * (bounds.width - PLAYER_WIDTH) : 0

      let scoreDelta = 0
      let lifeDelta = 0

      const next = prev
        .map((item) => ({
          ...item,
          y: item.y + FALL_SPEED * dt * 100,
        }))
        .filter((item) => {
          if (item.y > 92) return false
          if (!bounds) return true
          const itemLeft = (item.x / 100) * bounds.width
const overlap =
              itemLeft + ITEM_SIZE / 2 > px &&
              itemLeft - ITEM_SIZE / 2 < px + PLAYER_WIDTH &&
              item.y > 76
          if (overlap) {
            const type = ITEM_TYPES[item.type]
            scoreDelta += type.score
            lifeDelta += type.life
            return false
          }
          return true
        })

      if (scoreDelta !== 0) setScore((s) => Math.max(0, s + scoreDelta))
      if (lifeDelta !== 0) setLives((l) => l + lifeDelta)
      setItems(next)

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [gameOver, started])

  useEffect(() => {
    if (gameOver || !started) return

    const spawn = () => {
      setItems((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).slice(2),
          type: randomItemType(),
          x: 10 + Math.random() * 80,
          y: 0,
        },
      ])
    }

    const interval = setInterval(() => {
      spawn()
    }, SPAWN_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [gameOver, started])

  useEffect(() => {
    if (lives <= 0) setGameOver('lose')
    if (score >= HEARTS_TO_WIN) setGameOver('win')
  }, [score, lives])

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 600)
    return () => clearTimeout(t)
  }, [])

  const handlePlayAgain = () => {
    setScore(0)
    setLives(LIVES)
    setItems([])
    setGameOver(null)
    setStarted(true)
  }

  if (gameOver === 'win') {
    return (
      <div className="game-screen game-result">
        <div className="result-card result-win">
          <h2>You did it! 💕</h2>
          <p>You caught {score} hearts. I'm so proud of you!</p>
          <button type="button" className="result-btn" onClick={onWin}>
            Continue →
          </button>
        </div>
      </div>
    )
  }

  if (gameOver === 'lose') {
    return (
      <div className="game-screen game-result">
        <div className="result-card result-lose">
          <h2>Oops! 😢</h2>
          <p>You caught {score} hearts. Try again?</p>
          <button type="button" className="result-btn" onClick={handlePlayAgain}>
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="game-screen" ref={containerRef}>
      <div className="game-hud">
        <span className="hud-score">Hearts: {score}/{HEARTS_TO_WIN}</span>
        <span className="hud-lives">
          {[...Array(LIVES)].map((_, i) => (
            <span key={i} className={i < lives ? 'life-on' : 'life-off'}>♥</span>
          ))}
        </span>
      </div>

      <div className="game-thrower" aria-hidden="true">
        <span className="thrower-emoji">🐱</span>
        <span className="thrower-label">Catch the hearts!</span>
      </div>

      <div className="game-falling">
        {items.map((item) => (
          <div
            key={item.id}
            className={`falling-item item-${item.type}`}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
            }}
          >
            {ITEM_TYPES[item.type].emoji}
          </div>
        ))}
      </div>

      <div
        className="game-player"
        ref={playerRef}
        style={{ left: 0, transform: 'translateX(0)' }}
      >
        <div className="player-character" aria-hidden="true">
          <svg viewBox="0 0 80 76" className="player-svg">
            {/* Hair (behind face) */}
            <ellipse cx="40" cy="22" rx="21" ry="18" fill="#4a3728" />
            {/* Chubby body - round */}
            <ellipse cx="40" cy="60" rx="24" ry="14" fill="#f5c6ce" stroke="#e8a0a8" strokeWidth="1.2" />
            {/* Arms up catching */}
            <path d="M 16 44 Q 4 26 12 18 Q 18 14 24 20" fill="none" stroke="#f5c6ce" strokeWidth="6" strokeLinecap="round" />
            <path d="M 64 44 Q 76 26 68 18 Q 62 14 56 20" fill="none" stroke="#f5c6ce" strokeWidth="6" strokeLinecap="round" />
            <path d="M 16 44 Q 4 26 12 18 Q 18 14 24 20" fill="none" stroke="#e8a0a8" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 64 44 Q 76 26 68 18 Q 62 14 56 20" fill="none" stroke="#e8a0a8" strokeWidth="1.5" strokeLinecap="round" />
            {/* Chubby face - round and soft */}
            <circle cx="40" cy="28" r="20" fill="#ffdfc4" stroke="#e8b89a" strokeWidth="1.2" />
            {/* Spectacles */}
            <ellipse cx="32" cy="27" rx="10" ry="8" fill="none" stroke="#3d3d3d" strokeWidth="2.2" />
            <ellipse cx="48" cy="27" rx="10" ry="8" fill="none" stroke="#3d3d3d" strokeWidth="2.2" />
            <line x1="42" y1="26.5" x2="46" y2="26.5" stroke="#3d3d3d" strokeWidth="1.8" />
            <line x1="22" y1="24.5" x2="17" y2="23" stroke="#3d3d3d" strokeWidth="1.4" />
            <line x1="58" y1="24.5" x2="63" y2="23" stroke="#3d3d3d" strokeWidth="1.4" />
            {/* Eyes behind glasses */}
            <circle cx="32" cy="27" r="2.8" fill="#5c3d42" />
            <circle cx="48" cy="27" r="2.8" fill="#5c3d42" />
            {/* Smile */}
            <path d="M 31 35 Q 40 40 49 35" fill="none" stroke="#c76b7a" strokeWidth="1.6" strokeLinecap="round" />
            {/* Blush */}
            <ellipse cx="25" cy="35" rx="5" ry="2.5" fill="#e8a0a8" opacity="0.45" />
            <ellipse cx="55" cy="35" rx="5" ry="2.5" fill="#e8a0a8" opacity="0.45" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default HeartCatchGame
