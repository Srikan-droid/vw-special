import { useState, useRef, useEffect, useMemo } from 'react'
import './SorryGame.css'

const TOTAL_STITCHES = 12
const MAX_BUBBLES = 6
const SPAWN_EVERY_MS = 800
const BUBBLE_SIZE = 64
const GRUMPY_CHANCE = 0.18

const GIFTS = ['💌', '🌹', '🍫', '🐱', '🧸', '🌸', '🍦', '☕', '🌻', '🎀']
const GRUMPIES = ['😤', '😒', '🌧️']

// One line per stitch (the last stitch gets the "mended" line instead)
const SORRY_LINES = [
  "I'm sorry, Guluru. Truly.",
  'I should have listened better.',
  "You didn't deserve that from me.",
  'No excuses. I was wrong.',
  "I hate being the reason you're upset.",
  "I already miss your 'tu kaha kindu?'",
  'Your smile is my favourite thing. I want it back.',
  "I'd send a hundred cat snaps if it'd help 🐱",
  "I'll do better. Not just say it, do it.",
  'Even when I mess up, I am all yours.',
  "Please don't stay angry for too long 🥺",
]

const GRUMPY_LINES = [
  'Okay. I deserved that. 😅',
  'Fair. Very, very fair.',
  'Ouch. Noted. 🥲',
  "Let it all out. I'm still sorry.",
  'Valid. Still love you though.',
]

const KITTEN_LINES = [
  "mew… (he's really, really sorry)",
  '*sad kitten noises*',
  "the kitten is on my side, just so you know",
  'mrrp? 🥺',
]

const NO_LINES = [
  'No',
  'Are you sure?',
  'Really sure? 🥺',
  'Kindu will cry…',
  'Think of the kitten!',
  'Pretty please?',
  'Last chance 😭',
  "Fine, I'll hide 🙈",
]

// Heart shape and the jagged crack down its middle (viewBox 0 0 200 180)
const HEART_PATH =
  'M100 170 C 40 128, 4 96, 4 58 C 4 26, 28 8, 54 8 C 74 8, 91 20, 100 38 C 109 20, 126 8, 146 8 C 172 8, 196 26, 196 58 C 196 96, 160 128, 100 170 Z'
const CRACK = [[100, 38], [91, 58], [107, 76], [93, 96], [108, 114], [95, 134], [104, 152], [100, 170]]
const CRACK_POINTS = CRACK.map((p) => p.join(',')).join(' ')
const LEFT_CLIP = `0,0 100,0 ${CRACK_POINTS} 100,180 0,180`
const RIGHT_CLIP = `200,0 100,0 ${CRACK_POINTS} 100,180 200,180`

function pointsAlong(poly, n) {
  const segs = []
  let total = 0
  for (let i = 1; i < poly.length; i++) {
    const [x1, y1] = poly[i - 1]
    const [x2, y2] = poly[i]
    const len = Math.hypot(x2 - x1, y2 - y1)
    segs.push({ x1, y1, x2, y2, len, start: total })
    total += len
  }
  return Array.from({ length: n }, (_, i) => {
    const d = ((i + 0.5) / n) * total
    const s = segs.find((seg) => d <= seg.start + seg.len) || segs[segs.length - 1]
    const t = (d - s.start) / s.len
    return [s.x1 + (s.x2 - s.x1) * t, s.y1 + (s.y2 - s.y1) * t]
  })
}

const STITCHES = pointsAlong(CRACK, TOTAL_STITCHES)

const RAIN = Array.from({ length: 34 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 1.2,
  duration: 0.7 + Math.random() * 0.5,
}))

const LOVE_RAIN = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  emoji: ['💖', '💕', '🌸', '✨', '💗'][i % 5],
  left: Math.random() * 100,
  delay: Math.random() * 6,
  duration: 6 + Math.random() * 5,
  size: 18 + Math.random() * 16,
}))

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const buzz = (pattern) => navigator.vibrate?.(pattern)

