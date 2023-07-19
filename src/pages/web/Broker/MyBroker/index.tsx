import { useAtomValue } from 'jotai'

import React, { FC } from 'react'

import { userBrokerBoundAtom } from '@/atoms/useBrokerData'
import { Rec } from '@/typings'

import BrokerCard from './c/BrokerCard'

const MyBroker: FC = () => {
  const userBrokerBound = useAtomValue(userBrokerBoundAtom)

  return <BrokerCard broker={userBrokerBound as Rec} />
}

export default MyBroker
