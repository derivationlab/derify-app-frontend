// @ts-nocheck
import { createContext } from 'react'

const FormContext = createContext({
  register: (str: string, o: Record<string, any> | undefined) => ({}),
  resetField: (str: string) => null,
  rules: {},
  watch: (str?: string) => null,
  errors: {},
  setValue: (str: string, value: any) => null
})

export default FormContext
