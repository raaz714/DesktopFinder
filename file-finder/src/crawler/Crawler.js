const fs = window.require('fs')
const path = window.require('path')

export const walkDir = (dir, done) => {
  var results = []
  fs.readdir(dir, (err, list) => {
    if (err) return done(err)
    var pending = list.length
    if (!pending) return done(null, results)
    list.forEach((file) => {
      file = path.resolve(dir, file)
      fs.stat(file, (err, stat) => {
        results.push(file)
        if (stat && stat.isDirectory()) {
          walkDir(file, (err, res) => {
            results = results.concat(res)
            if (!--pending) done(null, results)
          })
        } else {
          if (!--pending) done(null, results)
        }
      })
    })
  })
}

export const walkDirCallback = (dirs, callback, done) => {
  Array.from(dirs).forEach(async (dir) => {
    fs.readdir(dir, (err, list) => {
      if (err) return done(err)
      var pending = list.length
      if (!pending) return done(null)
      list.forEach((file) => {
        file = path.resolve(dir, file)
        fs.stat(file, (err, stat) => {
          callback(file)
          if (stat && stat.isDirectory()) {
            walkDirCallback([file], callback, (err) => {
              if (!--pending) done(null)
            })
          } else {
            if (!--pending) done(null)
          }
        })
      })
    })
  })
}
