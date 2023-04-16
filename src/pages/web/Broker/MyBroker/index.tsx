import React, { FC } from 'react'

import { useBrokerInfoStore } from '@/store'

import BrokerCard from './c/BrokerCard'

const MyBroker: FC = () => {
  const brokerBound = useBrokerInfoStore((state) => state.brokerBound)

  return <BrokerCard broker={brokerBound} />
}

export default MyBroker
