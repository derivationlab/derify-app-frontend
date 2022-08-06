import React, { FC, useContext } from 'react'
import { MobileContext } from '@/context/Mobile'

import Step2Web from './Web'
import Step2Mobile from './Mobile'

const BrokerSignUpStep2: FC = () => {
  const { mobile } = useContext(MobileContext)
  return mobile ? <Step2Mobile /> : <Step2Web />
}

export default BrokerSignUpStep2
