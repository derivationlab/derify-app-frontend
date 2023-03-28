const info = {
  name: 'English',
  code: 'en',
  sort: 1
}

const dictsFiles = require.context('./en', false, /.ts$/)
const dicts = dictsFiles.keys().reduce((dicts: { [index: string]: any }, path) => {
  const dict = dictsFiles(path).default
  dicts[dict.section] = dict.dicts
  return dicts
}, {})

export default {
  info,
  dicts
}
