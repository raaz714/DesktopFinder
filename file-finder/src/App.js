import React, { Component } from 'react'
import SearchField from 'react-search-field'
import './App.css'
import Results from './Results'

const fs = window.require('fs')

class App extends Component {
  constructor() {
    super()
    this.state = { dict: null, results: [] }
    // this.initDict()
  }

  handleQueryChange = (value, event) => {
    // console.log('On Change : ', value)
    let query = value

    if (value.length < 3 || !this.state.dict) return

    let results = this.state.dict.fuzzy_search(query)
    this.setState({ results: results })
  }

  componentDidMount() {
    const filePath =
      '/home/raaz/Documents/git/DesktopSearch/cpp/crawler/full.json'
    if (fs.existsSync(filePath)) {
      import('fuzzy-finder').then((finder) => {
        let dict = new finder.DictData()
        let jsonContent = fs.readFileSync(filePath, 'utf8')
        let json_obj = JSON.parse(jsonContent)
        for (let key in json_obj) {
          dict.insert(key, key)
        }
        this.setState({ dict: dict })
        console.log('Done, loading database')
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
