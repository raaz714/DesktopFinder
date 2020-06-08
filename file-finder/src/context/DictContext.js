import React, { createContext, useState, useEffect } from 'react'
import { walkDirCallback } from '../crawler/Crawler'
import { loadConfig, saveConfig, saveDB, loadDB } from '../storage/storageUtils'

export const DictContext = createContext()

// function usePreviousState(value) {
//   const ref = useRef()
//   useEffect(() => {
//     ref.current = value
//   })
//   return ref.current
// }

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
  // const prevConfig = usePreviousState(config)

  useEffect(() => {
    if (!dict) {
      initDict()
      return
    }
    saveConfig(config)
    const dirs = config.dirPaths
      .filter((dirPath) => {
        return dirPath.status === 'pending'
      })
      .map((dirPath) => {
        return dirPath.dir
      })
    if (dirs.length) {
      populateDict(dict, dirs)

      let newConfigDirPaths = config.dirPaths.map((dirPath) => {
        return dirs.includes(dirPath.dir)
          ? { dir: dirPath.dir, status: 'crawling' }
          : dirPath
      })
      setConfig({ dirPaths: newConfigDirPaths })
    }
  })

  const initDict = async () => {
    const finder = await import('fuzzy-finder')
    if (!dict) {
      const newDict = new finder.DictData()
      loadDB(newDict)
      setDict(newDict)
    }
  }

  const populateDict = async (dict, newDirs) => {
    console.log(dict, newDirs)
    if (!dict) return
    walkDirCallback(
      newDirs,
      (file) => {
        dict.insert(file, file)
      },
      (err) => {
        // console.log('Crawling done for : ', newDirs)
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

  // initDict()
  return (
    <DictContext.Provider value={{ config, dict, addDir }}>
      {props.children}
    </DictContext.Provider>
  )
}

export default DictContextProvider
