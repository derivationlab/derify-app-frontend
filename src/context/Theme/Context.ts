import { createContext } from 'react'
import { ThemeOptions } from '@/data'

const ThemeContext = createContext({
  theme: ThemeOptions[0].toLocaleLowerCase(),
  changeTheme: (val: string) => null
})

export default ThemeContext
