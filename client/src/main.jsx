import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Analytics } from '@vercel/analytics/react'  // ADD THIS LINE

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Analytics /> 
  </StrictMode>,
)
