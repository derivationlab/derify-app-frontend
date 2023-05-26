import { languageDesc } from '@/i18n'
import { Rec } from '@/typings'

const files = require.context('./zh', false, /.ts$/)
const filesKeys = files.keys()
const output = filesKeys.reduce((init: Rec, path) => {
  const { section, dictionary } = files(path).default
  init[section] = dictionary
  return init
}, {})

export default { desc: languageDesc['zh-CN'], output }
