import { useState, useEffect } from 'react'
import './Quiz.css'

const QUESTIONS = [
  {
    id: 1,
    text: 'Husband : Wife :: ______ : Guluru',
    answers: ['kindu'],
    feedback: "That was easy, next question.....",
  },
  {
    id: 2,
    text: 'Hala _____, Y ______ Mas !',
    answers: ['Madrid', 'Nada'],
    feedback: "Yayyyyy, next question",
  },
  {
    id: 3,
    text: 'Where does Kindu work ? ______',
    answers: ['IRIS'],
    hint: "It's a 4 letter word related to eye",
    feedback: "Yayyyyyy, guluru is smart",
  },
]

function Quiz({ onComplete }) {
  const [currentQ, setCurrentQ] = useState(0)
  const [inputs, setInputs] = useState([''])
  const [feedback, setFeedback] = useState('')
  const [showHint, setShowHint] = useState(false)

  const question = QUESTIONS[currentQ]
  const isMultiAnswer = question.answers.length > 1

  useEffect(() => {
    setInputs(question.answers.length > 1 ? ['', ''] : [''])
    setFeedback('')
    setShowHint(false)
  }, [currentQ])

  const handleInputChange = (index, value) => {
    const newInputs = [...inputs]
    newInputs[index] = value
    setInputs(newInputs)
    setFeedback('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const userAnswers = inputs.map((inp) => inp.trim().toLowerCase())
    const correctAnswers = question.answers.map((ans) => ans.toLowerCase())

    const isCorrect = userAnswers.every(
      (userAns, idx) => userAns === correctAnswers[idx]
    ) && userAnswers.length === correctAnswers.length

    if (isCorrect) {
      setFeedback(question.feedback)
      setTimeout(() => {
        if (currentQ < QUESTIONS.length - 1) {
          setCurrentQ((q) => q + 1)
        } else {
          setTimeout(onComplete, 1000)
        }
      }, 2000)
    } else {
      setFeedback('Try again! 💕')
    }
  }

  const handleKeyPress = (e, index) => {
    if (e.key === 'Enter') {
      if (isMultiAnswer && index === 0) {
        document.getElementById(`input-${index + 1}`)?.focus()
      } else {
        handleSubmit(e)
      }
    }
  }

  return (
    <div className="quiz-screen">
      <div className="quiz-container">
        <div className="quiz-header">
          <span className="quiz-question-number">Question {currentQ + 1} of {QUESTIONS.length}</span>
        </div>

        <div className="quiz-question-wrap">
          <h2 className="quiz-question">{question.text}</h2>
          
          {question.hint && (
            <button
              type="button"
              className="quiz-hint-btn"
              onClick={() => setShowHint(!showHint)}
            >
              💡 Hint
            </button>
          )}
          
          {showHint && question.hint && (
            <p className="quiz-hint">{question.hint}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="quiz-form">
          <div className="quiz-inputs">
            {question.answers.map((_, index) => (
              <input
                key={index}
                id={`input-${index}`}
                type="text"
                className="quiz-input"
                value={inputs[index] || ''}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                placeholder={`Answer ${index + 1}`}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button type="submit" className="quiz-submit-btn">
            Submit
          </button>
        </form>

        {feedback && (
          <p className={`quiz-feedback ${feedback.includes('Try') ? 'quiz-feedback-error' : 'quiz-feedback-success'}`}>
            {feedback}
          </p>
        )}
      </div>
    </div>
  )
}

export default Quiz
