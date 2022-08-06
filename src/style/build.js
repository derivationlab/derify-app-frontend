#!/usr/bin/env node

const fs = require('fs')
const os = require('os')
const path = require('path')

const isWindows = () => {
  return os.type() === 'Windows_NT'
}

const getAllFile = (dir, filesList = []) => {
  const files = fs.readdirSync(dir)
  files.forEach((item, index) => {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      getAllFile(path.join(dir, item), filesList)
    } else {
      filesList.push(fullPath)
    }
  })
  return filesList
}

const calcScssFileDir = (path) => {
  const tmp = path.split(isWindows() ? '\\' : '/')
  return tmp.length === 1 ? null : tmp[0]
}

const getAllScss = () => {
  const allSassList = []
  getAllFile(__dirname, []).forEach((i) => {
    const filePath = i.replace(`${__dirname}${isWindows() ? '\\' : '/'}`, '')
    const suffix = filePath.split('.')[1]
    const dir = calcScssFileDir(filePath)
    if (suffix === 'scss' && dir && dir !== 'base') {
      allSassList.push(filePath)
    }
  })
  return allSassList
}

const writeStyleScss = (file) => {
  const mainContent = fs.readFileSync(path.resolve(__dirname, './config.scss'))
  fs.writeFileSync(file, mainContent, (e) => console.error(e))
  getAllScss().forEach((i) => {
    i = isWindows() ? i.replace(/\\/g, '/') : i
    fs.appendFileSync(file, `@import "${i}";${isWindows() ? '\r' : ''}\n`)
  })
  console.log(`${file} build success`)
}

const main = () => {
  writeStyleScss(path.resolve(__dirname, './style.scss'))
  console.log(+new Date())
}

if (!module.parent) {
  main()
}

module.exports = main
