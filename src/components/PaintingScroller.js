import { useContext, useEffect, useRef, useState } from 'react'
import IntersectionObserverAdmin from 'intersection-observer-admin'

import { client } from '../sanity'

import Painting from './Painting'

import css from './PaintingScroller.module.scss'
import DimensionsContext from '../contexts/DimensionsContext'

const query = '*[_type == "painting"] | order(order)'

const MAX_SCROLL_SPEED = 50

const intersectionObserverAdmin = new IntersectionObserverAdmin()

export default function PaintingScroller() {
  const dimensions = useContext(DimensionsContext)

  const [paintings, setPaintings] = useState([])
  const [shouldScroll, setShouldScroll] = useState(false)
  const isScrolling = useRef(false)

  const scrollContainer = useRef()
  const pointerPosition = useRef([0, 0])

  function handlePointerMove(e) {
    pointerPosition.current = [e.clientX, e.clientY]
  }

  function autoScroll() {
    if (isScrolling.current) {
      const scrollAmount =
        pointerPosition.current[0] / dimensions.dimensionsRef.current.width -
        0.5
      const newScrollPosition =
        scrollContainer.current.scrollLeft + scrollAmount * MAX_SCROLL_SPEED
      scrollContainer.current.scrollTo(newScrollPosition, 0)
      requestAnimationFrame(autoScroll)
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
        response.forEach(({ image }) => {
          const imageDimensions = image.asset._ref.split('-')[2].split('x')
          image.width = parseInt(imageDimensions[0])
          image.height = parseInt(imageDimensions[1])
          image.aspect = image.width / image.height
        })
        setPaintings(response)
      } catch (e) {
        console.error(e)
      }
    }
    fetchPaintings()
  }, [])

  return (
    <div
      tabIndex={0}
      className={css.container}
      ref={scrollContainer}
      onClick={() => {
        isScrolling.current = !shouldScroll
        setShouldScroll(!shouldScroll)
      }}
      onPointerMove={handlePointerMove}
      onBlur={() => {
        isScrolling.current = false
        setShouldScroll(false)
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
    </div>
  )
}
