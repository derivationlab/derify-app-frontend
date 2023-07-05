import React, { FC } from 'react'
import { isMobile } from 'react-device-detect'

import Step2Mobile from './Mobile'
import Step2Web from './Web'

const BrokerSignUpStep2: FC = () => {
  return isMobile ? <Step2Mobile /> : <Step2Web />
}

export default BrokerSignUpStep2
