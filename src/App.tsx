import { useEffect, useRef, useState } from 'react'
import './App.css'
import { getRandomInt } from './utils'

type Difficulty = 'easy' | 'medium' | 'hard'

function App() {
  const [baseText, setBaseText] = useState('')
  const [successText, setSuccessText] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>()
  const [btnHidden, setBtnHidden] = useState(false)
  const [input, setInput] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [timer, setTimer] = useState(0)
  const [errorCounter, setErrorCounter] = useState(0)
  const [errorStreak, setErrorStreak] = useState(0)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // таймер
  useEffect(() => {
    let interval: number
    if (isActive) {
      interval = setInterval(() => setTimer(prev => prev + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isActive])

  async function fetchBaseTextByDiff(diff: Difficulty) {
    setBaseText(await fetch('http://localhost:5173/public/data.json')
      .then(response => response.json())
      .then(data => data[diff][getRandomInt(data[diff].length)].text))
  }

  function handleSetDifficulty(diff: Difficulty) {
    setDifficulty(diff)
    setBtnHidden(true)
    fetchBaseTextByDiff(diff)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  function handleStop() {
    setIsActive(false)
  }

  function handleReset() {
    setIsActive(false)
    setInput('')
    setBaseText('')
    setSuccessText('')
    setErrorCounter(0)
    setErrorStreak(0)
    setTimer(0)
    setBtnHidden(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const test = document.getElementById('test')

    if (!test) return
    if (!isActive) setIsActive(true)

    test.innerHTML = baseText

    setInput(e.target.value)
    const regex = new RegExp(`^${e.target.value}`)

    if (test && regex.test(test.innerText)) {
      test.innerHTML = test.innerHTML.replace(regex, `<span class="success">${e.target.value}</span>`)
      setSuccessText(e.target.value)
      setErrorStreak(0)
    } else {
      const failStr = test.innerText.slice(successText.length, e.target.value.length)
      test.innerHTML = test.innerText.slice(0, successText.length).replace(successText, `<span class="success">${successText}</span>`)
        + test.innerText.slice(successText.length).replace(failStr, `<span class="fail">${failStr}</span>`)

      if (failStr.length > errorStreak) {
        setErrorStreak(prev => prev + 1)
        setErrorCounter(prev => prev + 1)
      }
    }

    // завершение
    if (successText.length === baseText.length) {
      setIsActive(false)
    }
  }

  return (
    <main className='main'>
      <h2 className='main-title'>{difficulty}</h2>

      <p className='error-counter'>{input.length !== 0 ? ((errorCounter / input.length) * 100).toFixed(2) : 0} % ошиб.</p>
      <p>{input.length !== 0 ? Math.floor((60 / timer) * input.length) : 0} зн/мин</p>
      <p className='timer'>Время: {timer} сек.</p>

      <textarea className='textarea' id="input" value={input} onChange={handleChange} ref={inputRef}></textarea>

      <p className='test-text' id='test'>{baseText}</p>

      {
        !btnHidden ?
          (
            <div className='select-diff'>
              <h3 className='select-title'>Выберите сложность текста</h3>
              <div className="btns-container-difficulty">
                <button className="btn btn-difficulty" onClick={() => { handleSetDifficulty('easy') }}>Легкий</button>
                <button className="btn btn-difficulty" onClick={() => { handleSetDifficulty('medium') }}>Средний</button>
                <button className="btn btn-difficulty" onClick={() => { handleSetDifficulty('hard') }}>Сложный</button>
              </div>
            </div>
          )
          :
          (
            <div className="btns-container">
              <button className='btn btn-action' onClick={() => handleStop()}>Стоп</button>
              <button className='btn btn-action' onClick={() => handleReset()}>Начать заново</button>
            </div>
          )
      }
    </main >
  )
}

export default App
