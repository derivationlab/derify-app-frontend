import React, { FC, useState, useEffect, createContext } from 'react'
import { isMobile } from '@/utils/tools'

export const MobileContext = createContext({
  mobile: false
})

const MobileProvider: FC = ({ children }) => {
  const [mobile, setMobile] = useState<boolean>(false)

  useEffect(() => {
    setMobile(isMobile())
  }, [])

  return <MobileContext.Provider value={{ mobile }}>{children}</MobileContext.Provider>
}

export default MobileProvider
