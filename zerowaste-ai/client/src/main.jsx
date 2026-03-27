import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import ConnectionStatus from './components/ConnectionStatus.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
      <ConnectionStatus />
      <Toaster position="top-right" />
    </ErrorBoundary>
  </React.StrictMode>,
)