function MoodCloud({ p, gone }) {
  const angry = p < 0.5
  return (
    <div className={`cloud${gone ? ' cloud--gone' : ''}`}>
      <svg viewBox="0 0 160 90" aria-hidden="true">
        <g fill="#fff">
          <circle cx="45" cy="52" r="26" />
          <circle cx="80" cy="38" r="32" />
          <circle cx="115" cy="52" r="26" />
          <rect x="45" y="50" width="70" height="28" rx="14" />
        </g>
        <g fill="#6c6f86" style={{ opacity: 1 - p, transition: 'opacity .8s' }}>
          <circle cx="45" cy="52" r="26" />
          <circle cx="80" cy="38" r="32" />
          <circle cx="115" cy="52" r="26" />
          <rect x="45" y="50" width="70" height="28" rx="14" />
        </g>
        <g stroke="#3d2a2e" strokeWidth="2.5" strokeLinecap="round" fill="none">
          {angry && (
            <>
              <path d="M61 44 L72 48" />
              <path d="M99 44 L88 48" />
            </>
          )}
          <path d={p < 0.35 ? 'M73 67 Q80 61 87 67' : p < 0.75 ? 'M73 65 L87 65' : 'M73 63 Q80 70 87 63'} />
        </g>
        <circle cx="68" cy="54" r="3.2" fill="#3d2a2e" />
        <circle cx="92" cy="54" r="3.2" fill="#3d2a2e" />
        {p >= 0.5 && (
          <g fill="#f7a8b8" opacity=".8">
            <ellipse cx="60" cy="62" rx="5" ry="3" />
            <ellipse cx="100" cy="62" rx="5" ry="3" />
          </g>
        )}
      </svg>
      <span className="cloud-label">your mood</span>
    </div>
  )
}

function Kitten({ mood, flinch, onTap }) {
  const sad = mood === 'sad'
  const happy = mood === 'happy'
  const sign = happy ? 'LOVE U' : sad ? 'SORRY' : 'SO SORRY'
  return (
    <button
      type="button"
      className={`kitten kitten--${mood}${flinch ? ' kitten--flinch' : ''}`}
      onClick={onTap}
      aria-label="Sorry kitten"
    >
      <svg viewBox="0 0 140 150" aria-hidden="true">
        <path className="kitten-tail" d="M104 128 C 132 124, 136 96, 122 84" fill="none" stroke="#e9b98f" strokeWidth="10" strokeLinecap="round" />
        <ellipse cx="70" cy="118" rx="38" ry="28" fill="#f6d2ae" />
        <g className="kitten-ear kitten-ear--l">
          <path d="M40 48 L44 14 L66 34 Z" fill="#f6d2ae" />
          <path d="M45 40 L47 22 L59 33 Z" fill="#f7a8b8" />
        </g>
        <g className="kitten-ear kitten-ear--r">
          <path d="M100 48 L96 14 L74 34 Z" fill="#f6d2ae" />
          <path d="M95 40 L93 22 L81 33 Z" fill="#f7a8b8" />
        </g>
        <circle cx="70" cy="62" r="34" fill="#f6d2ae" />
        <path d="M62 32 L64 42 M70 30 L70 42 M78 32 L76 42" stroke="#e9b98f" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="47" cy="74" rx="7" ry="4.5" fill="#f7a8b8" opacity=".7" />
        <ellipse cx="93" cy="74" rx="7" ry="4.5" fill="#f7a8b8" opacity=".7" />
        {happy ? (
          <g stroke="#3d2a2e" strokeWidth="3.5" fill="none" strokeLinecap="round">
            <path d="M50 62 Q56 54 62 62" />
            <path d="M78 62 Q84 54 90 62" />
          </g>
        ) : (
          <g>
            <circle cx="56" cy="61" r="7" fill="#3d2a2e" />
            <circle cx="58.5" cy="58" r="2.6" fill="#fff" />
            <circle cx="54" cy="63.5" r="1.2" fill="#fff" />
            <circle cx="84" cy="61" r="7" fill="#3d2a2e" />
            <circle cx="86.5" cy="58" r="2.6" fill="#fff" />
            <circle cx="82" cy="63.5" r="1.2" fill="#fff" />
          </g>
        )}
        {sad && (
          <g stroke="#3d2a2e" strokeWidth="2.5" strokeLinecap="round">
            <path d="M47 50 L61 45" />
            <path d="M93 50 L79 45" />
          </g>
        )}
        <path d="M66 70 L74 70 L70 75 Z" fill="#f08a9c" />
        {happy ? (
          <path d="M60 78 Q70 92 80 78 Z" fill="#c2566a" />
        ) : (
          <path
            d={sad ? 'M62 82 Q70 76 78 82' : 'M62 78 Q66 82 70 78 Q74 82 78 78'}
            stroke="#3d2a2e"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        )}
        <g stroke="#c9a487" strokeWidth="1.5" strokeLinecap="round">
          <path d="M40 72 L20 68 M40 77 L20 79" />
          <path d="M100 72 L120 68 M100 77 L120 79" />
        </g>
        {sad && <path className="kitten-tear" d="M52 70 q-4 6 0 8 q4 -2 0 -8z" fill="#8ecae6" />}
        <g className="kitten-sign">
          <rect x="26" y="98" width="88" height="34" rx="8" fill="#fff" stroke="#c2566a" strokeWidth="2.5" />
          <text x="70" y="120" textAnchor="middle">{sign}</text>
        </g>
        <ellipse cx="32" cy="101" rx="9" ry="7" fill="#f6d2ae" stroke="#e9b98f" strokeWidth="1.5" />
        <ellipse cx="108" cy="101" rx="9" ry="7" fill="#f6d2ae" stroke="#e9b98f" strokeWidth="1.5" />
      </svg>
    </button>
  )
}

