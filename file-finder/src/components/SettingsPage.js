import React, { useContext } from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import { DictContext } from '../context/DictContext'

const { dialog } = window.require('electron').remote

function AddItemForm() {
  const { config, addDir } = useContext(DictContext)
  const dirList = config.dirPaths.map((dirPath, index) => {
    return (
      <ListItem key={index}>
        <ListItemText primary={dirPath.dir} secondary={dirPath.status} />
      </ListItem>
    )
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
        <List>{dirList}</List>
      </div>
    </div>
  )
}

export { AddItemForm }
