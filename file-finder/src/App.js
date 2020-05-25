import React, { Component } from 'react'
import SearchField from 'react-search-field'
import './App.css'
import Results from './Results'

const fs = window.require('fs')
const zlib = window.require('zlib')

class App extends Component {
  constructor() {
    super()
    this.state = { dict: null, results: [] }
    // this.initDict()
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

  loadDict = () => {
    const jsonPath =
      '/home/raaz/Documents/no-git/DesktopSearch/cpp/crawler/full.json'
    const dumpPath = '/home/raaz/dict_dump'

    if (fs.existsSync(dumpPath)) {
      console.log('Populating dict')
      import('fuzzy-finder').then((finder) => {
        let dict = new finder.DictData()
        let buff = JSON.parse(zlib.inflateSync(fs.readFileSync(dumpPath)))

        console.log(dict.populate_from_buffer(buff))

        this.setState({ dict: dict })
      })
    } else if (fs.existsSync(jsonPath)) {
      import('fuzzy-finder').then((finder) => {
        console.log('Loading database')

        let dict = new finder.DictData()
        let jsonContent = fs.readFileSync(jsonPath, 'utf8')
        let json_obj = JSON.parse(jsonContent)

        for (let key in json_obj) {
          dict.insert(key, key)
        }

        let buff = JSON.stringify(dict.write_to_buffer())

        fs.writeFileSync(dumpPath, zlib.deflateSync(buff), 'utf-8')
        console.log('Done, loading database')

        this.setState({ dict: dict })
      })
    }
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

export default App
