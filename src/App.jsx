import { useState } from 'react'
import Intro from './components/Intro'
import Quiz from './components/Quiz'
import Landing from './components/Landing'
import HeartCatchGame from './components/HeartCatchGame'
import LovePage from './components/LovePage'

function App() {
  const [phase, setPhase] = useState('intro') // intro → quiz → mic → game → love

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
