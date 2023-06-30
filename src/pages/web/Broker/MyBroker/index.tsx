import React, { FC } from 'react'

import { useBrokerInfoStore } from '@/store'
import { Rec } from '@/typings'

import BrokerCard from './c/BrokerCard'

const MyBroker: FC = () => {
  const brokerBound = useBrokerInfoStore((state) => state.brokerBound)

  return <BrokerCard broker={brokerBound as Rec} />
}

export default MyBroker
