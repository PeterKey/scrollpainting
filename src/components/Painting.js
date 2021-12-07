import { useContext, useEffect, useRef, useState } from 'react'
import DimensionsContext from '../contexts/DimensionsContext'
import { urlFor } from '../sanity'

import css from './PaintingScroller.module.scss'

/*
  Lazy load and present the painting parts while preventing CLS
  Component will only be mounted if all props are already present.
  Assume that no prop changes will occur.
*/
export default function Painting({
  painting,
  observer,
  scrollContainer,
  lazyLoad = true,
}) {
  const dimensions = useContext(DimensionsContext)
  const [imageURL, setImageURL] = useState('')
  const [loadImage, setLoadImage] = useState(!lazyLoad)

  const imageContainer = useRef()

  function handleImageComingIntoView() {
    setLoadImage(true)
  }

  // Figure out sanity image URL
  useEffect(() => {
    const imageHeight =
      dimensions.height < painting.image.height
        ? dimensions.height
        : painting.image.height

    setImageURL(
      urlFor(painting.image)
        .height(imageHeight)
        .format('jpg')
        .quality(70)
        .url(),
    )

    // Register Observer if lazy load required
    if (lazyLoad) {
      observer.addEnterCallback(
        imageContainer.current,
        handleImageComingIntoView,
      )
      observer.observe(imageContainer.current, {
        root: scrollContainer.current,
        rootMargin: '10000px',
        threshold: 0,
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Unobserve if image is loaded
  useEffect(() => {
    if (loadImage && lazyLoad) {
      observer.unobserve(imageContainer.current, {
        root: scrollContainer.current,
      })
    }
  }, [loadImage]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={css.imageContainer} ref={imageContainer}>
      <img
        width={dimensions.height * painting.image.aspect}
        height={dimensions.height}
        className={css.image}
        src={imageURL}
        // src={loadImage ? imageURL : ''}
        alt="" // Setting a fixed alt will mess up the observer and load all images at once
      />
    </div>
  )
}
