import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'

import { DimensionsProvider } from './contexts/DimensionsContext'

ReactDOM.render(
  <React.StrictMode>
    <DimensionsProvider>
      <App />
    </DimensionsProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)
