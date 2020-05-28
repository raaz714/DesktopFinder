import React, { Component } from 'react'
import { AppStateProvider } from './AppContext'
import { RenderSearchPage } from './components/SearchPage'
import { AddItemForm } from './components/SettingsPage'

class App extends Component {
  componentDidMount() {
    // localStorage.clear()
  }

  render() {
    return (
      <AppStateProvider>
        <AddItemForm />
        <RenderSearchPage />
      </AppStateProvider>
    )
  }
}

export default App
