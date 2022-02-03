import React, { useContext, useEffect, useRef, useState } from 'react'
import { MdOutlineClose } from 'react-icons/md'
import {
  easeInOut,
  easeTime,
  SCROLL_EASE_IN_DURATION,
  SCROLL_EASE_OUT_DURATION,
} from '../definitions'

import DimensionsContext from './DimensionsContext'

import css from './PointerContext.module.scss'

const PointerContext = React.createContext()

export const POINTER_MODE = {
  POINTER: 0,
  SCROLL: 1,
  HOVER: 2,
  CLOSE: 3,
}

function morphCircleToDrop(amount) {
  if (amount !== 0) {
    const absAmount = Math.abs(amount)
    const hundredToOne = morph(100, 0, absAmount)
    return `M 200 200 C 255.2 200 300 155.2 300 100 S 255.2 0 200 0 S 
        ${hundredToOne} 
        ${morph(44.8, 100, absAmount)} 
        ${hundredToOne}
         100 S 144.8 200 200 200`
  } else {
    return 'M 200 200 C 255.2 200 300 155.2 300 100 S 255.2 0 200 0 S 100 44.8 100 100 S 144.8 200 200 200'
  }
}

function morph(from, to, amount) {
  return from + (to - from) * amount
}

export function PointerProvider(props) {
  const dimensions = useContext(DimensionsContext)

  const [suspectTouch, setSuspectTouch] = useState(true)
  const suspectTouchRef = useRef(true)
  const mouseMoveCounter = useRef(0)

  const transition = useRef()

  const svgPath = useRef()
  const translateDiv = useRef()

  const [color, setColor] = useState('#FFF')

  const [mode, setMode] = useState(POINTER_MODE.POINTER)
  const modeRef = useRef(POINTER_MODE.POINTER)

  const pos = useRef({
    x: 0,
    y: 0,
  })

  /* Only permitted mode changes are
    POINTER <-> SCROLL
    POINTER <-> HOVER
  */
  function changeMode(newMode) {
    if (
      modeRef.current === POINTER_MODE.POINTER &&
      newMode === POINTER_MODE.SCROLL
    ) {
      transition.current = {
        start: Date.now(),
        duration: SCROLL_EASE_IN_DURATION,
        easingFunction: easeInOut,
        reverse: false,
      }
    } else if (
      modeRef.current === POINTER_MODE.SCROLL &&
      newMode === POINTER_MODE.POINTER
    ) {
      transition.current = {
        start: Date.now(),
        duration: SCROLL_EASE_OUT_DURATION,
        easingFunction: easeInOut,
        reverse: true,
      }
    }
    modeRef.current = newMode
    setMode(newMode)
  }

  function handleMouseMove(e) {
    if (suspectTouchRef.current) {
      mouseMoveCounter.current++
      if (mouseMoveCounter.current > 5) {
        suspectTouchRef.current = false
        setSuspectTouch(false)
        window.requestAnimationFrame(render)
      }
    } else {
      if (
        e.target.dataset &&
        e.target.dataset.hover &&
        modeRef.current === POINTER_MODE.POINTER
      ) {
        modeRef.current = POINTER_MODE.HOVER
        setMode(POINTER_MODE.HOVER)
      } else if (
        modeRef.current === POINTER_MODE.HOVER &&
        !e.target.dataset.hover
      ) {
        modeRef.current = POINTER_MODE.POINTER
        setMode(POINTER_MODE.POINTER)
      }

      pos.current = {
        x: e.clientX,
        y: e.clientY,
      }
    }
  }

  function handleTouchInput() {
    mouseMoveCounter.current = 0
    if (!suspectTouchRef.current) {
      suspectTouchRef.current = true
      setSuspectTouch(true)
    }
  }

  function render(time) {
    if (suspectTouchRef.current) return
    let sinWiggle = 0
    let rotate = ''
    if (modeRef.current === POINTER_MODE.SCROLL || transition.current) {
      const dropAmount =
        (pos.current.x / dimensions.dimensionsRef.current.width - 0.5) * 2

      if (dropAmount < 0) {
        rotate = ' rotate(180deg)'
      }

      let easeAmount = 1.0
      if (transition.current) {
        easeAmount = easeTime(
          transition.current.start,
          transition.current.duration,
          Date.now(),
          transition.current.easingFunction,
          transition.current.reverse,
        )
        if (!easeAmount) {
          easeAmount = transition.current.reverse ? 0.0 : 1.0
          transition.current = false
        }
      }

      const path = morphCircleToDrop(dropAmount * easeAmount)
      svgPath.current.setAttribute('d', path)

      sinWiggle =
        Math.sin(time * 0.01) *
        morph(10, 100, Math.abs(dropAmount)) *
        easeAmount
    }
    translateDiv.current.style.transform =
      `translate(${pos.current.x}px, ${pos.current.y + sinWiggle}px)` + rotate

    window.requestAnimationFrame(render)
  }

  useEffect(() => {
    console.log(suspectTouch)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('touchstart', handleTouchInput)
    window.requestAnimationFrame(render)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('touchstart', handleTouchInput)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PointerContext.Provider
      value={{
        pos,
        mode,
        action: {
          changeMode,
          setColor,
        },
      }}
    >
      <div
        ref={translateDiv}
        className={css.pointer}
        style={{
          // opacity: suspectTouch ? 0 : mode === POINTER_MODE.SCROLL ? 0 : 1,
          opacity: 0,
        }}
      >
        <div
          className={`${css.scale} ${
            mode === POINTER_MODE.HOVER ? css.hover : ''
          }`}
        >
          <MdOutlineClose
            className={`${css.close} ${
              mode === POINTER_MODE.CLOSE && css.closeReveal
            }`}
            size={35}
          />
          {/* <div className={css.tutorialText}>
            scroll to the right
            <br /> or <br />
            click to control journey with mouse
          </div> */}
          <svg
            className={css.svg}
            height={25}
            width={25}
            style={{
              opacity: mode === POINTER_MODE.CLOSE ? 0 : 1,
            }}
          >
            <path
              ref={svgPath}
              d="M 200 200 C 255.2 200 300 155.2 300 100 S 255.2 0 200 0 S 100 44.8 100 100 S 144.8 200 200 200"
              fill={color}
              transform="scale(0.05)"
            />
          </svg>
        </div>
      </div>
      {props.children}
    </PointerContext.Provider>
  )
}

export default PointerContext
