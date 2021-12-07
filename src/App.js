import { useContext, useState } from 'react'

import About from './components/About'
import PaintingScroller from './components/PaintingScroller'

import css from './App.module.scss'
import PointerContext, { POINTER_MODE } from './contexts/PointerContext'
import DimensionsContext from './contexts/DimensionsContext'

function App() {
  const pointer = useContext(PointerContext)
  const dimensions = useContext(DimensionsContext)

  const [aboutOpen, setAboutOpen] = useState(false)

  return (
    <>
      <PaintingScroller stopInteraction={aboutOpen} />
      <div
        className={css.question}
        style={{
          opacity: pointer.mode === POINTER_MODE.SCROLL ? 0 : 1,
          pointerEvents: pointer.mode === POINTER_MODE.SCROLL ? 'none' : 'all',
        }}
        data-hover="1"
        onClick={() => {
          pointer.action.setColor(aboutOpen ? '#FFF' : '#000')
          pointer.action.changeMode(
            aboutOpen ? POINTER_MODE.POINTER : POINTER_MODE.CLOSE,
          )
          setAboutOpen(!aboutOpen)
        }}
      >
        What is this?
        <div className={css.underline}></div>
        <div
          className={`${css.bg} ${aboutOpen && css.bgReveal}`}
          style={{
            width: dimensions.largestDimension,
            height: dimensions.largestDimension,
          }}
        ></div>
      </div>

      <About open={aboutOpen} />
    </>
  )
}

export default App
