import { useState } from 'react'
import Intro from './components/Intro'
import Quiz from './components/Quiz'
import Landing from './components/Landing'
import HeartCatchGame from './components/HeartCatchGame'
import LovePage from './components/LovePage'

function getInitialPhase() {
  if (typeof window === 'undefined') return 'intro'
  const hash = window.location.hash.toLowerCase()
  const params = new URLSearchParams(window.location.search)
  if (hash === '#gallery' || params.get('gallery') === '1' || params.get('gallery') === 'true') {
    return 'love'
  }
  return 'intro'
}

function App() {
  const [phase, setPhase] = useState(getInitialPhase) // intro → quiz → mic → game → love

  return phase === 'love' ? (
    <LovePage />
  ) : phase === 'game' ? (
    <HeartCatchGame onWin={() => setPhase('love')} />
  ) : phase === 'mic' ? (
    <Landing skipIntro onComplete={() => setPhase('game')} />
  ) : phase === 'quiz' ? (
    <Quiz onComplete={() => setPhase('mic')} />
  ) : (
    <Intro onComplete={() => setPhase('quiz')} />
  )
}

export default App
