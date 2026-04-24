import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@app/index'
import { StoreProvider } from '@app/providers/store'
import './index.css'
import { HashRouter } from 'react-router-dom'



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </StoreProvider>
  </StrictMode>
)
  
// git add . && git commit -m "fixed ManualTimeModal" && git push -u origin main
