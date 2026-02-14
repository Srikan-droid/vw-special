import { useState, useRef, useCallback } from 'react'
import './Landing.css'

const NEEDED = 3
const PHRASE = 'i love you'
const SUCCESS_MESSAGES = [
  'a little louder',
  'one more time ....pleaseeee',
]

function Landing({ onComplete }) {
  const [count, setCount] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [listening, setListening] = useState(false)
  const [noSpeechSupport, setNoSpeechSupport] = useState(false)
  const [escapeTaps, setEscapeTaps] = useState(0)
  const [showPopup, setShowPopup] = useState(false)
  const [micReady, setMicReady] = useState(false)
  const recognitionRef = useRef(null)

  const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
  const supported = !!SpeechRecognition

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (_) {}
      recognitionRef.current = null
    }
    setListening(false)
  }, [])

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      setNoSpeechSupport(true)
      return
    }
    if (recognitionRef.current) {
      stopListening()
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setListening(true)
      setFeedback('')
    }

    recognition.onend = () => {
      setListening(false)
      recognitionRef.current = null
    }

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = (event.results[i][0].transcript || '').trim().toLowerCase()
        if (transcript.includes(PHRASE) || transcript === 'i love you') {
          setCount((prev) => {
            const newCount = prev + 1
            if (newCount >= NEEDED) {
              setFeedback('I love you too, Guluru💕')
              try { recognition.stop() } catch (_) {}
              setTimeout(onComplete, 1200)
            } else {
              setFeedback(SUCCESS_MESSAGES[newCount - 1] || '')
              try { recognition.stop() } catch (_) {}
            }
            return newCount
          })
          return
        }
      }
    }

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') setFeedback("I didn't hear anything. Try again?")
      else if (event.error !== 'aborted') setFeedback('Something went wrong. Tap the mic to try again.')
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [onComplete, stopListening, SpeechRecognition])

  const handleMicAreaClick = () => {
    if (listening) {
      stopListening()
      return
    }
    if (!micReady) {
      if (escapeTaps === 0) {
        setEscapeTaps(1)
        return
      }
      if (escapeTaps === 1) {
        setEscapeTaps(2)
        setShowPopup(true)
        return
      }
      return
    }
    if (!supported) {
      setNoSpeechSupport(true)
      return
    }
    startListening()
  }

  const dismissPopup = () => {
    setShowPopup(false)
    setMicReady(true)
    setEscapeTaps(0)
  }

  const micEscapeClass = escapeTaps === 1 ? 'mic-escape-right' : escapeTaps === 2 ? 'mic-escape-left' : ''

  return (
    <>
      <div className="bg-decorations" aria-hidden="true">
        {/* Hearts */}
        {[...Array(18)].map((_, i) => (
          <span key={`h-${i}`} className="bg-heart" style={{ left: `${5 + (i * 5) % 90}%`, top: `${(i * 7) % 95}%`, animationDelay: `${i * 0.4}s` }}>♥</span>
        ))}
        {/* Cats */}
        {['🐱', '😺', '🐈', '😸'].map((emoji, i) => (
          <span key={`c-${i}`} className="bg-cat" style={{ left: `${10 + i * 22}%`, top: `${15 + (i % 3) * 28}%`, animationDelay: `${i * 0.6}s` }}>{emoji}</span>
        ))}
        {/* Food */}
        {['🧁', '🍩', '🍪', '🍫', '🍬', '🍭', '🥧', '🍰'].map((emoji, i) => (
          <span key={`f-${i}`} className="bg-food" style={{ left: `${(i * 11) % 85}%`, top: `${20 + (i * 13) % 70}%`, animationDelay: `${i * 0.5}s` }}>{emoji}</span>
        ))}
      </div>

      {showPopup && (
        <div className="popup-overlay" onClick={dismissPopup}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <p className="popup-text">Umm what's taking you long?</p>
            <button type="button" className="popup-btn" onClick={dismissPopup}>
              I'm trying 😢
            </button>
          </div>
        </div>
      )}

      <main className="card landing-card">
        <p className="single-prompt">Tap the mic and say &ldquo;I love you&rdquo;</p>
        <div className="mic-wrap">
          <div
            className="mic-hit-zone"
            onClick={handleMicAreaClick}
            role="button"
            tabIndex={0}
            aria-label="Tap to start"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleMicAreaClick() }}
          >
            <button
              type="button"
              className={`mic-btn ${listening ? 'listening' : ''} ${micEscapeClass}`}
              aria-label="Microphone"
            >
              <span className="mic-icon">{listening ? '🔴' : '🎤'}</span>
            </button>
          </div>
        </div>
        {count > 0 && (
          <p className="count" aria-live="polite">
            {count} of {NEEDED} 💕
          </p>
        )}
        {feedback && (
          <p className={`feedback ${count >= NEEDED ? 'success' : ''}`} aria-live="polite">
            {feedback}
          </p>
        )}
        {noSpeechSupport && (
          <div className="no-speech">
            Voice isn't supported in this browser. Try <strong>Chrome on your phone</strong>.{' '}
            <button type="button" className="skip-link" onClick={onComplete}>
              Skip to the surprise →
            </button>
          </div>
        )}
      </main>
    </>
  )
}

export default Landing
