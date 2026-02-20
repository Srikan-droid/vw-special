import { useState, useEffect } from 'react'
import './Intro.css'

const COUNTDOWN_SEC = 0.9
const CHARACTER_SEC = 3.2
const WORD_DELAY_MS = 420
const WORDS = ["LET'S", 'PLAY', 'A', 'GAME']

function Intro({ onComplete }) {
  const [phase, setPhase] = useState('countdown')
  const [count, setCount] = useState(3)
  const [wordIndex, setWordIndex] = useState(-1)

  // Countdown: 3 → 2 → 1
  useEffect(() => {
    if (phase !== 'countdown') return
    if (count <= 0) {
      setPhase('character')
      return
    }
    const t = setTimeout(() => setCount((c) => c - 1), COUNTDOWN_SEC * 1000)
    return () => clearTimeout(t)
  }, [phase, count])

  // After character phase, go to words
  useEffect(() => {
    if (phase !== 'character') return
    const t = setTimeout(() => setPhase('words'), CHARACTER_SEC * 1000)
    return () => clearTimeout(t)
  }, [phase])

  // Words one by one, then done
  useEffect(() => {
    if (phase !== 'words') return
    if (wordIndex >= WORDS.length) {
      const t = setTimeout(onComplete, 600)
      return () => clearTimeout(t)
    }
    if (wordIndex === -1) {
      setWordIndex(0)
      return
    }
    const t = setTimeout(() => setWordIndex((i) => i + 1), WORD_DELAY_MS)
    return () => clearTimeout(t)
  }, [phase, wordIndex, onComplete])

  return (
    <div className="intro-overlay">
      {phase === 'countdown' && count > 0 && (
        <div className="intro-countdown" key={count}>
          <span className="countdown-number">{count}</span>
        </div>
      )}

      {phase === 'character' && (
        <div className="intro-character-phase">
          <div className="intro-guy-wrap">
            <div className="intro-guy">
              <svg viewBox="0 0 64 64" className="intro-guy-svg">
                {/* Hair (behind face) */}
                <ellipse cx="32" cy="20" rx="20" ry="16" fill="#3d2c1f" />
                {/* Body */}
                <ellipse cx="32" cy="48" rx="18" ry="10" fill="#f5c6ce" />
                {/* Face */}
                <circle cx="32" cy="24" r="18" fill="#ffdfc4" stroke="#e8b89a" strokeWidth="1" />
                {/* Glasses */}
                <ellipse cx="26" cy="23" rx="6" ry="5" fill="none" stroke="#3d3d3d" strokeWidth="1.8" />
                <ellipse cx="38" cy="23" rx="6" ry="5" fill="none" stroke="#3d3d3d" strokeWidth="1.8" />
                <line x1="32" y1="22.5" x2="32" y2="22.5" stroke="#3d3d3d" strokeWidth="1.2" />
                <line x1="20" y1="21" x2="16" y2="19" stroke="#3d3d3d" strokeWidth="1" />
                <line x1="44" y1="21" x2="48" y2="19" stroke="#3d3d3d" strokeWidth="1" />
                <circle cx="26" cy="23" r="2" fill="#5c3d42" />
                <circle cx="38" cy="23" r="2" fill="#5c3d42" />
                <path d="M 26 30 Q 32 34 38 30" fill="none" stroke="#c76b7a" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="intro-speech" aria-hidden="true">
              {'Guluruuuuuuuuuuuuu'.split('').map((char, i) => (
                <span key={i} className="intro-speech-char" style={{ '--char-index': i }}>
                  {char}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === 'words' && (
        <div className="intro-words-wrap intro-words-countdown-style">
          {WORDS.map((_, i) => (
            <span
              key={i}
              className={`intro-word countdown-style ${wordIndex >= i ? 'intro-word-visible' : ''}`}
            >
              {WORDS[i]}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default Intro
