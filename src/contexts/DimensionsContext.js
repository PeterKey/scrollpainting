import React, { useEffect, useRef, useState } from 'react'

const DimensionsContext = React.createContext()

function getDimensions() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    largestDimension:
      window.innerWidth > window.innerHeight
        ? window.innerWidth
        : window.innerHeight,
  }
}

export function DimensionsProvider(props) {
  const [dimensionsState, setDimensions] = useState(getDimensions())

  const dimensionsRef = useRef(getDimensions())

  useEffect(() => {
    window.addEventListener('resize', () => {
      const newWindowSize = getDimensions()
      dimensionsRef.current = newWindowSize
      setDimensions(newWindowSize)
    })
  }, [])

  return (
    <DimensionsContext.Provider
      value={{
        ...dimensionsState,
        dimensionsRef,
      }}
    >
      {props.children}
    </DimensionsContext.Provider>
  )
}

export default DimensionsContext
