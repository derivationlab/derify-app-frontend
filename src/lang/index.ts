import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import Cache from '@/utils/cache'
import { LANG_CACHE_KEY } from '@/config'

const langFiles = require.context('./languages', false, /.ts$/)

const langItems: any[] = []

const langs = langFiles.keys().reduce((langs: { [index: string]: any }, path: string) => {
  const lang = langFiles(path).default
  const {
    info: { code, name, sort },
    dicts
  } = lang
  langs[code] = { translation: dicts }
  langItems.push({ value: code, label: name, sort: sort })
  return langs
}, {})

export const languages = langItems.sort((a, b) => a.sort - b.sort)

const fallbackLng = Cache.get(LANG_CACHE_KEY) ?? 'en'

i18n
  .use(initReactI18next) // init i18next
  .init({
    resources: langs,
    fallbackLng,
    debug: false,
    interpolation: {
      escapeValue: false
    }
  })
  .catch(() => null)
export default i18n
