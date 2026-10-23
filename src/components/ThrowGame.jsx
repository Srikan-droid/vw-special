import { useState, useRef, useEffect } from 'react'
import { createGame } from '../game/engine'
import { THROWABLES, FINALE } from '../game/levels'
import { initAudio, startMusic, setMuted, isMuted } from '../game/audio'
import './ThrowGame.css'

const AUTOPLAY = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('autoplay')

function ThrowGame() {
  const canvasRef = useRef(null)
  const gameRef = useRef(null)
  const toastTimer = useRef(null)
  const bannerTimer = useRef(null)
  const [phase, setPhase] = useState('title') // title → play → finale → forgiven
  const [hud, setHud] = useState(null)
  const [toast, setToast] = useState(null)
  const [banner, setBanner] = useState(null)
  const [thrownOnce, setThrownOnce] = useState(false)
  const [letter, setLetter] = useState(null)
  const [letterOpen, setLetterOpen] = useState(false)
  const [muted, setMutedState] = useState(isMuted)

  useEffect(() => {
    const game = createGame(
      canvasRef.current,
      (type, v) => {
        if (type === 'state') setHud(v)
        else if (type === 'phase') setPhase(v)
        else if (type === 'thrown') setThrownOnce(true)
        else if (type === 'toast') {
          clearTimeout(toastTimer.current)
          setToast({ ...v, key: Date.now() })
          toastTimer.current = setTimeout(() => setToast(null), 2800)
        } else if (type === 'banner') {
          clearTimeout(bannerTimer.current)
          setBanner(v)
          bannerTimer.current = setTimeout(() => setBanner(null), 2300)
        } else if (type === 'done') {
          setLetter(v)
          setLetterOpen(true)
        }
      },
      { autoplay: AUTOPLAY },
    )
    gameRef.current = game
    return () => {
      game.destroy()
      clearTimeout(toastTimer.current)
      clearTimeout(bannerTimer.current)
    }
  }, [])

  const start = () => {
    initAudio()
    startMusic()
    setLetter(null)
    setLetterOpen(false)
    setThrownOnce(false)
    gameRef.current.start()
  }

  const toggleMute = () => {
    setMuted(!muted)
    setMutedState(!muted)
  }

  const queue = hud?.queue ?? []

  return (
    <div className="tg-stage">
      <canvas ref={canvasRef} className="tg-canvas" onContextMenu={(e) => e.preventDefault()} />

      {phase !== 'title' && hud && (
        <div className="tg-hud">
          <div className="tg-level">
            <b>{phase === 'play' ? `LEVEL ${hud.level + 1}` : 'FINAL'}</b>
            <span>{phase === 'play' ? hud.levelName : 'One last throw'}</span>
          </div>
          <div className="tg-row">
            <div className="tg-queue" aria-label="Things left to throw">
              {(phase === 'play' ? queue : []).slice(0, 6).map((t, i) => (
                <span key={`${t}-${i}`} className={i === 0 ? 'tg-next' : ''}>
                  {THROWABLES[t]?.emoji}
                </span>
              ))}
              {phase !== 'play' && <span className="tg-next">💗</span>}
            </div>
            {phase === 'play' && (
              <div className="tg-bonks" aria-label={`${hud.bonks} of ${hud.need} bonks`}>
                💥
                {Array.from({ length: hud.need }, (_, i) => (
                  <i key={i} className={i < hud.bonks ? 'on' : ''} />
                ))}
              </div>
            )}
            <span className="tg-chip">🧱 {hud.stats.smashed}</span>
            <button type="button" className="tg-chip tg-chip--btn" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
              {muted ? '🔇' : '🔊'}
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="tg-toast" key={toast.key}>
          <span className="tg-toast-icon">{toast.icon}</span>
          <div>
            <div className="tg-toast-title">
              {toast.title} <span>now</span>
            </div>
            <div className="tg-toast-text">{toast.text}</div>
          </div>
        </div>
      )}

      {phase === 'play' && !thrownOnce && (
        <div className="tg-hint">
          <span className="tg-hint-hand">👆</span>
          drag back &amp; let go to throw
        </div>
      )}

      {phase === 'finale' && <div className="tg-prompt">{FINALE.prompt}</div>}

      {banner && (
        <div className="tg-banner">
          <small>LEVEL {banner.level}</small>
          <strong>{banner.name}</strong>
          <span>{banner.sub}</span>
        </div>
      )}

      {phase === 'title' && (
        <div className="tg-title">
          <div className="tg-title-card">
            <p className="tg-presents">a very sorry production presents</p>
            <h1>
              Guluru&apos;s <span>Revenge</span> 🩴
            </h1>
            <p>
              Srikant messed up. He&apos;s dumb, he doesn&apos;t express, and he never initiates. Now he&apos;s hiding
              behind all of it.
            </p>
            <p className="tg-goal">Go knock some sense into him.</p>
            <div className="tg-howto">
              <span>👆 drag back</span>
              <span>🎯 aim</span>
              <span>💥 let go</span>
            </div>
            <button type="button" className="tg-btn" onClick={start}>
              Let me at him 😤
            </button>
          </div>
        </div>
      )}

      {phase === 'forgiven' && letter && !letterOpen && (
        <button type="button" className="tg-reopen" onClick={() => setLetterOpen(true)}>
          💌 read his letter
        </button>
      )}

      {letterOpen && letter && (
        <div className="tg-letter-overlay">
          <div className="tg-letter">
            <div className="tg-stats">
              <span>🩴 {letter.thrown} things thrown</span>
              <span>💥 {letter.bonks} bonks</span>
              <span>🧱 {letter.smashed} flaws smashed</span>
            </div>
            <div className="tg-letter-body">
              <p>Dear Aliva,</p>
              <p>
                I know I have said sorry already but there is only so much thing I can do from here. But if I were
                there with you, you&apos;d never have been angry with me for this long. I&apos;d have definitely kissed
                you and teased you and danced for you awkwardly or made some good food for you to mend things.
              </p>
              <p>
                It&apos;s already difficult staying away from you, please don&apos;t stay mad at me anymore and deprive
                me of the daily opportunity to look at your beautiful laughing face.
              </p>
              <p>I am blessed to have you in my life and I will be lucky to marry you one day.</p>
              <p>Love ya ❤️</p>
              <p className="tg-signoff">Srikant 💌</p>
            </div>
            <div className="tg-letter-actions">
              <button type="button" className="tg-btn" onClick={() => setLetterOpen(false)}>
                Watch the fireworks ✨
              </button>
              <button type="button" className="tg-link" onClick={start}>
                bonk him again ↺
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ThrowGame
