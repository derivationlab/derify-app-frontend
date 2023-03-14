import React, { FC, useState, useEffect, createContext } from 'react'
import { isMobile } from '@/utils/tools'

export const Mobile = createContext({
  mobile: false
})

const MobileProvider: FC = ({ children }) => {
  const [mobile, setMobile] = useState<boolean>(false)

  useEffect(() => {
    setMobile(isMobile())
  }, [])

  return <Mobile.Provider value={{ mobile }}>{children}</Mobile.Provider>
}

export default MobileProvider
