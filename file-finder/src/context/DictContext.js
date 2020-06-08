import React, { createContext, useState, useEffect, useRef } from 'react'
import { walkDirCallback } from '../crawler/Crawler'
import { loadConfig, saveConfig, saveDB, loadDB } from '../storage/storageUtils'

// const electron = window.require('electron')
// const fs = window.require('fs')
// const zlib = window.require('zlib')

export const DictContext = createContext()

function usePreviousState(value) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const DictContextProvider = (props) => {
  const loadedConfig = loadConfig()
  const [config, setConfig] = useState(
    loadedConfig
      ? loadedConfig
      : {
          dirPaths: [],
        }
  )
  const [dict, setDict] = useState(null)
  const prevConfig = usePreviousState(config)

  useEffect(() => {
    saveConfig(config)
    const dirs = config.dirPaths
      .filter((dirPath) => {
        return dirPath.status === 'pending'
      })
      .map((dirPath) => {
        return dirPath.dir
      })
    populateDict(dict, dirs)
  })

  // const diffDirsFromConfig = () => {
  //   const dirs = config.dirPaths.map((dirPath) => {
  //     return dirPath.dir
  //   })

  //   if (prevConfig) {
  //     const prevDirs = prevConfig.dirPaths.map((dirPath) => {
  //       return dirPath.dir
  //     })
  //     const currentDirs = config.dirPaths.map((dirPath) => {
  //       return dirPath.dir
  //     })
  //     return currentDirs.filter((x) => !prevDirs.includes(x))
  //   } else {
  //     return dirs
  //   }
  // }

  const initDict = async () => {
    const finder = await import('fuzzy-finder')
    if (!dict) {
      const newDict = new finder.DictData()
      loadDB(newDict)
      setDict(newDict)
    }
  }

  const populateDict = (dict, newDirs) => {
    console.log(dict, newDirs)
    if (!dict) return
    walkDirCallback(
      newDirs,
      (file) => {
        dict.insert(file, file)
      },
      (err) => {
        console.log('Crawling done for : ', newDirs)
        let newConfigDirPaths = config.dirPaths.map((dirPath) => {
          return newDirs.includes(dirPath.dir)
            ? { dir: dirPath.dir, status: 'done' }
            : dirPath
        })
        setConfig({ dirPaths: newConfigDirPaths })
        saveDB(dict)
      }
    )
  }

  const addDir = (item) => {
    setConfig({
      ...config,
      dirPaths: [...config.dirPaths, item],
    })
  }

  initDict()
  return (
    <DictContext.Provider value={{ config, dict, addDir }}>
      {props.children}
    </DictContext.Provider>
  )
}

export default DictContextProvider
