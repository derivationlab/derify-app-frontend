import React, { FC, useContext } from 'react'

import { MobileContext } from '@/providers/Mobile'

import Step2Mobile from './Mobile'
import Step2Web from './Web'

const BrokerSignUpStep2: FC = () => {
  const { mobile } = useContext(MobileContext)
  return mobile ? <Step2Mobile /> : <Step2Web />
}

export default BrokerSignUpStep2
