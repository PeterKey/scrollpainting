import React, { useEffect, useRef, useState } from 'react'

const DimensionsContext = React.createContext()

export function DimensionsProvider(props) {
  const [dimensionsState, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  const dimensionsRef = useRef({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    window.addEventListener('resize', () => {
      const newWindowSize = {
        width: window.innerWidth,
        height: window.innerHeight,
      }
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
