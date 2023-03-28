const info = {
  name: '简体中文',
  code: 'zh-CN',
  sort: 2
}

const dictsFiles = require.context('./zh-CN', false, /.ts$/)
const dicts = dictsFiles.keys().reduce((dicts: { [index: string]: any }, path) => {
  const dict = dictsFiles(path).default
  dicts[dict.section] = dict.dicts
  return dicts
}, {})

export default {
  info,
  dicts
}
