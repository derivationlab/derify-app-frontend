import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'
import { useHistory, useParams } from 'react-router-dom'
import React, { FC, useEffect, useState } from 'react'

import { PubSubEvents } from '@/typings'
import { useBrokerInfoStore } from '@/store'
import { bindingYourBroker, getBrokerInfoWithBrokerId } from '@/api'

import Loading from '@/components/common/Loading'
import BrokerCard from './c/BrokerCard'

const BrokerInfo: FC = () => {
  const history = useHistory()

  const { address } = useAccount()
  const { id: brokerId } = useParams<{ id: string }>()

  const [brokerInfo, setBrokerInfo] = useState<Record<string, any>>({})
  const [infoLoaded, setInfoLoaded] = useState<boolean>(true)

  const bound = useBrokerInfoStore((state) => state.brokerBound)
  const loaded = useBrokerInfoStore((state) => state.brokerBoundLoaded)

  const bindBrokerFunc = async () => {
    const toast = window.toast.loading('binding...')

    const data = await bindingYourBroker({ trader: address, brokerId })

    if (data.code === 0) {
      // succeed
      PubSub.publish(PubSubEvents.UPDATE_BROKER_BOUND_DAT)

      history.push('/broker')
    } else {
      // failed
      // window.toast.error(data.msg)
      window.toast.error('Already bind broker')
    }

    window.toast.dismiss(toast)
  }

  const brokerInfoFunc = async () => {
    setInfoLoaded(true)

    if (bound?.broker) {
      history.push('/broker')
    } else {
      const { data } = await getBrokerInfoWithBrokerId(brokerId)

      if (data.length > 0) {
        const [info] = data
        if (info?.is_enable === 1) {
          setBrokerInfo(data[0])

          // auto bind broker
          await bindBrokerFunc()

          setInfoLoaded(false)
        }
      } else {
        history.push('/broker')
      }
    }
  }

  useEffect(() => {
    if (loaded) void brokerInfoFunc()
  }, [loaded, address])

  return infoLoaded ? <Loading show type="fixed" /> : <BrokerCard broker={brokerInfo} />
}

export default BrokerInfo
