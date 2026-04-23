import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@app/index'
import { StoreProvider } from '@app/providers/store'
import './index.css'



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>
)
  
// git add . && git commit -m "refacted Goals Progects Tasks" && git push -u origin main
