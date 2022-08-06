import { useHistory, useParams } from 'react-router-dom'
import React, { FC, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

import { bindYourBroker, getBrokerInfoById } from '@/api'

import { useAppDispatch } from '@/store'
import { getBrokerBoundDataAsync } from '@/store/trader'
import { useTraderData } from '@/store/trader/hooks'

import Loading from '@/components/common/Loading'

import BrokerCard from './c/BrokerCard'

const BrokerInfo: FC = () => {
  const history = useHistory()
  const dispatch = useAppDispatch()
  const { data: account } = useAccount()
  const { id: brokerId } = useParams<{ id: string }>()
  const { brokerBound, brokerBoundLoaded } = useTraderData()

  const [brokerInfo, setBrokerInfo] = useState<Record<string, any>>({})
  const [infoLoaded, setInfoLoaded] = useState<boolean>(true)

  const bindBrokerFunc = async () => {
    const toast = window.toast.loading('binding...')

    const data = await bindYourBroker({ trader: account?.address, brokerId })

    if (data.code === 0) {
      // succeed
      if (account?.address) dispatch(getBrokerBoundDataAsync(account.address))
      history.push('/broker')
    } else {
      // failed
      // window.toast.error(data.msg)
      window.toast.error('Already bind broker')
    }

    window.toast.dismiss(toast)
  }

  const getBrokerInfoByIdFunc = async () => {
    setInfoLoaded(true)

    const { data } = await getBrokerInfoById(brokerId)

    if (data.length) {
      setBrokerInfo(data[0])

      // auto bind broker
      if (brokerBound?.broker) {
        history.push('/broker')
      } else {
        void (await bindBrokerFunc())
      }
    } else {
      history.push('/broker')
    }

    setInfoLoaded(false)
  }

  useEffect(() => {
    if (brokerBoundLoaded) void getBrokerInfoByIdFunc()
  }, [brokerBoundLoaded])

  return infoLoaded ? <Loading show type="fixed" /> : <BrokerCard broker={brokerInfo} />
}

export default BrokerInfo
