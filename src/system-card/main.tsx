import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import { SystemCardPage } from './SystemCardPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SystemCardPage />
  </StrictMode>,
)
