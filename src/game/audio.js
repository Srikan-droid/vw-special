// Tiny WebAudio synth: sound effects + a soft looping tune, no audio files needed
let ac = null
let master = null
let musicTimer = null
let muted = false

try {
  muted = localStorage.getItem('sorry-muted') === '1'
} catch {
  // storage unavailable (private mode etc.)
}

export const isMuted = () => muted

export function initAudio() {
  if (ac) {
    if (ac.state === 'suspended') ac.resume()
    return
  }
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return
  ac = new AC()
  master = ac.createGain()
  master.gain.value = muted ? 0 : 0.5
  master.connect(ac.destination)
}

export function setMuted(m) {
  muted = m
  try {
    localStorage.setItem('sorry-muted', m ? '1' : '0')
  } catch {
    // ignore
  }
  if (master) master.gain.setTargetAtTime(m ? 0 : 0.5, ac.currentTime, 0.05)
}

function tone(freq, dur, { type = 'sine', vol = 0.15, to, at = 0 } = {}) {
  if (!ac) return
  const t0 = ac.currentTime + at
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur)
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(gain).connect(master)
  osc.start(t0)
  osc.stop(t0 + dur + 0.05)
}

function noise(dur, vol = 0.2, freq = 800) {
  if (!ac) return
  const len = Math.floor(ac.sampleRate * dur)
  const buf = ac.createBuffer(1, len, ac.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const src = ac.createBufferSource()
  src.buffer = buf
  const filter = ac.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = freq
  const gain = ac.createGain()
  gain.gain.value = vol
  src.connect(filter).connect(gain).connect(master)
  src.start()
}

export const sfx = {
  whoosh: () => {
    noise(0.28, 0.14, 900)
    tone(320, 0.25, { type: 'sine', vol: 0.05, to: 140 })
  },
  stretch: () => tone(180, 0.14, { type: 'sawtooth', vol: 0.025, to: 320 }),
  thud: () => tone(140, 0.12, { type: 'sine', vol: 0.18, to: 70 }),
  bonk: () => {
    tone(620, 0.2, { type: 'square', vol: 0.07, to: 150 })
    tone(90, 0.28, { type: 'sine', vol: 0.3 })
  },
  crash: () => {
    noise(0.35, 0.3, 1800)
    tone(120, 0.3, { type: 'triangle', vol: 0.12, to: 55 })
  },
  glass: () => {
    noise(0.25, 0.18, 7000)
    tone(2100, 0.18, { type: 'sine', vol: 0.05 })
    tone(2700, 0.22, { type: 'sine', vol: 0.04, at: 0.04 })
  },
  refill: () => [784, 988, 1175].forEach((f, i) => tone(f, 0.14, { type: 'triangle', vol: 0.1, at: i * 0.07 })),
  cheer: () => [659, 784, 988, 1319].forEach((f, i) => tone(f, 0.2, { type: 'square', vol: 0.04, at: i * 0.08 })),
}

// 32-step loop of eighth notes (0 = rest)
const MELODY = [
  659, 0, 784, 659, 587, 0, 523, 587, 659, 0, 784, 880, 784, 0, 659, 0,
  523, 0, 587, 659, 587, 0, 523, 440, 523, 0, 587, 659, 523, 0, 0, 0,
]
const BASS = [131, 0, 0, 0, 196, 0, 0, 0, 220, 0, 0, 0, 175, 0, 196, 0]

export function startMusic() {
  if (!ac || musicTimer) return
  const stepDur = 60 / 112 / 2
  let step = 0
  let next = ac.currentTime + 0.1
  musicTimer = setInterval(() => {
    while (next < ac.currentTime + 0.3) {
      const at = Math.max(0, next - ac.currentTime)
      const m = MELODY[step % MELODY.length]
      const b = BASS[step % BASS.length]
      if (m) tone(m, stepDur * 1.6, { type: 'triangle', vol: 0.035, at })
      if (b) tone(b, stepDur * 3, { type: 'sine', vol: 0.07, at })
      next += stepDur
      step++
    }
  }, 80)
}

export function stopMusic() {
  clearInterval(musicTimer)
  musicTimer = null
}
