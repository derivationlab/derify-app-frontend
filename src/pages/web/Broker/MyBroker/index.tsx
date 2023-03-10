import React, { FC } from 'react'

import { useBrokerInfo } from '@/zustand/useBrokerInfo'

import BrokerCard from './c/BrokerCard'

const MyBroker: FC = () => {
  const brokerBound = useBrokerInfo((state) => state.brokerBound)

  return <BrokerCard broker={brokerBound} />
}

export default MyBroker
