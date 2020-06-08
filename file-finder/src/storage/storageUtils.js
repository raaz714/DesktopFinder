const electron = window.require('electron')
const fs = window.require('fs')
const zlib = window.require('zlib')

export const getConfigDir = () => {
  return electron.remote.app.getPath('home') + '/.raazsearch/'
}

const getConfigPath = () => {
  return getConfigDir() + 'config.json'
}

const getDBPath = () => {
  return getConfigDir() + 'dat_dump'
}

export const loadConfig = () => {
  const configPath = getConfigPath()
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath))
  } else {
    console.log("doesn't exist")
    return undefined
  }
}

export const saveConfig = (state) => {
  try {
    const jsonConfig = JSON.stringify(state)
    const configPath = getConfigPath()
    fs.writeFileSync(configPath, jsonConfig, 'utf-8')
  } catch (err) {
    console.error(err)
  }
}

export const loadDB = (dict) => {
  if (fs.existsSync(getDBPath())) {
    const buff = JSON.parse(zlib.inflateSync(fs.readFileSync(getDBPath())))
    console.log(dict.populate_from_buffer(buff))
  }
}

export const saveDB = async (dict) => {
  const buff = JSON.stringify(dict.write_to_buffer())
  fs.writeFileSync(getDBPath(), zlib.deflateSync(buff), 'utf-8')
}
