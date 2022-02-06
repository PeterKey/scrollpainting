import { useContext, useEffect, useRef, useState } from 'react'
import IntersectionObserverAdmin from 'intersection-observer-admin'

import { client } from '../sanity'
import { MAX_SCROLL_SPEED, SCROLL_SMOOTHING } from '../definitions'

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
  const lastIteration = useRef(0)
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

  function autoScroll(timestamp) {
    const elapsed = lastIteration.current
      ? timestamp - lastIteration.current
      : 16
    lastIteration.current = timestamp
    const smoothingFraction = SCROLL_SMOOTHING * elapsed * 0.01

    const scrollAmountTarget = isScrolling.current
      ? (pointer.pos.current.x / dimensions.dimensionsRef.current.width - 0.5) *
        2
      : 0

    scrollSpeed.current +=
      (scrollAmountTarget - scrollSpeed.current) * smoothingFraction
    const newScrollPosition =
      scrollContainer.current.scrollLeft +
      scrollSpeed.current * MAX_SCROLL_SPEED
    scrollContainer.current.scrollTo(newScrollPosition, 0)

    if (isScrolling.current || Math.abs(scrollSpeed.current) > 0.008) {
      requestAnimationFrame(autoScroll)
    } else {
      scrollSpeed.current = 0
      lastIteration.current = 0
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
        const images = []
        response.forEach((painting) => {
          if (painting.image.asset) {
            const imageDimensions = painting.image.asset._ref
              ?.split('-')[2]
              .split('x')
            painting.image.width = parseInt(imageDimensions[0])
            painting.image.height = parseInt(imageDimensions[1])
            painting.image.aspect = painting.image.width / painting.image.height
            totalAspectRatio += painting.image.aspect
            images.push(painting)
          }
        })
        totalAspect.current = totalAspectRatio
        setPaintings(images)
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
