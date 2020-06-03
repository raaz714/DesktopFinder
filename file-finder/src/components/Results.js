import React from 'react'
import '../App.css'
import Grid from '@material-ui/core/Grid'
import ResultCard from './ResultCard'

export default function Results(props) {
  const results = props.results
  const listItems = results.map((result, index) => {
    let fileName = result[0].split('\\').pop().split('/').pop()
    let fileExt = fileName.split('.').pop()
    if (fileExt === fileName) fileExt = 'DIR'
    return (
      <ResultCard
        key={index}
        fileName={fileName}
        filePath={result[0]}
        fileExt={fileExt}
        score={result[1]}
      />
      // <li key={index} onClick={() => handleCheck(result[0])}>
      //   <div className='result'>
      //     {/* <div style={{ width: '5%' }}>
      //       <FileIcon extension={fileExt} {...defaultStyles.docx} />
      //     </div> */}
      //     <div>
      //       <h1>
      //         {fileName} - [{result[1]}]
      //       </h1>
      //       <h2>{result[0]}</h2>
      //     </div>
      //   </div>
      // </li>
    )
  })
  // return <ul className='resultsview'>{listItems}</ul>
  return (
    <Grid container spacing={3}>
      {listItems}
    </Grid>
  )
}
