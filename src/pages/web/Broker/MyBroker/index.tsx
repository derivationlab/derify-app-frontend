import React, { FC } from 'react'
import { useAccount } from 'wagmi'

import { useTraderData } from '@/store/trader/hooks'

import ConnectButton from '@/components/common/Wallet/ConnectButton'
import Loading from '@/components/common/Loading'

import BrokerCard from './c/BrokerCard'

const MyBroker: FC = () => {
  const { data: account } = useAccount()
  const { brokerBound, brokerBoundLoaded } = useTraderData()

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