function SorryGame() {
  const [phase, setPhase] = useState('intro') // intro → play → mended → ask → forgiven
  const [stitches, setStitches] = useState(0)
  const [bubbles, setBubbles] = useState([])
  const [flyers, setFlyers] = useState([])
  const [message, setMessage] = useState({ text: "My heart's a little broken… 💔", k: 0 })
  const [flinch, setFlinch] = useState(false)
  const [noCount, setNoCount] = useState(0)
  const [noPos, setNoPos] = useState(null)
  const [burstKey, setBurstKey] = useState(0)
  const [hugs, setHugs] = useState(0)

  const stageRef = useRef(null)
  const heartRef = useRef(null)
  const posRef = useRef(new Map())
  const elRefs = useRef(new Map())
  const nextId = useRef(1)
  const caughtRef = useRef(0)
  const timers = useRef(new Set())

  const later = (fn, ms) => {
    const t = setTimeout(() => {
      timers.current.delete(t)
      fn()
    }, ms)
    timers.current.add(t)
  }

  const say = (text) => setMessage((m) => ({ text, k: m.k + 1 }))

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  // Bubble loop: spawn gifts at the bottom and float them up
  useEffect(() => {
    if (phase !== 'play') return
    let last = performance.now()
    let spawnAcc = SPAWN_EVERY_MS - 250
    let raf

    const spawn = (w, h) => {
      const id = nextId.current++
      const grumpy = Math.random() < GRUMPY_CHANCE
      const b = {
        id,
        grumpy,
        emoji: pick(grumpy ? GRUMPIES : GIFTS),
        x: 8 + Math.random() * Math.max(0, w - BUBBLE_SIZE - 16),
        y: h + 10,
      }
      posRef.current.set(id, {
        ...b,
        cx: b.x,
        vy: 85 + Math.random() * 45 + caughtRef.current * 4,
        t: 0,
        amp: 8 + Math.random() * 14,
        freq: 1.2 + Math.random(),
        phase: Math.random() * 6,
      })
      setBubbles((prev) => [...prev, b])
    }

    const tick = (now) => {
      const dt = Math.min(50, now - last)
      last = now
      const stage = stageRef.current
      if (stage) {
        spawnAcc += dt
        if (spawnAcc >= SPAWN_EVERY_MS && posRef.current.size < MAX_BUBBLES) {
          spawnAcc = 0
          spawn(stage.clientWidth, stage.clientHeight)
        }
        const gone = []
        posRef.current.forEach((b, id) => {
          b.t += dt / 1000
          b.y -= (b.vy * dt) / 1000
          b.cx = b.x + Math.sin(b.t * b.freq + b.phase) * b.amp
          const el = elRefs.current.get(id)
          if (el) el.style.transform = `translate3d(${b.cx}px, ${b.y}px, 0)`
          if (b.y < -BUBBLE_SIZE * 1.5) gone.push(id)
        })
        if (gone.length) {
          gone.forEach((id) => posRef.current.delete(id))
          setBubbles((prev) => prev.filter((b) => !gone.includes(b.id)))
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase])

  // Each stitch: thump the heart and say the next sorry
  useEffect(() => {
    if (stitches === 0) return
    const el = heartRef.current
    if (el) {
      el.classList.remove('thump')
      void el.offsetWidth
      el.classList.add('thump')
    }
    if (stitches >= TOTAL_STITCHES) {
      say('Whole again ✨ with gold where it broke.')
      buzz([30, 50, 30])
      posRef.current.clear()
      setBubbles((prev) => prev.map((b) => ({ ...b, popped: true })))
      later(() => setBubbles([]), 350)
      setPhase('mended')
    } else {
      say(SORRY_LINES[stitches - 1])
    }
  }, [stitches])

  useEffect(() => {
    if (phase !== 'mended') return
    const t = setTimeout(() => setPhase('ask'), 2800)
    return () => clearTimeout(t)
  }, [phase])

  const tapBubble = (id, e) => {
    e.preventDefault()
    const b = posRef.current.get(id)
    if (!b) return
    posRef.current.delete(id)
    setBubbles((prev) => prev.map((x) => (x.id === id ? { ...x, popped: true } : x)))
    later(() => setBubbles((prev) => prev.filter((x) => x.id !== id)), 320)

    if (b.grumpy) {
      say(pick(GRUMPY_LINES))
      buzz([25, 40, 25])
      setFlinch(true)
      later(() => setFlinch(false), 450)
      return
    }
    if (caughtRef.current >= TOTAL_STITCHES) return
    caughtRef.current++
    buzz(12)

    const stage = stageRef.current.getBoundingClientRect()
    const heart = heartRef.current.getBoundingClientRect()
    const flyer = {
      id,
      emoji: b.emoji,
      sx: b.cx + BUBBLE_SIZE / 2,
      sy: b.y + BUBBLE_SIZE / 2,
      tx: heart.left - stage.left + heart.width / 2,
      ty: heart.top - stage.top + heart.height / 2,
    }
    setFlyers((f) => [...f, flyer])
    later(() => {
      setFlyers((f) => f.filter((x) => x.id !== id))
      setStitches((s) => Math.min(TOTAL_STITCHES, s + 1))
    }, 650)
  }

  const dodgeNo = (e) => {
    e.preventDefault()
    const w = window.innerWidth
    const h = window.innerHeight
    setNoPos({
      left: 16 + Math.random() * Math.max(0, w - 180),
      top: 16 + Math.random() * Math.max(0, h - 90),
    })
    setNoCount((c) => c + 1)
    buzz(10)
  }

  const forgive = () => {
    setPhase('forgiven')
    setBurstKey((k) => k + 1)
    buzz([40, 60, 40, 60, 120])
  }

  const sendHug = () => {
    setBurstKey((k) => k + 1)
    setHugs((h) => h + 1)
    buzz([20, 30, 20, 30, 60])
  }

  const restart = () => {
    caughtRef.current = 0
    posRef.current.clear()
    setBubbles([])
    setFlyers([])
    setStitches(0)
    setNoCount(0)
    setNoPos(null)
    setHugs(0)
    say('Tap the gifts to stitch my heart back 🧵')
    setPhase('play')
  }

  const burst = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        emoji: ['💖', '💕', '💗', '✨', '🌸'][i % 5],
        a: Math.random() * 360,
        d: 90 + Math.random() * 140,
        delay: Math.random() * 0.15,
      })),
    [burstKey],
  )

  const forgiven = phase === 'forgiven'
  const mended = stitches >= TOTAL_STITCHES
  const p = forgiven ? 1 : stitches / TOTAL_STITCHES
  const gap = (1 - stitches / TOTAL_STITCHES) * 8
  const kittenMood = forgiven ? 'happy' : stitches >= TOTAL_STITCHES / 2 ? 'hopeful' : 'sad'
  const noHidden = noCount >= NO_LINES.length
  const noLabel = NO_LINES[Math.min(noCount, NO_LINES.length - 1)]
  const yesScale = 1 + Math.min(noCount, 7) * 0.12

  const noButton = !noHidden && (
    <button
      type="button"
      className={`btn btn--ghost${noPos ? ' no-btn--loose' : ''}`}
      style={noPos ? { left: noPos.left, top: noPos.top, transform: `scale(${Math.max(0.6, 1 - noCount * 0.05)})` } : undefined}
      onPointerDown={dodgeNo}
      onClick={dodgeNo}
    >
      {noLabel}
    </button>
  )

  return (
    <div className="stage" ref={stageRef}>
      <div className="sky sky--warm" />
      <div className="sky sky--storm" style={{ opacity: 1 - p }} />
      <div className="rain" style={{ opacity: Math.max(0, 1 - p * 1.5) }} aria-hidden="true">
        {RAIN.map((d) => (
          <span
            key={d.id}
            className="drop"
            style={{ left: `${d.left}%`, animationDelay: `${d.delay}s`, animationDuration: `${d.duration}s` }}
          />
        ))}
      </div>

      <div className="scene">
        <div className="hud">
          <span>🧵 stitching my heart</span>
          <div className="hud-bar">
            <div className="hud-fill" style={{ width: `${(stitches / TOTAL_STITCHES) * 100}%` }} />
          </div>
          <span className="hud-count">
            {stitches}/{TOTAL_STITCHES}
          </span>
        </div>

        <div className="sky-area">
          <div
            className={`sun${forgiven ? ' sun--happy' : ''}`}
            style={{
              opacity: 0.1 + p * 0.9,
              transform: `translate(${forgiven ? 0 : -44 * p}px, ${(1 - p) * 46}px)`,
            }}
          >
            <div className="sun-rays" />
            <div className="sun-core">
              <span className="sun-face">◠‿◠</span>
            </div>
          </div>
          <MoodCloud p={p} gone={forgiven} />
        </div>

        <div className={`heart${mended ? ' heart--mended' : ''}`} ref={heartRef}>
          <svg viewBox="0 0 200 180" aria-label={`Heart, ${stitches} of ${TOTAL_STITCHES} stitches`}>
            <defs>
              <linearGradient id="heartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ff8fa8" />
                <stop offset="1" stopColor="#d9466a" />
              </linearGradient>
              <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fff1b0" />
                <stop offset=".5" stopColor="#f2c14e" />
                <stop offset="1" stopColor="#c98a1b" />
              </linearGradient>
              <clipPath id="leftHalf">
                <polygon points={LEFT_CLIP} />
              </clipPath>
              <clipPath id="rightHalf">
                <polygon points={RIGHT_CLIP} />
              </clipPath>
            </defs>
            <g className="half" style={{ transform: `translate(${-gap}px, ${gap * 0.3}px) rotate(${-gap * 0.6}deg)` }}>
              <path d={HEART_PATH} fill="url(#heartFill)" clipPath="url(#leftHalf)" />
            </g>
            <g className="half" style={{ transform: `translate(${gap}px, ${gap * 0.3}px) rotate(${gap * 0.6}deg)` }}>
              <path d={HEART_PATH} fill="url(#heartFill)" clipPath="url(#rightHalf)" />
            </g>
            <ellipse cx="58" cy="44" rx="18" ry="10" fill="#fff" opacity=".28" transform="rotate(-25 58 44)" />
            <g className="stitches">
              {STITCHES.slice(0, stitches).map(([x, y], i) => (
                <line
                  key={i}
                  className="stitch"
                  pathLength="1"
                  x1={x - 11}
                  y1={y + (i % 2 ? 3 : -3)}
                  x2={x + 11}
                  y2={y + (i % 2 ? -3 : 3)}
                />
              ))}
            </g>
            <polyline className="seam" pathLength="1" points={CRACK_POINTS} />
          </svg>
        </div>

        <p className="message" key={message.k}>
          {message.text}
        </p>

        <div className="spacer" />

        <Kitten
          mood={kittenMood}
          flinch={flinch}
          onTap={() => {
            say(pick(KITTEN_LINES))
            buzz(8)
          }}
        />
      </div>

      <div className="bubbles">
        {bubbles.map((b) => (
          <button
            type="button"
            key={b.id}
            ref={(el) => (el ? elRefs.current.set(b.id, el) : elRefs.current.delete(b.id))}
            className={`bubble${b.grumpy ? ' bubble--grumpy' : ''}${b.popped ? ' bubble--popped' : ''}`}
            style={{ transform: `translate3d(${b.x}px, ${b.y}px, 0)` }}
            onPointerDown={(e) => tapBubble(b.id, e)}
            aria-label={b.grumpy ? 'Grumpy bubble' : 'Gift bubble'}
          >
            <span className="bubble-inner">{b.emoji}</span>
          </button>
        ))}
        {flyers.map((f) => (
          <span
            key={f.id}
            className="flyer"
            style={{ '--sx': `${f.sx}px`, '--sy': `${f.sy}px`, '--tx': `${f.tx}px`, '--ty': `${f.ty}px` }}
          >
            {f.emoji}
          </span>
        ))}
      </div>

      {forgiven && (
        <div className="love-rain" aria-hidden="true">
          {LOVE_RAIN.map((h) => (
            <span
              key={h.id}
              style={{
                left: `${h.left}%`,
                fontSize: h.size,
                animationDelay: `${h.delay}s`,
                animationDuration: `${h.duration}s`,
              }}
            >
              {h.emoji}
            </span>
          ))}
        </div>
      )}

      {burstKey > 0 && (
        <div className="burst" key={burstKey} aria-hidden="true">
          {burst.map((h) => (
            <span key={h.id} style={{ '--a': `${h.a}deg`, '--d': `${h.d}px`, animationDelay: `${h.delay}s` }}>
              {h.emoji}
            </span>
          ))}
        </div>
      )}

      {phase === 'intro' && (
        <div className="overlay">
          <div className="card">
            <h1>Hey Guluru… 🥺</h1>
            <p>
              I messed up, and I know it. Words felt too small, so I made you this instead. My heart is cracked right
              down the middle. Will you help me stitch it back?
            </p>
            <p className="hint">
              Tap the little gifts 🎁 floating up to sew a stitch. The 😤 ones? Tap them too if you want. I deserve it.
            </p>
            <button type="button" className="btn" onClick={restart}>
              Hmph. Fine. 🙄
            </button>
          </div>
        </div>
      )}

      {phase === 'ask' && (
        <div className="overlay">
          <div className="card">
            <h1>So…</h1>
            <p className="ask-q">Will you forgive me, Aliva?</p>
            <div className="choices">
              <button type="button" className="btn" style={{ transform: `scale(${yesScale})` }} onClick={forgive}>
                Yes 💖
              </button>
              {!noPos && noButton}
            </div>
          </div>
          {noPos && noButton}
        </div>
      )}

      {forgiven && (
        <div className="overlay overlay--soft">
          <div className="card letter">
            <div className="letter-body">
              <p>Dear Aliva,</p>
              <p>I&apos;m sorry. Not the quick &ldquo;sorry na&rdquo; kind. The real kind.</p>
              <p>
                You&apos;re where my jokes go first, where every cat picture goes, where every small moment of my day
                wants to end up. Hurting you is the last thing I ever want to do, and I hate that I did.
              </p>
              <p>
                Thank you for being patient with me, even when I don&apos;t make it easy. I&apos;m going to keep
                becoming someone who deserves you.
              </p>
              <p>
                They say when you mend something broken with gold, it ends up more beautiful than before. Let&apos;s
                be that.
              </p>
              <p>I love you, Guluru.</p>
              <p className="signoff">Your Kindu 💌</p>
            </div>
            <div className="letter-actions">
              <button type="button" className="btn" onClick={sendHug}>
                Send him a hug 🤗
              </button>
              {hugs > 0 && (
                <p className="hug-note" key={hugs}>
                  {hugs === 1 ? 'Hug delivered. He felt it 💞' : `${hugs} hugs delivered 💞`}
                </p>
              )}
              <button type="button" className="link-btn" onClick={restart}>
                play again ↺
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SorryGame
