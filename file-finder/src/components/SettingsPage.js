import React from 'react'
import { useAppState, useAppReducer } from '../AppContext'
const { dialog } = window.require('electron').remote

function AddItemForm() {
  const dispatch = useAppReducer()
  const { dirPaths } = useAppState()
  console.log(dirPaths)
  const dirList = dirPaths.map((dirPath, index) => {
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
            dispatch({ type: 'ADD_ITEM', item: newItem })
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
