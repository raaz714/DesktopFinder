import React from 'react'
import './App.css'
const electron = window.require('electron')
// const path = window.require('path')

const handleCheck = (file) => {
  // electron.remote.app
  //   .getFileIcon(path.normalize(file), { size: 'large' })
  //   .then((icon) => {
  //     let url = icon.toDataURL()
  //     console.log(url)
  //   })
  electron.shell.openPath(file)
}

export default function Results(props) {
  const results = props.results
  const listItems = results.map((result, index) => {
    let fileName = result[0].split('\\').pop().split('/').pop()
    let fileExt = fileName.split('.').pop()
    if (fileExt === fileName) fileExt = 'DIR'
    return (
      <li key={index} onClick={() => handleCheck(result[0])}>
        <div className='result'>
          {/* <div style={{ width: '5%' }}>
            <FileIcon extension={fileExt} {...defaultStyles.docx} />
          </div> */}
          <div>
            <h1>
              {fileName} - [{result[1]}]
            </h1>
            <h2>{result[0]}</h2>
          </div>
        </div>
      </li>
    )
  })
  return <ul className='resultsview'>{listItems}</ul>
}
