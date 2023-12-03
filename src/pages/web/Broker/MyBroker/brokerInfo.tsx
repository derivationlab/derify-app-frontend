import { bindingYourBroker, getBrokerInfoWithBrokerId } from 'derify-apis-v20'
import { useAtomValue, useSetAtom } from 'jotai'
import { useAccount } from 'wagmi'

import React, { FC, useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import { asyncUserBrokerBoundAtom, userBrokerBoundAtom } from '@/atoms/useBrokerData'
import Spinner from '@/components/common/Spinner'
import { Rec } from '@/typings'

import BrokerCard from './c/BrokerCard'

const BrokerInfo: FC = () => {
  const history = useHistory()
  const { address } = useAccount()
  const { id: brokerId } = useParams<{ id: string }>()
  const [brokerInfo, setBrokerInfo] = useState<Record<string, any>>({})
  const [infoLoaded, setInfoLoaded] = useState<boolean>(true)
  const userBrokerBound = useAtomValue(userBrokerBoundAtom)
  const asyncUserBrokerBound = useSetAtom(asyncUserBrokerBoundAtom(address))

  const bindBrokerFunc = async () => {
    const toast = window.toast.loading('binding...')

    const data = await bindingYourBroker<{ code: number }>({ trader: address, brokerId })

    if (data.code === 0) {
      // succeed
      void (await asyncUserBrokerBound())
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

    if (userBrokerBound?.broker) {
      history.push('/broker')
    } else {
      const { data } = await getBrokerInfoWithBrokerId<{ data: Rec[] }>(brokerId)

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
    if (userBrokerBound !== undefined) void brokerInfoFunc()
  }, [userBrokerBound])

  return infoLoaded ? <Spinner fixed /> : <BrokerCard broker={brokerInfo} />
}

export default BrokerInfo
