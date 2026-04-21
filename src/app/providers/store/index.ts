// src/app/providers/store/index.ts

export { store } from './store'
export { useAppDispatch, useAppSelector } from './hooks'
export { setCommandPaletteOpen, setCurrentView } from './ui-slice'
export type { ViewType } from './ui-slice'
export type { AppDispatch } from './store'
