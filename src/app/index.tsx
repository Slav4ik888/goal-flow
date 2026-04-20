import { useState } from 'react'
import reactLogo from '@shared/assets/react.svg'
import viteLogo from '@shared/assets/vite.svg'
import heroImg from '@shared/assets/hero.png'
import styles from './index.module.scss'



export function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center" className={styles.center}>
        <div className={styles.hero}>
          <img src={heroImg} className={styles.base} width="170" height="179" alt="" />
          <img src={reactLogo} className={styles.framework} alt="React logo" />
          <img src={viteLogo} className={styles.vite} alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          className={styles.counter}
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className={styles.ticks}></div>

    </>
  )
}
