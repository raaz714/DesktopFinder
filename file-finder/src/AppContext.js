import React, { createContext, useContext, useReducer } from 'react'
import { getConfigDir, loadState, saveState } from './config-storage'

export const AppContext = createContext()

export function useAppState() {
  return useContext(AppContext)[0]
}

export function useAppReducer() {
  return useContext(AppContext)[1]
}

export function usedirPaths() {
  //   const { dirPaths } = useAppState()
  //   const pending = dirPaths.filter((item) => item.status === 'pending')
  //   const paused = dirPaths.filter((item) => item.status === 'paused')
  //   const completed = dirPaths.filter((item) => item.status === 'completed')
  //   return { pending, paused, completed }
}

const appStateReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const newState = {
        ...state,
        dirPaths: state.dirPaths.concat(action.item),
      }
      saveState(newState)
      return newState
    }
    // case 'UPDATE_ITEM': {
    //   const newdirPaths = state.dirPaths.map((i) => {
    //     if (i.key === action.item.key) {
    //       return Object.assign({}, i, {
    //         status: action.item.status,
    //       })
    //     }
    //     return i
    //   })
    //   const newState = { ...state, dirPaths: newdirPaths }
    //   saveState(newState)
    //   return newState
    // }
    // case 'DELETE_ITEM': {
    //   const newState = {
    //     ...state,
    //     dirPaths: state.dirPaths.filter((item) => item.key !== action.item.key),
    //   }
    //   saveState(newState)
    //   return newState
    // }
    default:
      return state
  }
}

export function AppStateProvider({ children }) {
  let initialState = loadState()

  if (initialState === undefined) {
    initialState = {
      dumpPath: getConfigDir() + 'dat_dump',
      dirPaths: [],
    }
  }

  saveState(initialState)

  const value = useReducer(appStateReducer, initialState)
  return (
    <div className='App'>
      <AppContext.Provider value={value}>{children}</AppContext.Provider>
    </div>
  )
}
