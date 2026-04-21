import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@app/index'
import './index.css'



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
  
// git add . && git commit -m "filled project" && git push -u origin main
