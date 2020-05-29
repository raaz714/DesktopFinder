import React, { Component } from 'react'
import SearchField from 'react-search-field'
import '../App.css'
import Results from './Results'
import { walkDirCallback } from '../crawler/Crawler'
import { useAppState } from '../AppContext'

const fs = window.require('fs')
const zlib = window.require('zlib')

class SearchPage extends Component {
  constructor() {
    super()
    this.state = { dict: null, results: [] }
  }

  handleQueryChange = (value, event) => {
    let query = value

    if (value.length < 3 || !this.state.dict) {
      this.setState({ results: [] })
      return
    }

    let results = this.state.dict.fuzzy_search(query)
    this.setState({ results: results })
  }

  componentDidMount() {
    this.loadDict()
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) this.refreshDict()
  }

  loadDict = () => {
    if (fs.existsSync(this.props.dumpPath)) {
      console.log('Populating dict')
      import('fuzzy-finder').then((finder) => {
        let dict = new finder.DictData()
        let buff = JSON.parse(
          zlib.inflateSync(fs.readFileSync(this.props.dumpPath))
        )

        console.log(dict.populate_from_buffer(buff))

        this.setState({ dict: dict })
      })
    } else {
      this.refreshDict()
    }
  }

  refreshDict = () => {
    import('fuzzy-finder').then((finder) => {
      console.log('Loading database')
      if (!this.state.dict) {
        let dict = new finder.DictData()
        this.setState({ dict: dict }, () => {
          this.populateDict()
        })
      } else {
        this.populateDict()
      }
    })
  }

  populateDict = () => {
    walkDirCallback(
      this.props.dirPaths,
      (file) => {
        this.state.dict.insert(file, file)
      },
      (err) => {
        let buff = JSON.stringify(this.state.dict.write_to_buffer())
        fs.writeFileSync(this.props.dumpPath, zlib.deflateSync(buff), 'utf-8')
        console.log('Done, loading database')
      }
    )
  }

  render() {
    return (
      <div>
        <div className='header'>
          {this.state.dict && (
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
  const { dumpPath, dirPaths } = useAppState()
  let dirs = dirPaths.map((dirPath) => {
    return dirPath.dir
  })

  console.log(dumpPath, dirPaths, dirs)
  return <SearchPage dumpPath={dumpPath} dirPaths={dirs} />
}

export { SearchPage, RenderSearchPage }
