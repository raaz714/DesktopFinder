import React, { Component, useContext } from 'react'
import SearchField from 'react-search-field'
import '../App.css'
import Results from './Results'
import { DictContext } from '../context/DictContext'

class SearchPage extends Component {
  constructor() {
    super()
    this.state = { dict: null, results: [] }
  }

  handleQueryChange = (value, event) => {
    let query = value

    if (value.length < 3 || !this.props.dict) {
      this.setState({ results: [] })
      return
    }

    let results = this.props.dict.fuzzy_search(query)
    this.setState({ results: results })
  }

  // loadDict = () => {
  //   if (fs.existsSync(this.props.dumpPath)) {
  //     console.log('Populating dict')
  //     import('fuzzy-finder').then((finder) => {
  //       let dict = new finder.DictData()
  //       let buff = JSON.parse(
  //         zlib.inflateSync(fs.readFileSync(this.props.dumpPath))
  //       )

  //       console.log(dict.populate_from_buffer(buff))

  //       this.setState({ dict: dict })
  //     })
  //   } else {
  //     this.refreshDict(this.props.dirPaths)
  //   }
  // }

  // refreshDict = (newDirs) => {
  //   import('fuzzy-finder').then((finder) => {
  //     console.log('Loading database')
  //     if (!this.state.dict) {
  //       let dict = new finder.DictData()
  //       this.setState({ dict: dict }, () => {
  //         this.populateDict(newDirs)
  //       })
  //     } else {
  //       this.populateDict(newDirs)
  //     }
  //   })
  // }

  // populateDict = (newDirs) => {
  //   let { dict } = this.state
  //   console.log('populateDict', newDirs)
  //   walkDirCallback(
  //     newDirs,
  //     (file) => {
  //       dict.insert(file, file)
  //     },
  //     (err) => {
  //       let buff = JSON.stringify(dict.write_to_buffer())
  //       fs.writeFileSync(this.props.dumpPath, zlib.deflateSync(buff), 'utf-8')
  //       this.setState({ dict: dict }, () => {
  //         console.log('Done, loading database')
  //       })
  //     }
  //   )
  // }

  render() {
    return (
      <div>
        <div className='header'>
          {this.props.dict && (
            <SearchField
              placeholder='Search ...'
              onChange={this.handleQueryChange}
              searchText=''
              style={{ height: '70px' }}
            />
          )}
        </div>
        <div>
          <Results results={this.state.results} />
        </div>
      </div>
    )
  }
}

const RenderSearchPage = () => {
  const { config, dict } = useContext(DictContext)
  let dirs = config.dirPaths.map((dirPath) => {
    return dirPath.dir
  })

  return <SearchPage dumpPath={config.dumpPath} dirPaths={dirs} dict={dict} />
}

export { SearchPage, RenderSearchPage }
