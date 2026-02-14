import { useState } from 'react'
import Landing from './components/Landing'
import HeartCatchGame from './components/HeartCatchGame'
import LovePage from './components/LovePage'

function App() {
  const [phase, setPhase] = useState('landing') // 'landing' | 'game' | 'love'

  return phase === 'love' ? (
    <LovePage />
  ) : phase === 'game' ? (
    <HeartCatchGame onWin={() => setPhase('love')} />
  ) : (
    <Landing onComplete={() => setPhase('game')} />
  )
}

export default App
