import { useContext, useEffect, useRef, useState } from 'react'
import IntersectionObserverAdmin from 'intersection-observer-admin'

import { client } from '../sanity'
import {
  MAX_SCROLL_SPEED,
  SCROLL_EASE_OUT_DURATION,
  easeTime,
  SCROLL_EASE_IN_DURATION,
  easeInQuad,
  easeOutQuad,
} from '../definitions'

import DimensionsContext from '../contexts/DimensionsContext'
import PointerContext, { POINTER_MODE } from '../contexts/PointerContext'
import Painting from './Painting'

import css from './PaintingScroller.module.scss'

const query = '*[_type == "painting"] | order(order)'

const intersectionObserverAdmin = new IntersectionObserverAdmin()

export default function PaintingScroller() {
  const dimensions = useContext(DimensionsContext)
  const pointer = useContext(PointerContext)

  const [paintings, setPaintings] = useState([])
  const [shouldScroll, setShouldScroll] = useState(false)
  const isScrolling = useRef(false)
  const scrollSpeed = useRef(0)
  const easeOutScrollStart = useRef(false)
  const easeInScrollStart = useRef(false)

  const scrollContainer = useRef()
  // const scrollIndicatorTop = useRef()
  // const scrollIndicatorBottom = useRef()

  // Only needed for scroll indicator
  const totalAspect = useRef(0)

  const scrollPosY = useRef(0)

  // function updateScrollIndicator() {
  //   const transform = `scaleX(${
  //     scrollPosY.current /
  //     (dimensions.dimensionsRef.current.height * totalAspect.current -
  //       dimensions.dimensionsRef.current.width)
  //   })`
  //   scrollIndicatorTop.current.style.transform = transform
  //   scrollIndicatorBottom.current.style.transform = transform
  //   requestAnimationFrame(updateScrollIndicator)
  // }

  function autoScroll() {
    if (isScrolling.current) {
      let easeAmount = 1.0
      if (easeInScrollStart.current) {
        easeAmount = easeTime(
          easeInScrollStart.current,
          SCROLL_EASE_IN_DURATION,
          Date.now(),
          easeInQuad,
        )
        if (!easeAmount) {
          easeInScrollStart.current = false
          easeAmount = 1.0
        }
      }
      let scrollAmount =
        (pointer.pos.current.x / dimensions.dimensionsRef.current.width - 0.5) *
        2

      scrollSpeed.current = scrollAmount * MAX_SCROLL_SPEED * easeAmount
      const newScrollPosition =
        scrollContainer.current.scrollLeft + scrollSpeed.current
      scrollContainer.current.scrollTo(newScrollPosition, 0)

      requestAnimationFrame(autoScroll)
    } else if (easeOutScrollStart.current) {
      const easeAmount = easeTime(
        easeOutScrollStart.current,
        SCROLL_EASE_OUT_DURATION,
        Date.now(),
        easeOutQuad,
      )
      if (easeAmount) {
        const newScrollPosition =
          scrollContainer.current.scrollLeft +
          (1 - easeAmount) * scrollSpeed.current
        scrollContainer.current.scrollTo(newScrollPosition, 0)
        requestAnimationFrame(autoScroll)
      } else {
        easeOutScrollStart.current = false
      }
    }
  }

  useEffect(() => {
    if (shouldScroll) {
      requestAnimationFrame(autoScroll)
    }
  }, [shouldScroll]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    async function fetchPaintings() {
      try {
        // Maybe a hacky way to get image dimensions?
        const response = await client.fetch(query)
        let totalAspectRatio = 0
        response.forEach(({ image }) => {
          const imageDimensions = image.asset._ref.split('-')[2].split('x')
          image.width = parseInt(imageDimensions[0])
          image.height = parseInt(imageDimensions[1])
          image.aspect = image.width / image.height
          totalAspectRatio += image.aspect
        })
        totalAspect.current = totalAspectRatio
        setPaintings(response)
        // requestAnimationFrame(updateScrollIndicator)
      } catch (e) {
        console.error(e)
      }
    }
    fetchPaintings()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* <div className={css.borderLeft} /> */}
      {/* <div
        ref={scrollIndicatorTop}
        className={css.scrollIndicator}
        style={{ top: 0, display: 'none' }}
      />
      <div
        ref={scrollIndicatorBottom}
        className={css.scrollIndicator}
        style={{ bottom: 0, display: 'none' }}
      /> */}
      <div
        tabIndex={0}
        className={css.container}
        ref={scrollContainer}
        onClick={() => {
          easeOutScrollStart.current = shouldScroll && Date.now()
          easeInScrollStart.current = !shouldScroll && Date.now()
          isScrolling.current = !shouldScroll
          pointer.action.changeMode(
            !shouldScroll ? POINTER_MODE.SCROLL : POINTER_MODE.POINTER,
          )
          setShouldScroll(!shouldScroll)
        }}
        // onPointerMove={handlePointerMove}
        onBlur={() => {
          pointer.action.changeMode(POINTER_MODE.POINTER)
          easeOutScrollStart.current = Date.now()
          isScrolling.current = false
          setShouldScroll(false)
        }}
        onScroll={() => {
          scrollPosY.current = scrollContainer.current.scrollLeft
        }}
      >
        {paintings.map((painting) => (
          <Painting
            key={painting._id}
            painting={painting}
            observer={intersectionObserverAdmin}
            scrollContainer={scrollContainer}
          />
        ))}
        {/* <div className={css.borderRight} /> */}
      </div>
    </>
  )
}
