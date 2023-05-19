import React, { FC, useState, useEffect, createContext } from 'react'

import { ThemeOptions } from '@/data'
import Cache from '@/utils/cache'

import Context from './Context'

const CacheKey = 'THEME-KEY'

const ThemeProvider: FC = ({ children }) => {
  const [theme, setTheme] = useState<string>(ThemeOptions[0])

  const changeTheme = (item: string) => {
    setTheme(item)
    const value = item.toLocaleLowerCase()
    Cache.set(CacheKey, value)
    // @ts-ignore
    const htmlClassList = document.querySelector('html').classList
    if (value === 'dark') {
      htmlClassList.add('dark')
    } else {
      htmlClassList.remove('dark')
    }
    return null
  }

  useEffect(() => {
    const themeCache = Cache.get(CacheKey) ?? 'light'
    if (themeCache === 'dark') {
      changeTheme(ThemeOptions[1])
    } else {
      Cache.set(CacheKey, 'light')
    }
  }, [])

  return <Context.Provider value={{ theme, changeTheme }}>{children}</Context.Provider>
}

export default ThemeProvider

export const ThemeContext = createContext({
  theme: ThemeOptions[0].toLocaleLowerCase(),
  changeTheme: (val: string) => null
})
