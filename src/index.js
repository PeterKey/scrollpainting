import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'

import { DimensionsProvider } from './contexts/DimensionsContext'
import { PointerProvider } from './contexts/PointerContext'

ReactDOM.render(
  <React.StrictMode>
    <DimensionsProvider>
      <PointerProvider>
        <App />
      </PointerProvider>
    </DimensionsProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)
