import React, { Component } from 'react'
import './App.css'

import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import SettingsIcon from '@material-ui/icons/Settings'
import SearchIcon from '@material-ui/icons/Search'

import { AppStateProvider } from './AppContext'
import { RenderSearchPage } from './components/SearchPage'
import { AddItemForm } from './components/SettingsPage'

class App extends Component {
  constructor() {
    super()
    this.state = { value: 0 }
  }

  componentDidMount() {
    // localStorage.clear()
  }

  handleChange = (event, newValue) => {
    this.setState({ value: newValue })
  }

  render() {
    return (
      // <AppStateProvider>
      //   <AddItemForm />
      //   <RenderSearchPage />
      // </AppStateProvider>

      <AppStateProvider>
        <Container maxWidth='md'>
          <Paper square>
            <Tabs
              value={this.state.value}
              onChange={this.handleChange}
              variant='fullWidth'
              indicatorColor='primary'
              textColor='primary'
              aria-label='icon tabs example'
            >
              <Tab icon={<SearchIcon />} aria-label='search' />
              <Tab icon={<SettingsIcon />} aria-label='settings' />
            </Tabs>
            {/* {this.state.value === 0 && <RenderSearchPage />}
            {this.state.value === 1 && <AddItemForm />} */}
            <div className={this.state.value === 0 ? '' : 'hidden'}>
              <RenderSearchPage />
            </div>
            <div className={this.state.value === 1 ? '' : 'hidden'}>
              <AddItemForm />
            </div>
          </Paper>
        </Container>
      </AppStateProvider>
    )
  }
}

export default App
