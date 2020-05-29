const electron = window.require('electron')
const fs = window.require('fs')

export const getConfigDir = () => {
  return electron.remote.app.getPath('home') + '/.raazsearch/'
}

const getConfigPath = () => {
  return getConfigDir() + 'config.json'
}

export const loadState = () => {
  const configPath = getConfigPath()
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath))
  } else {
    console.log("doesn't exist")
    return undefined
  }
}

export const saveState = (state) => {
  try {
    const jsonConfig = JSON.stringify(state)
    const configPath = getConfigPath()
    fs.writeFileSync(configPath, jsonConfig, 'utf-8')
  } catch (err) {
    console.error(err)
  }
}
