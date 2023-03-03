import React, { FC } from 'react'
import { useAccount } from 'wagmi'

import ConnectButton from '@/components/common/Wallet/ConnectButton'
import Loading from '@/components/common/Loading'

import BrokerCard from './c/BrokerCard'
import { useBrokerInfo } from '@/zustand/useBrokerInfo'

const MyBroker: FC = () => {
  const { data: account } = useAccount()

  const brokerBound = useBrokerInfo((state) => state.brokerBound)
  const brokerBoundLoaded = useBrokerInfo((state) => state.brokerBoundLoaded)

  if (!account?.address) {
    return (
      <section className="web-not-connect" style={{ borderRadius: `${48}px` }}>
        <ConnectButton />
      </section>
    )
  }

  return !brokerBoundLoaded ? <Loading show type="fixed" /> : <BrokerCard broker={brokerBound} />
}

export default MyBroker
