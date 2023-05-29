import i18n from 'i18next'

import { initReactI18next } from 'react-i18next'

import { LANG_CACHE_KEY } from '@/config'
import { Rec } from '@/typings'
import Cache from '@/utils/cache'

type Lang = 'en' | 'zh-CN'
export const languageDesc: { [key in Lang]: Rec } = {
  en: {
    key: 'English',
    lng: 'en'
  },
  'zh-CN': {
    key: '简体中文',
    lng: 'zh-CN'
  }
}

export const languageOptions = Object.values(languageDesc)

const files = require.context('./langs', false, /.ts$/)
const filesKeys = files.keys()
const resources = filesKeys.reduce((init: Rec, path) => {
  const {
    desc: { lng },
    output
  } = files(path).default
  init[lng] = { translation: output }
  return init
}, {})
const fallbackLng = Cache.get(LANG_CACHE_KEY) ?? 'en'

i18n.use(initReactI18next).init({
  resources,
  fallbackLng,
  interpolation: {
    escapeValue: false
  }
})

export default i18n
