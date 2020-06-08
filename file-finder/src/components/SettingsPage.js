import React, { useContext } from 'react'
import { DictContext } from '../context/DictContext'

const { dialog } = window.require('electron').remote

function AddItemForm() {
  const { config, addDir } = useContext(DictContext)
  const dirList = config.dirPaths.map((dirPath, index) => {
    return <li key={index}>{dirPath.dir}</li>
  })

  function pickDir() {
    dialog
      .showOpenDialog({
        properties: ['openDirectory'],
      })
      .then((result) => {
        if (!result.canceled) {
          console.log(result.filePaths[0])
          const newItem = {
            dir: result.filePaths[0],
            status: 'pending',
          }
          if (!!newItem.dir.trim()) {
            // dispatch({ type: 'ADD_ITEM', item: newItem })
            addDir(newItem)
          }
        }
      })
  }

  return (
    <div>
      <button onClick={pickDir}>Add Folder</button>
      <div>
        <ul>{dirList}</ul>
      </div>
    </div>
  )
}

export { AddItemForm }
