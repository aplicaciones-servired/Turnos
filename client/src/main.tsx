import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/Css/index.css'
import Home from '@/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Home />
  </StrictMode>,
)
